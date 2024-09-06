import EventEmitter from 'node:events';
import type { EndDevice } from '../models/endDevice';
import type { SEP2Client } from '../client';

export class EndDeviceHelper extends EventEmitter<{
    data: [EndDevice];
}> {
    private href: string | null = null;
    private client: SEP2Client;
    private endDeviceListPollableResource: EndDeviceListPollableResource | null =
        null;

    constructor({ client }: { client: SEP2Client }) {
        super();

        this.client = client;
    }
}
