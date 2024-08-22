import type { Logger } from 'pino';
import type { SEP2Client } from '../client';
import type { DERControl } from '../models/derControl';
import { logger as pinoLogger } from '../../helpers/logger';
import { ResponseStatus } from '../models/derControlResponse';
import { generateDerControlResponse } from '../models/derControlResponse';
import { objectToXml } from './xml';
import { ResponseRequiredType } from '../models/responseRequired';

export class DerControlResponseHelper {
    private client: SEP2Client;
    private logger: Logger;

    constructor({ client }: { client: SEP2Client }) {
        this.client = client;
        this.logger = pinoLogger.child({ module: 'DerControlResponseHelper' });
    }

    public async respondDerControl({
        derControl,
        status,
    }: {
        derControl: DERControl;
        status: ResponseStatus;
    }) {
        // if the DERControl does not require any response, we do not respond
        if (derControl.responseRequired === (0 as ResponseRequiredType)) {
            return;
        }

        // if the DERControl only wants message received events
        // and we're sending anything other than EventReceived, we do not respond
        if (
            derControl.responseRequired ===
                ResponseRequiredType.MessageReceived &&
            status !== ResponseStatus.EventReceived
        ) {
            return;
        }

        // if the DERControl does not have a reply to URL
        if (!derControl.replyToHref) {
            return;
        }

        const response = generateDerControlResponse({
            createdDateTime: new Date(),
            endDeviceLFDI: this.client.lfdi,
            status,
            subject: derControl.mRID,
        });

        this.logger.debug(
            { derControl, response },
            'sending DER Control response',
        );

        const xml = objectToXml(response);

        await this.client.post(derControl.replyToHref, xml);
    }
}
