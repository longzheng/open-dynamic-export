import { createLazyFileRoute } from '@tanstack/react-router';
import { PowerLimitChart } from '../components/PowerLimitChart';
import { BooleanLimitChart } from '../components/BooleanLimitChart';
import { $api } from '@/client';

export const Route = createLazyFileRoute('/limits')({
    component: Limits,
});

function Limits() {
    return (
        <div className="grid gap-4">
            <ConnectionLimit />
            <EnergizeLimit />
            <ExportLimit />
            <GenerationLimit />
            <ImportLimit />
            <LoadLimit />
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
