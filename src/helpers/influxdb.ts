import { InfluxDB } from '@influxdata/influxdb-client';

const influxDB = new InfluxDB({
    url: 'http://influxdb:8086',
    token: 'MyInitialAdminToken0==',
});

export const influxDbWriteApi = influxDB.getWriteApi(
    'open-dynamic-export',
    'data',
);
