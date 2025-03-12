import { Card, CardHeader, CardBody, CardFooter } from '@nextui-org/card';
import { useNavigate } from '@tanstack/react-router';
import { type IconType } from 'react-icons/lib';
import { TbCircuitVoltmeter, TbPlug, TbSquareLetterQ } from 'react-icons/tb';
import { PiWaveSineBold } from 'react-icons/pi';
import { FormattedNumber } from 'react-intl';

export type ReadingLocation = 'site' | 'der' | 'load';

export const readingLocationMetadata: Record<
    ReadingLocation,
    { label: string; themeClassName: string }
> = {
    site: {
        label: 'Site',
        themeClassName: 'reading-site',
    },
    der: {
        label: 'DER',
        themeClassName: 'reading-der',
    },
    load: {
        label: 'Load',
        themeClassName: 'reading-load',
    },
};

export type ReadingType =
    | 'realPower'
    | 'voltage'
    | 'reactivePower'
    | 'frequency';

const readingTypeMetadata: Record<
    ReadingType,
    { label: string; Icon: IconType; unit: string }
> = {
    realPower: { label: 'Real Power', Icon: TbPlug, unit: 'W' },
    voltage: { label: 'Voltage', Icon: TbCircuitVoltmeter, unit: 'V' },
    reactivePower: {
        label: 'Reactive Power',
        Icon: TbSquareLetterQ,
        unit: 'VAR',
    },
    frequency: { label: 'Frequency', Icon: PiWaveSineBold, unit: 'Hz' },
};

export function ReadingCard({
    location,
    type,
    body,
    footer,
}: {
    location: ReadingLocation;
    type: ReadingType;
    body: ({ type }: { type: ReadingType }) => React.ReactNode;
    footer: React.ReactNode;
}) {
    const navigate = useNavigate();
    const TypeIcon = readingTypeMetadata[type].Icon;

    return (
        <Card
            isPressable
            className={readingLocationMetadata[location].themeClassName}
            onPress={() => {
                void navigate({ to: '/readings' });
            }}
        >
            <CardHeader className="">
                <div className="flex-1 text-start">
                    <p className="text-tiny font-bold uppercase text-primary/60">
                        {readingLocationMetadata[location].label}
                    </p>
                    <h4 className="text-medium font-medium text-white">
                        {readingTypeMetadata[type].label}
                    </h4>
                </div>
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/20 text-3xl text-primary">
                    <TypeIcon />
                </div>
            </CardHeader>
            <CardBody>{body({ type })}</CardBody>
            <CardFooter>{footer}</CardFooter>
        </Card>
    );
}

export function ReadingValueContainer({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="inline-flex items-baseline gap-1 text-3xl">
            {children}
        </div>
    );
}

export function ReadingValueUnit({ type }: { type: ReadingType }) {
    return (
        <span className="text-lg opacity-30">
            {readingTypeMetadata[type].unit}
        </span>
    );
}

export function ReadingPhases({
    value,
    maximumFractionDigits,
    minimumFractionDigits,
}: {
    value: {
        phaseA: number | null;
        phaseB: number | null;
        phaseC: number | null;
    };
    maximumFractionDigits?: number;
    minimumFractionDigits?: number;
}) {
    return (
        <div className="grid grid-cols-3 divide-x divide-foreground-200  text-start text-white/60">
            <div className="pe-3">
                <p className="text-tiny text-white/40">Phase A</p>
                <p className="flex gap-1 text-lg">
                    {value.phaseA !== null ? (
                        <>
                            <FormattedNumber
                                maximumFractionDigits={maximumFractionDigits}
                                minimumFractionDigits={minimumFractionDigits}
                                value={value.phaseA}
                            />
                        </>
                    ) : (
                        '-'
                    )}
                </p>
            </div>
            <div className="pe-3 ps-3">
                <p className="text-tiny text-white/40">Phase B</p>
                <p className="flex gap-1 text-lg">
                    {value.phaseB !== null ? (
                        <>
                            <FormattedNumber
                                maximumFractionDigits={maximumFractionDigits}
                                minimumFractionDigits={minimumFractionDigits}
                                value={value.phaseB}
                            />
                        </>
                    ) : (
                        '-'
                    )}
                </p>
            </div>
            <div className="ps-3">
                <p className="text-tiny text-white/40">Phase C</p>
                <p className="flex gap-1 text-lg">
                    {value.phaseC !== null ? (
                        <>
                            <FormattedNumber
                                maximumFractionDigits={maximumFractionDigits}
                                minimumFractionDigits={minimumFractionDigits}
                                value={value.phaseC}
                            />
                        </>
                    ) : (
                        '-'
                    )}
                </p>
            </div>
        </div>
    );
}
