import EventEmitter from 'node:events';
import type { SEP2Client } from '../client.js';
import { defaultPollPushRates } from '../client.js';
import { PollableResource } from './pollableResource.js';
import {
    parseDerProgramListXml,
    type DERProgramList,
} from '../models/derProgramList.js';
import { getListAll } from './pagination.js';
import type { DERProgram } from '../models/derProgram.js';
import {
    parseDefaultDERControlXml,
    type DefaultDERControl,
} from '../models/defaultDerControl.js';
import { parseDerControlListXml } from '../models/derControlList.js';
import type { DERControl } from '../models/derControl.js';

export type DerProgramListData = {
    program: DERProgram;
    defaultDerControl: DefaultDERControl | undefined;
    derControls: DERControl[] | undefined;
}[];

export class DerProgramListHelper extends EventEmitter<{
    data: [DerProgramListData];
}> {
    private href: string | null = null;
    private client: SEP2Client;
    private derProgramListPollableResource: DerProgramListPollableResource | null =
        null;

    constructor({ client }: { client: SEP2Client }) {
        super();

        this.client = client;
    }

    updateHref({ href }: { href: string }) {
        if (this.href !== href) {
            this.href = href;

            this.destroy();

            this.derProgramListPollableResource =
                new DerProgramListPollableResource({
                    client: this.client,
                    url: href,
                    defaultPollRateSeconds:
                        defaultPollPushRates.functionSetAssignmentsListPoll,
                }).on('data', (data) => {
                    void (async () => {
                        const result: DerProgramListData = [];

                        for (const program of data.derPrograms) {
                            const defaultDerControl =
                                program.defaultDerControlLink
                                    ? parseDefaultDERControlXml(
                                          await this.client.get(
                                              program.defaultDerControlLink
                                                  .href,
                                          ),
                                      )
                                    : undefined;

                            const derControlList = program.derControlListLink
                                ? await getListAll({
                                      client: this.client,
                                      url: program.derControlListLink.href,
                                      parseXml: parseDerControlListXml,
                                      addItems: (allResults, result) => {
                                          allResults.derControls.push(
                                              ...result.derControls,
                                          );
                                      },
                                      getItems: (result) => result.derControls,
                                  })
                                : undefined;

                            result.push({
                                program,
                                defaultDerControl,
                                derControls: derControlList?.derControls,
                            });
                        }

                        this.emit('data', result);
                    })();
                });
        }

        return this;
    }

    public destroy() {
        this.derProgramListPollableResource?.destroy();
    }
}

class DerProgramListPollableResource extends PollableResource<DERProgramList> {
    async get({ client, url }: { client: SEP2Client; url: string }) {
        return getListAll({
            client,
            url,
            parseXml: parseDerProgramListXml,
            addItems: (allResults, result) => {
                allResults.derPrograms.push(...result.derPrograms);
            },
            getItems: (result) => result.derPrograms,
        });
    }
}
