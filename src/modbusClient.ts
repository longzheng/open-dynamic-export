import ModbusRTU from 'modbus-serial';

export class ModbusClient {
    private client: ModbusRTU;

    constructor(host: string, port: number) {
        this.client = new ModbusRTU();
        this.client.connectTCP(host, { port });
        this.client.setID(1);
    }

    public async setExportLimit(limit: number): Promise<void> {
        // Example function to write to a holding register
        await this.client.writeRegister(40001, limit);
    }

    public async setImportLimit(limit: number): Promise<void> {
        // Example function to write to a holding register
        await this.client.writeRegister(40002, limit);
    }

    // Add other Modbus interactions as needed
}
