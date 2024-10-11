import EventEmitter from 'node:events';
import type { SEP2Client } from '../client.js';
import { defaultPollPushRates } from '../client.js';
import { PollableResource } from './pollableResource.js';
import {
    parseFunctionSetAssignmentsListXml,
    type FunctionSetAssignmentsList,
} from '../models/functionSetAssignmentsList.js';
import { getListAll } from './pagination.js';
import type { DerProgramListData } from './derProgramList.js';
import {
    derProgramListDataSchema,
    DerProgramListHelper,
} from './derProgramList.js';
import {
    functionSetAssignmentsSchema,
    type FunctionSetAssignments,
} from '../models/functionSetAssignments.js';
import { z } from 'zod';
import { createFileCache } from '../../helpers/fileCache.js';

export const functionSetAssignmentsListDataSchema = z.array(
    z.object({
        functionSetAssignments: functionSetAssignmentsSchema,
        derProgramList: derProgramListDataSchema.nullable(),
    }),
);

export type FunctionSetAssignmentsListData = z.infer<
    typeof functionSetAssignmentsListDataSchema
>;

const functionSetAssignmentsListCache = createFileCache({
    filename: 'functionSetAssignmentsList',
    schema: functionSetAssignmentsListDataSchema,
});

export class FunctionSetAssignmentsListHelper extends EventEmitter<{
    data: [FunctionSetAssignmentsListData];
}> {
    private href: string | null = null;
    private client: SEP2Client;
    private functionSetAssignmentsListPollableResource: FunctionSetAssignmentsListPollableResource | null =
        null;
    private dataByFunctionSetAssignmentsMrid = new Map<
        string,
        {
            functionSetAssignments: FunctionSetAssignments;
            derProgramListHelper: DerProgramListHelper;
            derProgramList: DerProgramListData | null;
        }
    >();

    constructor({ client }: { client: SEP2Client }) {
        super();

        this.client = client;

        const cachedData = functionSetAssignmentsListCache.get();

        if (cachedData) {
            this.emit('data', cachedData);
        }
    }

    updateHref({ href }: { href: string }) {
        if (this.href !== href) {
            this.href = href;

            this.destroy();

            this.functionSetAssignmentsListPollableResource =
                new FunctionSetAssignmentsListPollableResource({
                    client: this.client,
                    url: href,
                    defaultPollRateSeconds:
                        defaultPollPushRates.functionSetAssignmentsListPoll,
                }).on('data', (data) => {
                    // create/update functionSetAssignments from the list
                    for (const functionSetAssignments of data.functionSetAssignments) {
                        const existingFunctionSetAssignments =
                            this.dataByFunctionSetAssignmentsMrid.get(
                                functionSetAssignments.mRID,
                            );

                        if (!functionSetAssignments.derProgramListLink) {
                            return;
                        }

                        // update
                        if (existingFunctionSetAssignments) {
                            existingFunctionSetAssignments.functionSetAssignments =
                                functionSetAssignments;

                            existingFunctionSetAssignments.derProgramListHelper.updateHref(
                                {
                                    href: functionSetAssignments
                                        .derProgramListLink.href,
                                },
                            );

                            continue;
                        }

                        // create
                        this.dataByFunctionSetAssignmentsMrid.set(
                            functionSetAssignments.mRID,
                            {
                                functionSetAssignments,
                                derProgramListHelper: new DerProgramListHelper({
                                    client: this.client,
                                })
                                    .updateHref({
                                        href: functionSetAssignments
                                            .derProgramListLink.href,
                                    })
                                    .on('data', (data) => {
                                        const fsa =
                                            this.dataByFunctionSetAssignmentsMrid.get(
                                                functionSetAssignments.mRID,
                                            );

                                        if (!fsa) {
                                            throw new Error(
                                                'Function set assignments could not be found',
                                            );
                                        }

                                        fsa.derProgramList = data;

                                        // emit data if DerProgramList is polled
                                        this.cacheAndEmitData();
                                    }),
                                derProgramList: null,
                            },
                        );
                    }

                    // remove functionSetAssignments no longer in the list
                    const deletedDerProgramListMrids = [
                        ...this.dataByFunctionSetAssignmentsMrid.keys(),
                    ].filter(
                        (mrid) =>
                            !data.functionSetAssignments.find(
                                (functionSetAssignment) =>
                                    functionSetAssignment.mRID === mrid,
                            ),
                    );

                    for (const mrid of deletedDerProgramListMrids) {
                        const fsa =
                            this.dataByFunctionSetAssignmentsMrid.get(mrid);

                        if (!fsa) {
                            throw new Error(
                                'Function set assignments could not be found',
                            );
                        }

                        fsa.derProgramListHelper.destroy();

                        this.dataByFunctionSetAssignmentsMrid.delete(mrid);
                    }

                    // emit data if FunctionSetAssignmentsList is polled
                    this.cacheAndEmitData();
                });
        }

        return this;
    }

    public destroy() {
        this.functionSetAssignmentsListPollableResource?.destroy();
    }

    private cacheAndEmitData() {
        const data = [...this.dataByFunctionSetAssignmentsMrid.values()].map(
            ({ functionSetAssignments, derProgramList }) => ({
                functionSetAssignments,
                derProgramList,
            }),
        );

        functionSetAssignmentsListCache.set(data);

        this.emit('data', data);
    }
}

class FunctionSetAssignmentsListPollableResource extends PollableResource<FunctionSetAssignmentsList> {
    async get({ client, url }: { client: SEP2Client; url: string }) {
        return getListAll({
            client,
            url,
            parseXml: parseFunctionSetAssignmentsListXml,
            addItems: (allResults, result) => {
                allResults.functionSetAssignments.push(
                    ...result.functionSetAssignments,
                );
            },
            getItems: (result) => result.functionSetAssignments,
        });
    }
}
