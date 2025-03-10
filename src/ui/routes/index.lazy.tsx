import { Card, CardHeader, CardBody, CardFooter } from '@nextui-org/card';
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router';
import { clsx } from 'clsx';
import { FormattedNumber } from 'react-intl';

import { title } from '@/components/primitives';
import { useCoordinatorStatus } from '@/gen/hooks';
import { type InverterControlTypes } from '@/gen/types';
import {
    ReadingCard,
    ReadingPhases,
    ReadingValueContainer,
    ReadingValueUnit,
} from '@/components/reading';

export const Route = createLazyFileRoute('/')({
    component: Index,
});

function Index() {
    const { data: coordinatorStatus } = useCoordinatorStatus({
        query: { refetchInterval: 1000 },
    });

    if (!coordinatorStatus?.running) {
        return null;
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className={clsx(title())}>Readings</h2>
            </div>
            <section className="grid gap-4 lg:grid-cols-4">
                <ReadingCard
                    body={({ type }) => (
                        <>
                            <ReadingValueContainer>
                                {coordinatorStatus.siteSample?.realPower.net !==
                                undefined ? (
                                    <>
                                        <span
                                            className={clsx(
                                                coordinatorStatus.siteSample
                                                    .realPower.net < 0
                                                    ? 'text-green-300'
                                                    : 'text-orange-300',
                                            )}
                                        >
                                            <FormattedNumber
                                                maximumFractionDigits={0}
                                                value={
                                                    coordinatorStatus.siteSample
                                                        .realPower.net
                                                }
                                            />
                                        </span>
                                        <ReadingValueUnit type={type} />
                                    </>
                                ) : (
                                    '-'
                                )}
                            </ReadingValueContainer>
                            <p>
                                {coordinatorStatus.siteSample?.realPower.net !==
                                undefined ? (
                                    <span
                                        className={clsx(
                                            coordinatorStatus.siteSample
                                                .realPower.net < 0
                                                ? 'text-green-300'
                                                : 'text-orange-300',
                                        )}
                                    >
                                        {coordinatorStatus.siteSample.realPower
                                            .net < 0
                                            ? 'Export'
                                            : 'Import'}
                                    </span>
                                ) : (
                                    <>&nbsp;</>
                                )}
                            </p>
                        </>
                    )}
                    footer={
                        <>
                            {coordinatorStatus.siteSample?.realPower !==
                                undefined &&
                            coordinatorStatus.siteSample.realPower.type ===
                                'perPhaseNet' ? (
                                <ReadingPhases
                                    maximumFractionDigits={0}
                                    value={
                                        coordinatorStatus.siteSample.realPower
                                    }
                                />
                            ) : null}
                        </>
                    }
                    location="site"
                    type="realPower"
                />
                <ReadingCard
                    body={({ type }) => (
                        <>
                            <ReadingValueContainer>
                                {coordinatorStatus.siteSample?.realPower.net !==
                                undefined ? (
                                    <>
                                        <FormattedNumber
                                            maximumFractionDigits={1}
                                            minimumFractionDigits={1}
                                            value={(() => {
                                                const nonNullableVoltages = [
                                                    coordinatorStatus.siteSample
                                                        .voltage.phaseA,
                                                    coordinatorStatus.siteSample
                                                        .voltage.phaseB,
                                                    coordinatorStatus.siteSample
                                                        .voltage.phaseC,
                                                ].filter(
                                                    (voltage) =>
                                                        voltage !== null,
                                                );

                                                return (
                                                    nonNullableVoltages.reduce(
                                                        (acc, voltage) =>
                                                            acc + voltage,
                                                        0,
                                                    ) /
                                                    nonNullableVoltages.length
                                                );
                                            })()}
                                        />
                                        <ReadingValueUnit type={type} />
                                    </>
                                ) : (
                                    '-'
                                )}
                            </ReadingValueContainer>
                        </>
                    )}
                    footer={
                        <>
                            {coordinatorStatus.siteSample?.voltage !==
                            undefined ? (
                                <ReadingPhases
                                    maximumFractionDigits={1}
                                    minimumFractionDigits={1}
                                    value={coordinatorStatus.siteSample.voltage}
                                />
                            ) : null}
                        </>
                    }
                    location="site"
                    type="voltage"
                />
                <ReadingCard
                    body={({ type }) => (
                        <>
                            <ReadingValueContainer>
                                {coordinatorStatus.siteSample?.reactivePower
                                    .net !== undefined ? (
                                    <>
                                        <FormattedNumber
                                            maximumFractionDigits={0}
                                            value={
                                                coordinatorStatus.siteSample
                                                    .reactivePower.net
                                            }
                                        />
                                        <ReadingValueUnit type={type} />
                                    </>
                                ) : (
                                    '-'
                                )}
                            </ReadingValueContainer>
                            {coordinatorStatus.siteSample?.reactivePower.net ? (
                                <p>
                                    {coordinatorStatus.siteSample.reactivePower
                                        .net < 0
                                        ? 'Supplying'
                                        : 'Consuming'}
                                </p>
                            ) : null}
                        </>
                    )}
                    footer={
                        <>
                            {coordinatorStatus.siteSample?.reactivePower !==
                                undefined &&
                            coordinatorStatus.siteSample.reactivePower.type ===
                                'perPhaseNet' ? (
                                <ReadingPhases
                                    maximumFractionDigits={0}
                                    value={
                                        coordinatorStatus.siteSample
                                            .reactivePower
                                    }
                                />
                            ) : null}
                        </>
                    }
                    location="site"
                    type="reactivePower"
                />
                <ReadingCard
                    body={({ type }) => (
                        <>
                            <ReadingValueContainer>
                                {coordinatorStatus.siteSample?.frequency !==
                                    undefined &&
                                coordinatorStatus.siteSample.frequency !==
                                    null ? (
                                    <>
                                        <FormattedNumber
                                            maximumFractionDigits={2}
                                            minimumFractionDigits={2}
                                            value={
                                                coordinatorStatus.siteSample
                                                    .frequency
                                            }
                                        />
                                        <ReadingValueUnit type={type} />
                                    </>
                                ) : (
                                    '-'
                                )}
                            </ReadingValueContainer>
                        </>
                    )}
                    footer={null}
                    location="site"
                    type="frequency"
                />
                <ReadingCard
                    body={({ type }) => (
                        <>
                            <ReadingValueContainer>
                                {coordinatorStatus.derSample?.realPower.net !==
                                undefined ? (
                                    <>
                                        <FormattedNumber
                                            maximumFractionDigits={0}
                                            value={
                                                coordinatorStatus.derSample
                                                    .realPower.net
                                            }
                                        />
                                        <ReadingValueUnit type={type} />
                                    </>
                                ) : (
                                    '-'
                                )}
                            </ReadingValueContainer>
                            <p>
                                {coordinatorStatus.derSample?.nameplate ? (
                                    <span className="opacity-30">
                                        <FormattedNumber
                                            maximumFractionDigits={0}
                                            value={
                                                coordinatorStatus.derSample
                                                    .nameplate.maxW
                                            }
                                        />
                                        w
                                    </span>
                                ) : (
                                    <>&nbsp;</>
                                )}
                            </p>
                        </>
                    )}
                    footer={
                        <>
                            {coordinatorStatus.derSample?.realPower !==
                                undefined &&
                            coordinatorStatus.derSample.realPower.type ===
                                'perPhaseNet' ? (
                                <ReadingPhases
                                    maximumFractionDigits={0}
                                    value={
                                        coordinatorStatus.derSample.realPower
                                    }
                                />
                            ) : null}
                        </>
                    }
                    location="der"
                    type="realPower"
                />
                <ReadingCard
                    body={({ type }) => (
                        <>
                            <ReadingValueContainer>
                                {coordinatorStatus.derSample?.voltage !==
                                    undefined &&
                                coordinatorStatus.derSample.voltage !== null ? (
                                    <>
                                        <FormattedNumber
                                            maximumFractionDigits={1}
                                            minimumFractionDigits={1}
                                            value={(() => {
                                                const nonNullableVoltages = [
                                                    coordinatorStatus.derSample
                                                        .voltage.phaseA,
                                                    coordinatorStatus.derSample
                                                        .voltage.phaseB,
                                                    coordinatorStatus.derSample
                                                        .voltage.phaseC,
                                                ].filter(
                                                    (voltage) =>
                                                        voltage !== null,
                                                );

                                                return (
                                                    nonNullableVoltages.reduce(
                                                        (acc, voltage) =>
                                                            acc + voltage,
                                                        0,
                                                    ) /
                                                    nonNullableVoltages.length
                                                );
                                            })()}
                                        />
                                        <ReadingValueUnit type={type} />
                                    </>
                                ) : (
                                    '-'
                                )}
                            </ReadingValueContainer>
                        </>
                    )}
                    footer={
                        <>
                            {coordinatorStatus.derSample?.voltage !==
                                undefined &&
                            coordinatorStatus.derSample.voltage !== null ? (
                                <ReadingPhases
                                    maximumFractionDigits={1}
                                    minimumFractionDigits={1}
                                    value={coordinatorStatus.derSample.voltage}
                                />
                            ) : null}
                        </>
                    }
                    location="der"
                    type="voltage"
                />
                <ReadingCard
                    body={({ type }) => (
                        <>
                            <ReadingValueContainer>
                                {coordinatorStatus.derSample?.reactivePower
                                    .net !== undefined ? (
                                    <>
                                        <FormattedNumber
                                            maximumFractionDigits={0}
                                            value={
                                                coordinatorStatus.derSample
                                                    .reactivePower.net
                                            }
                                        />
                                        <ReadingValueUnit type={type} />
                                    </>
                                ) : (
                                    '-'
                                )}
                            </ReadingValueContainer>
                            {coordinatorStatus.derSample?.reactivePower.net ? (
                                <p>
                                    {coordinatorStatus.derSample.reactivePower
                                        .net < 0
                                        ? 'Absorbing'
                                        : 'Injecting'}
                                </p>
                            ) : null}
                        </>
                    )}
                    footer={
                        <>
                            {coordinatorStatus.derSample?.reactivePower !==
                                undefined &&
                            coordinatorStatus.derSample.reactivePower.type ===
                                'perPhaseNet' ? (
                                <ReadingPhases
                                    maximumFractionDigits={0}
                                    value={
                                        coordinatorStatus.derSample
                                            .reactivePower
                                    }
                                />
                            ) : null}
                        </>
                    }
                    location="der"
                    type="reactivePower"
                />
                <ReadingCard
                    body={({ type }) => (
                        <>
                            <ReadingValueContainer>
                                {coordinatorStatus.derSample?.frequency !==
                                    undefined &&
                                coordinatorStatus.derSample.frequency !==
                                    null ? (
                                    <>
                                        <FormattedNumber
                                            maximumFractionDigits={2}
                                            minimumFractionDigits={2}
                                            value={
                                                coordinatorStatus.derSample
                                                    .frequency
                                            }
                                        />
                                        <ReadingValueUnit type={type} />
                                    </>
                                ) : (
                                    '-'
                                )}
                            </ReadingValueContainer>
                        </>
                    )}
                    footer={null}
                    location="der"
                    type="frequency"
                />
                <ReadingCard
                    body={({ type }) => (
                        <>
                            <ReadingValueContainer>
                                {coordinatorStatus.loadWatts ? (
                                    <>
                                        <FormattedNumber
                                            maximumFractionDigits={0}
                                            value={coordinatorStatus.loadWatts}
                                        />
                                        <ReadingValueUnit type={type} />
                                    </>
                                ) : (
                                    '-'
                                )}
                            </ReadingValueContainer>
                        </>
                    )}
                    footer={null}
                    location="load"
                    type="realPower"
                />
            </section>
            <div className="mb-6">
                <h2 className={clsx(title({}))}>Limits</h2>
            </div>
            <section className="grid grid-cols-4 gap-4">
                <LimitCard
                    body={
                        <p className="flex gap-1">
                            {coordinatorStatus.controlLimits &&
                            coordinatorStatus.controlLimits
                                .activeInverterControlLimit.opModConnect !==
                                undefined ? (
                                <>
                                    {coordinatorStatus.controlLimits
                                        .activeInverterControlLimit.opModConnect
                                        .value
                                        ? 'Connect'
                                        : 'Disconnect'}
                                </>
                            ) : (
                                '-'
                            )}
                        </p>
                    }
                    heading="Connection"
                    limit={
                        coordinatorStatus.controlLimits !== null &&
                        coordinatorStatus.controlLimits
                            .activeInverterControlLimit.opModConnect !==
                            undefined
                    }
                    source={
                        coordinatorStatus.controlLimits
                            ? coordinatorStatus.controlLimits
                                  .activeInverterControlLimit.opModConnect
                                  ?.source
                            : undefined
                    }
                />
                <LimitCard
                    body={
                        <p className="flex gap-1">
                            {coordinatorStatus.controlLimits &&
                            coordinatorStatus.controlLimits
                                .activeInverterControlLimit.opModEnergize !==
                                undefined ? (
                                <>
                                    {coordinatorStatus.controlLimits
                                        .activeInverterControlLimit
                                        .opModEnergize.value
                                        ? 'Energise'
                                        : 'De-energise'}
                                </>
                            ) : (
                                '-'
                            )}
                        </p>
                    }
                    heading="Energise"
                    limit={
                        coordinatorStatus.controlLimits !== null &&
                        coordinatorStatus.controlLimits
                            .activeInverterControlLimit.opModEnergize !==
                            undefined
                    }
                    source={
                        coordinatorStatus.controlLimits
                            ? coordinatorStatus.controlLimits
                                  .activeInverterControlLimit.opModEnergize
                                  ?.source
                            : undefined
                    }
                />
                <LimitCard
                    body={
                        <p className="flex gap-1">
                            {coordinatorStatus.controlLimits &&
                            coordinatorStatus.controlLimits
                                .activeInverterControlLimit.opModGenLimW ? (
                                <>
                                    <FormattedNumber
                                        maximumFractionDigits={0}
                                        value={
                                            coordinatorStatus.controlLimits
                                                .activeInverterControlLimit
                                                .opModGenLimW.value
                                        }
                                    />
                                    <span className="opacity-30">w</span>
                                </>
                            ) : (
                                '-'
                            )}
                        </p>
                    }
                    heading="Generation limit"
                    limit={
                        coordinatorStatus.controlLimits !== null &&
                        coordinatorStatus.controlLimits
                            .activeInverterControlLimit.opModGenLimW !==
                            undefined
                    }
                    source={
                        coordinatorStatus.controlLimits
                            ? coordinatorStatus.controlLimits
                                  .activeInverterControlLimit.opModGenLimW
                                  ?.source
                            : undefined
                    }
                />
                <LimitCard
                    body={
                        <p className="flex gap-1">
                            {coordinatorStatus.controlLimits &&
                            coordinatorStatus.controlLimits
                                .activeInverterControlLimit.opModExpLimW !==
                                undefined ? (
                                <>
                                    <FormattedNumber
                                        maximumFractionDigits={0}
                                        value={
                                            coordinatorStatus.controlLimits
                                                .activeInverterControlLimit
                                                .opModExpLimW.value
                                        }
                                    />
                                    <span className="opacity-30">w</span>
                                </>
                            ) : (
                                '-'
                            )}
                        </p>
                    }
                    heading="Export limit"
                    limit={
                        coordinatorStatus.controlLimits !== null &&
                        coordinatorStatus.controlLimits
                            .activeInverterControlLimit.opModExpLimW !==
                            undefined
                    }
                    source={
                        coordinatorStatus.controlLimits
                            ? coordinatorStatus.controlLimits
                                  .activeInverterControlLimit.opModExpLimW
                                  ?.source
                            : undefined
                    }
                />
            </section>
            <div className="mb-6">
                <h2 className={clsx(title({}))}>Control</h2>
            </div>
            <section className="grid grid-cols-4 gap-4">
                {coordinatorStatus.inverterConfiguration ? (
                    <>{coordinatorStatus.inverterConfiguration.type}</>
                ) : null}
            </section>
        </div>
    );
}

function LimitCard({
    heading,
    limit,
    body,
    source,
}: {
    heading: string;
    limit: boolean;
    body: React.ReactNode;
    source: InverterControlTypes | undefined;
}) {
    const navigate = useNavigate();

    return (
        <Card
            isPressable
            classNames={{
                base: limit ? 'bg-green-900' : null,
            }}
            onPress={() => {
                void navigate({ to: '/limits' });
            }}
        >
            <CardHeader className="flex-col items-start">
                <h4 className="text-medium font-medium text-white">
                    {heading}
                </h4>
            </CardHeader>
            <CardBody className="text-4xl">{body}</CardBody>
            <CardFooter>
                <p className="text-sm text-white/50">
                    {(() => {
                        switch (source) {
                            case 'fixed':
                                return 'Fixed limit';
                            case 'mqtt':
                                return 'MQTT';
                            case 'negativeFeedIn':
                                return 'Negative feed-in';
                            case 'csipAus':
                                return 'Utility dynamic export';
                            case 'twoWayTariff':
                                return 'Two-way tariff';
                            case undefined:
                                return '';
                        }
                    })()}
                </p>
            </CardFooter>
        </Card>
    );
}
