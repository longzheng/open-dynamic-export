import { Card, CardBody, CardHeader } from '@heroui/card';
import { createFileRoute } from '@tanstack/react-router';
import { clsx } from 'clsx';
import { PowerLimitChart } from '../components/PowerLimitChart';
import { BooleanLimitChart } from '../components/BooleanLimitChart';
import { $api } from '@/client';

export const Route = createFileRoute('/limits')({
    component: Limits,
});

function Limits() {
    return (
        <div className="grid gap-4">
            <CsipAusStatus />
            <ConnectionLimit />
            <EnergizeLimit />
            <ExportLimit />
            <GenerationLimit />
            <ImportLimit />
            <LoadLimit />
        </div>
    );
}

function CsipAusStatus() {
    const { data: status } = $api.useQuery(
        'get',
        '/api/csipAus/status',
        undefined,
        {
            refetchInterval: 10_000,
        },
    );

    const connected = status?.connected ?? false;

    return (
        <Card>
            <CardHeader className="border-b border-gray-700/40">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-100">
                            Device status
                        </h1>
                    </div>
                    <span
                        className={clsx(
                            'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                            connected
                                ? 'bg-green-500/15 text-green-300'
                                : 'bg-red-500/15 text-red-300',
                        )}
                    >
                        {connected ? 'Connected' : 'Disconnected'}
                    </span>
                </div>
            </CardHeader>
            <CardBody className="grid gap-4 sm:grid-cols-3">
                <StatusField label="LFDI" value={status?.lfdi} mono />
                <StatusField label="SFDI" value={status?.sfdi} mono />
            </CardBody>
        </Card>
    );
}

function StatusField({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: string | null | undefined;
    mono?: boolean;
}) {
    return (
        <div className="space-y-1">
            <p className="text-tiny font-bold uppercase tracking-wide text-white/40">
                {label}
            </p>
            <p
                className={clsx(
                    'text-sm text-white',
                    mono ? 'break-all font-mono text-xs sm:text-sm' : null,
                )}
            >
                {value ?? '-'}
            </p>
        </div>
    );
}

function ConnectionLimit() {
    const { data: limitData } = $api.useQuery(
        'get',
        '/api/data/connection',
        undefined,
        {
            refetchInterval: 10_000,
        },
    );
    const { data: scheduleLimit } = $api.useQuery(
        'get',
        '/api/csipAus/connectionSchedule',
        undefined,
        {
            refetchInterval: 10_000,
        },
    );

    return (
        <BooleanLimitChart
            title="Connection limit"
            limitData={limitData ?? []}
            scheduleData={scheduleLimit ?? []}
            scheduleKey="opModConnect"
        />
    );
}

function EnergizeLimit() {
    const { data: limitData } = $api.useQuery(
        'get',
        '/api/data/energize',
        undefined,
        {
            refetchInterval: 10_000,
        },
    );
    const { data: scheduleLimit } = $api.useQuery(
        'get',
        '/api/csipAus/energizeSchedule',
        undefined,
        {
            refetchInterval: 10_000,
        },
    );

    return (
        <BooleanLimitChart
            title="Energize limit"
            limitData={limitData ?? []}
            scheduleData={scheduleLimit ?? []}
            scheduleKey="opModEnergize"
        />
    );
}

function ExportLimit() {
    const { data: exportLimitData } = $api.useQuery(
        'get',
        '/api/data/exportLimit',
        undefined,
        {
            refetchInterval: 10_000,
        },
    );
    const { data: exportLimitScheduleData } = $api.useQuery(
        'get',
        '/api/csipAus/exportLimitSchedule',
        undefined,
        {
            refetchInterval: 10_000,
        },
    );

    return (
        <PowerLimitChart
            title="Export limit"
            limitData={exportLimitData ?? []}
            scheduleData={exportLimitScheduleData ?? []}
            scheduleKey="opModExpLimW"
        />
    );
}

function GenerationLimit() {
    const { data: generationLimitData } = $api.useQuery(
        'get',
        '/api/data/generationLimit',
        undefined,
        {
            refetchInterval: 10_000,
        },
    );
    const { data: generationLimitScheduleData } = $api.useQuery(
        'get',
        '/api/csipAus/generationLimitSchedule',
        undefined,
        {
            refetchInterval: 10_000,
        },
    );

    return (
        <PowerLimitChart
            title="Generation limit"
            limitData={generationLimitData ?? []}
            scheduleData={generationLimitScheduleData ?? []}
            scheduleKey="opModGenLimW"
        />
    );
}

function ImportLimit() {
    const { data: importLimitData } = $api.useQuery(
        'get',
        '/api/data/importLimit',
        undefined,
        {
            refetchInterval: 10_000,
        },
    );
    const { data: importLimitScheduleData } = $api.useQuery(
        'get',
        '/api/csipAus/importLimitSchedule',
        undefined,
        {
            refetchInterval: 10_000,
        },
    );

    return (
        <PowerLimitChart
            title="Import limit"
            limitData={importLimitData ?? []}
            scheduleData={importLimitScheduleData ?? []}
            scheduleKey="opModImpLimW"
        />
    );
}

function LoadLimit() {
    const { data: loadLimitData } = $api.useQuery(
        'get',
        '/api/data/loadLimit',
        undefined,
        {
            refetchInterval: 10_000,
        },
    );
    const { data: loadLimitScheduleData } = $api.useQuery(
        'get',
        '/api/csipAus/loadLimitSchedule',
        undefined,
        {
            refetchInterval: 10_000,
        },
    );

    return (
        <PowerLimitChart
            title="Load limit"
            limitData={loadLimitData ?? []}
            scheduleData={loadLimitScheduleData ?? []}
            scheduleKey="opModLoadLimW"
        />
    );
}
