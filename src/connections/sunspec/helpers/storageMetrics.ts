import {
    numberWithPow10,
    numberNullableWithPow10,
} from '../../../helpers/number.js';
import { type StorageModel } from '../models/storage.js';

export function getStorageMetrics(storage: StorageModel) {
    return {
        WChaMax: numberWithPow10(storage.WChaMax, storage.WChaMax_SF),
        WChaGra: numberWithPow10(storage.WChaGra, storage.WChaDisChaGra_SF),
        WDisChaGra: numberWithPow10(
            storage.WDisChaGra,
            storage.WChaDisChaGra_SF,
        ),
        StorCtl_Mod: storage.StorCtl_Mod,
        VAChaMax: storage.VAChaMax_SF
            ? numberNullableWithPow10(storage.VAChaMax, storage.VAChaMax_SF)
            : null,
        MinRsvPct: storage.MinRsvPct_SF
            ? numberNullableWithPow10(storage.MinRsvPct, storage.MinRsvPct_SF)
            : null,
        ChaState: storage.ChaState_SF
            ? numberNullableWithPow10(storage.ChaState, storage.ChaState_SF)
            : null,
        StorAval: storage.StorAval_SF
            ? numberNullableWithPow10(storage.StorAval, storage.StorAval_SF)
            : null,
        InBatV: storage.InBatV_SF
            ? numberNullableWithPow10(storage.InBatV, storage.InBatV_SF)
            : null,
        ChaSt: storage.ChaSt,
        OutWRte: storage.InOutWRte_SF
            ? numberNullableWithPow10(storage.OutWRte, storage.InOutWRte_SF)
            : null,
        InWRte: storage.InOutWRte_SF
            ? numberNullableWithPow10(storage.InWRte, storage.InOutWRte_SF)
            : null,
        InOutWRte_WinTms: storage.InOutWRte_WinTms,
        InOutWRte_RvrtTms: storage.InOutWRte_RvrtTms,
        InOutWRte_RmpTms: storage.InOutWRte_RmpTms,
        ChaGriSet: storage.ChaGriSet,
    };
}
