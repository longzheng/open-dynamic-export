import EventEmitter from 'node:events';
import { type SEP2Client } from '../client.js';
import { defaultPollPushRates } from '../client.js';
import { PollableResource } from './pollableResource.js';
import {
    parseDerProgramListXml,
    type DERProgramList,
} from '../models/derProgramList.js';
import { getListAll } from './pagination.js';
import { derProgramSchema } from '../models/derProgram.js';
import {
    defaultDERControlSchema,
    parseDefaultDERControlXml,
} from '../models/defaultDerControl.js';
import { parseDerControlListXml } from '../models/derControlList.js';
import { derControlSchema } from '../models/derControl.js';
import { z } from 'zod';
import { type Logger } from 'pino';
import { pinoLogger } from '../../helpers/logger.js';

export const derProgramListDataSchema = z.array(
    z.object({
        program: derProgramSchema,
        defaultDerControl: defaultDERControlSchema.optional(),
        derControls: derControlSchema.array().optional(),
    }),
);

export type DerProgramListData = z.infer<typeof derProgramListDataSchema>;

export class DerProgramListHelper extends EventEmitter<{
    data: [DerProgramListData];
}> {
    private href: string | null = null;
    private client: SEP2Client;
    private derProgramListPollableResource: DerProgramListPollableResource | null =
        null;
    private logger: Logger;
    private abortController: AbortController;

    constructor({ client }: { client: SEP2Client }) {
        super();

        this.client = client;
        this.logger = pinoLogger.child({
            module: 'DerProgramListHelper',
        });
        this.abortController = new AbortController();
    }

    updateHref({ href }: { href: string }) {
        if (this.href !== href) {
            this.href = href;

            this.derProgramListPollableResource?.destroy();

            this.derProgramListPollableResource =
                new DerProgramListPollableResource({
                    client: this.client,
                    url: href,
                    defaultPollRateSeconds:
                        defaultPollPushRates.functionSetAssignmentsListPoll,
                }).on('data', (data) => {
                    void (async () => {
                        // this function calls SEP2Client requests directly (without polling)
                        // it has been observed some CSIP utility servers will randomly error consistently (and exceed the retry limit)
                        // in this scenario the application will crash since we await DefaultDerControl and DerControlList data
                        // however we can safely ignore these errors since the data will be requested again on the next poll of DerProgramList
                        try {
                            const result: DerProgramListData = [];

                            for (const program of data.derPrograms) {
                                const defaultDerControl =
                                    program.defaultDerControlLink
                                        ? parseDefaultDERControlXml(
                                              await this.client.get(
                                                  program.defaultDerControlLink
                                                      .href,
                                                  {
                                                      signal: this
                                                          .abortController
                                                          .signal,
                                                  },
                                              ),
                                          )
                                        : undefined;

                                const derControlList =
                                    program.derControlListLink
                                        ? await getListAll({
                                              client: this.client,
                                              url: program.derControlListLink
                                                  .href,
                                              options: {
                                                  signal: this.abortController
                                                      .signal,
                                              },
                                              parseXml: parseDerControlListXml,
                                              addItems: (
                                                  allResults,
                                                  result,
                                              ) => {
                                                  allResults.derControls.push(
                                                      ...result.derControls,
                                                  );
                                              },
                                              getItems: (result) =>
                                                  result.derControls,
                                          })
                                        : undefined;

                                result.push({
                                    program,
                                    defaultDerControl,
                                    derControls: derControlList?.derControls,
                                });
                            }

                            this.emit('data', result);
                        } catch (error) {
                            this.logger.error(
                                error,
                                'Error processing DerProgramList data',
                            );
                        }
                    })();
                });
        }

        return this;
    }

    public destroy() {
        this.abortController.abort();
        this.derProgramListPollableResource?.destroy();
    }
}

class DerProgramListPollableResource extends PollableResource<DERProgramList> {
    async get({
        client,
        url,
        signal,
    }: {
        client: SEP2Client;
        url: string;
        signal: AbortSignal;
    }) {
        return getListAll({
            client,
            url,
            options: { signal },
            parseXml: parseDerProgramListXml,
            addItems: (allResults, result) => {
                allResults.derPrograms.push(...result.derPrograms);
            },
            getItems: (result) => result.derPrograms,
        });
    }
}
