import { ModbusConnection } from './base.js';
import {
    SmaCore1MeteringGridMsModel1,
    SmaCore1MeteringGridMsModel2,
} from '../models/smaCore1MeteringGridMs.js';
import type { SmaCore1Nameplate } from '../models/smaCore1Nameplate.js';
import { smaCore1NameplateModel } from '../models/smaCore1Nameplate.js';
import {
    SmaCore1GridMsModel1,
    SmaCore1GridMsModel2,
    SmaCore1GridMsModel3,
} from '../models/smaCore1GridMs.js';

export class SmaConnection extends ModbusConnection {
    // the nameplate model should never change so we can cache it
    private nameplateModelCache: SmaCore1Nameplate | null = null;

    async getGridMsModel() {
        const data1 = await SmaCore1GridMsModel1.read({
            modbusConnection: this,
            address: {
                start: 30775,
                length: 22,
            },
        });

        const data2 = await SmaCore1GridMsModel2.read({
            modbusConnection: this,
            address: {
                start: 30803,
                length: 2,
            },
        });

        const data3 = await SmaCore1GridMsModel3.read({
            modbusConnection: this,
            address: {
                start: 30807,
                length: 14,
            },
        });

        return { ...data1, ...data2, ...data3 };
    }

    async getNameplateModel() {
        if (this.nameplateModelCache) {
            return this.nameplateModelCache;
        }

        const data = await smaCore1NameplateModel.read({
            modbusConnection: this,
            address: {
                start: 30053,
                length: 2,
            },
        });

        this.nameplateModelCache = data;

        return data;
    }

    async getMeteringGridMsModel() {
        const data1 = await SmaCore1MeteringGridMsModel1.read({
            modbusConnection: this,
            address: {
                start: 31253,
                length: 26,
            },
        });

        const data2 = await SmaCore1MeteringGridMsModel2.read({
            modbusConnection: this,
            address: {
                start: 31433,
                length: 24,
            },
        });

        return { ...data1, ...data2 };
    }
}
