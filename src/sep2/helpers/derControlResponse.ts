import { type Logger } from 'pino';
import { type SEP2Client } from '../client.js';
import { pinoLogger } from '../../helpers/logger.js';
import { generateDerControlResponse } from '../models/derControlResponse.js';
import { objectToXml } from './xml.js';
import { ResponseRequiredType } from '../models/responseRequired.js';
import { CappedArrayStack } from '../../helpers/cappedArrayStack.js';
import deepEqual from 'fast-deep-equal';
import { ResponseStatus } from '../models/responseStatus.js';
import { type AxiosRequestConfig } from 'axios';

type HistoryKey = {
    mRID: string;
    status: ResponseStatus;
};

export class DerControlResponseHelper {
    private client: SEP2Client;
    private logger: Logger;

    // to simplify responding to DERControl events, we don't want to write complex logic to figure out if the schedule has changed or not (to handle complex changes like event superseded)
    // instead we'll just keep a history of all the recent Responses we've sent and deduplicate them
    private responseHistoryStack = new CappedArrayStack<HistoryKey>({
        limit: 1000,
    });

    constructor({ client }: { client: SEP2Client }) {
        this.client = client;
        this.logger = pinoLogger.child({ module: 'DerControlResponseHelper' });
    }

    public async respondDerControl({
        responseRequired,
        replyToHref,
        mRID,
        status,
        requestConfig,
    }: {
        responseRequired: ResponseRequiredType;
        replyToHref: string | undefined;
        mRID: string;
        status: ResponseStatus;
        requestConfig?: AxiosRequestConfig;
    }) {
        // if the DERControl does not require any response, we do not respond
        if (responseRequired === (0 as ResponseRequiredType)) {
            return;
        }

        // if the DERControl only wants message received events
        // and we're sending anything other than EventReceived, we do not respond
        if (
            responseRequired === ResponseRequiredType.MessageReceived &&
            status !== ResponseStatus.EventReceived
        ) {
            return;
        }

        // if the DERControl does not have a reply to URL
        if (!replyToHref) {
            return;
        }

        const historyKey: HistoryKey = { mRID, status };

        // if we've already sent the same response, don't send it again
        if (
            this.responseHistoryStack
                .get()
                .some((response) => deepEqual(response, historyKey))
        ) {
            return;
        }

        this.responseHistoryStack.push(historyKey);

        const response = generateDerControlResponse({
            createdDateTime: new Date(),
            endDeviceLFDI: this.client.lfdi,
            status,
            subject: mRID,
        });

        this.logger.debug(
            { controlMRID: mRID, responseRequired, replyToHref, response },
            'Sending DERControl response',
        );

        const xml = objectToXml(response);

        try {
            await this.client.post(replyToHref, xml, requestConfig);
        } catch (error) {
            this.logger.error(
                {
                    error,
                    mRID,
                    status,
                    response,
                },
                'Failed to send DERControl response',
            );
        }
    }
}
