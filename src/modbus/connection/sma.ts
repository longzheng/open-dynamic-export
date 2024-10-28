import type { ModbusConnection } from './base.js';
import type { SmaCore1MeteringGridMsModels } from '../models/sma/core1/meteringGridMs.js';
import {
    SmaCore1MeteringGridMs1Model,
    SmaCore1MeteringGridMs2Model,
} from '../models/sma/core1/meteringGridMs.js';
import type { SmaCore1Nameplate } from '../models/sma/core1/nameplate.js';
import { SmaCore1NameplateModel } from '../models/sma/core1/nameplate.js';
import type { SmaCore1GridMsModels } from '../models/sma/core1/gridMs.js';
import {
    SmaCore1GridMs1Model,
    SmaCore1GridMs2Model,
    SmaCore1GridMs3Model,
} from '../models/sma/core1/gridMs.js';
import type { SmaCore1Operation } from '../models/sma/core1/operation.js';
import { SmaCore1OperationModel } from '../models/sma/core1/operation.js';
import type { SmaCore1InverterModels } from '../models/sma/core1/inverter.js';
import {
    SmaCore1Inverter1Model,
    SmaCore1Inverter2Model,
} from '../models/sma/core1/inverter.js';
import type {
    SmaCore1InverterControl1,
    SmaCore1InverterControl2,
    SmaCore1InverterControlModels,
} from '../models/sma/core1/inverterControl.js';
import {
    SmaCore1InverterControl1Model,
    SmaCore1InverterControl2Model,
} from '../models/sma/core1/inverterControl.js';
import type { Logger } from 'pino';
import type { ModbusSchema } from '../../helpers/config.js';
import { getModbusConnection } from '../connections.js';

export class SmaConnection {
    protected readonly modbusConnection: ModbusConnection;
    protected readonly unitId: number;
    private logger: Logger;

    // the inverter model should never change so we can cache it
    private inverterModeLCache: SmaCore1InverterModels | null = null;

    // the nameplate model should never change so we can cache it
    private nameplateModelCache: SmaCore1Nameplate | null = null;

    constructor({ connection, unitId }: ModbusSchema) {
        this.modbusConnection = getModbusConnection(connection);
        this.unitId = unitId;
        this.logger = this.modbusConnection.logger.child({
            module: 'SmaConnection',
            unitId,
        });
    }

    async getInverterModel(): Promise<SmaCore1InverterModels> {
        if (this.inverterModeLCache) {
            return this.inverterModeLCache;
        }

        const model1 = await SmaCore1Inverter1Model.read({
            modbusConnection: this.modbusConnection,
            address: {
                start: 30231,
                length: 2,
            },
            unitId: this.unitId,
        });

        const model2 = await SmaCore1Inverter2Model.read({
            modbusConnection: this.modbusConnection,
            address: {
                start: 33025,
                length: 20,
            },
            unitId: this.unitId,
        });

        const data = { ...model1, ...model2 };

        this.inverterModeLCache = data;

        return data;
    }

    async getGridMsModel(): Promise<SmaCore1GridMsModels> {
        const model1 = await SmaCore1GridMs1Model.read({
            modbusConnection: this.modbusConnection,
            address: {
                start: 30775,
                length: 22,
            },
            unitId: this.unitId,
        });

        const model2 = await SmaCore1GridMs2Model.read({
            modbusConnection: this.modbusConnection,
            address: {
                start: 30803,
                length: 2,
            },
            unitId: this.unitId,
        });

        const model3 = await SmaCore1GridMs3Model.read({
            modbusConnection: this.modbusConnection,
            address: {
                start: 30807,
                length: 14,
            },
            unitId: this.unitId,
        });

        const data = { ...model1, ...model2, ...model3 };

        return data;
    }

    async getNameplateModel(): Promise<SmaCore1Nameplate> {
        if (this.nameplateModelCache) {
            return this.nameplateModelCache;
        }

        const data = await SmaCore1NameplateModel.read({
            modbusConnection: this.modbusConnection,
            address: {
                start: 30053,
                length: 2,
            },
            unitId: this.unitId,
        });

        this.nameplateModelCache = data;

        return data;
    }

    async getOperationModel(): Promise<SmaCore1Operation> {
        const data = await SmaCore1OperationModel.read({
            modbusConnection: this.modbusConnection,
            address: {
                start: 30217,
                length: 2,
            },
            unitId: this.unitId,
        });

        return data;
    }

    async getMeteringGridMsModel(): Promise<SmaCore1MeteringGridMsModels> {
        const model1 = await SmaCore1MeteringGridMs1Model.read({
            modbusConnection: this.modbusConnection,
            address: {
                start: 31253,
                length: 26,
            },
            unitId: this.unitId,
        });

        const model2 = await SmaCore1MeteringGridMs2Model.read({
            modbusConnection: this.modbusConnection,
            address: {
                start: 31433,
                length: 24,
            },
            unitId: this.unitId,
        });

        const data = { ...model1, ...model2 };

        return data;
    }

    async getInverterControlModel(): Promise<SmaCore1InverterControlModels> {
        const model1 = await SmaCore1InverterControl1Model.read({
            modbusConnection: this.modbusConnection,
            address: {
                start: 40210,
                length: 2,
            },
            unitId: this.unitId,
        });

        const model2 = await SmaCore1InverterControl2Model.read({
            modbusConnection: this.modbusConnection,
            address: {
                start: 41253,
                length: 3,
            },
            unitId: this.unitId,
        });

        const data = { ...model1, ...model2 };

        return data;
    }

    // SMA does not recommend writing to this register frequently
    // Warning against cyclical writing - Cyclic modification of these parameters may destroy the flash memory of the product
    async writeInverterControlModel1(values: SmaCore1InverterControl1) {
        return await SmaCore1InverterControl1Model.write({
            modbusConnection: this.modbusConnection,
            address: {
                start: 40210,
                length: 2,
            },
            unitId: this.unitId,
            values,
        });
    }

    async writeInverterControlModel2(values: SmaCore1InverterControl2) {
        return await SmaCore1InverterControl2Model.write({
            modbusConnection: this.modbusConnection,
            address: {
                start: 41253,
                length: 3,
            },
            unitId: this.unitId,
            values,
        });
    }

    public onDestroy(): void {
        this.modbusConnection.close();
    }
}
