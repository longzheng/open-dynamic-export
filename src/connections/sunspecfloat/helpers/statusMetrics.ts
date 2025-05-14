import { numberWithPow10 } from '../../../helpers/number.js';
import { type StatusModel } from '../models/status.js';

export function getStatusMetrics(status: StatusModel) {
    return {
        PVConn: status.PVConn,
        StorConn: status.StorConn,
        ECPConn: status.ECPConn,
        ActWh: status.ActWh,
        ActVAh: status.ActVAh,
        ActVArhQ1: status.ActVArhQ1,
        ActVArhQ2: status.ActVArhQ2,
        ActVArhQ3: status.ActVArhQ3,
        ActVArhQ4: status.ActVArhQ4,
        VArAval:
            status.VArAval && status.VArAval_SF
                ? numberWithPow10(status.VArAval, status.VArAval_SF)
                : null,
        WAval:
            status.WAval && status.WAval_SF
                ? numberWithPow10(status.WAval, status.WAval_SF)
                : null,
    };
}
