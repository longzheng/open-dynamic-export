import { averageNumbersArray, numberWithPow10 } from '../../number';
import { WMaxLim_Ena, type ControlsModel } from '../models/controls';

export function getAveragePowerRatio(controls: ControlsModel[]) {
    return averageNumbersArray(
        controls.map((control) => {
            // if the WMaxLim_Ena is not enabled
            // ignore whatever the current value is and assume it is 100%
            if (control.WMaxLim_Ena !== WMaxLim_Ena.ENABLED) {
                return 1;
            }
            return (
                // the value is expressed from 0-100, divide to get ratio
                numberWithPow10(control.WMaxLimPct, control.WMaxLimPct_SF) / 100
            );
        }),
    );
}
