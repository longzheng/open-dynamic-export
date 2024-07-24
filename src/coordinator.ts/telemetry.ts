type PerPhaseMeasurement = {
    phaseA: number;
    phaseB?: number;
    phaseC?: number;
};

type Telemetry = {
    realPower: {
        site: PerPhaseMeasurement;
        der: PerPhaseMeasurement;
    };
    reactivePower: {
        site: PerPhaseMeasurement;
        der: PerPhaseMeasurement;
    };
    voltage: {
        site: PerPhaseMeasurement;
        der: PerPhaseMeasurement;
    };
    frequency: {
        site: number;
        der: number;
    };
};
