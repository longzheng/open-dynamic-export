import { InfluxDB } from '@influxdata/influxdb-client';

const influxDB = new InfluxDB({
    url: `http://influxdb:${process.env['INFLUXDB_PORT']}`,
    token: process.env['INFLUXDB_ADMIN_TOKEN'],
});

export const influxDbWriteApi = influxDB.getWriteApi(
    process.env['INFLUXDB_ORG']!,
    process.env['INFLUXDB_BUCKET']!,
);
