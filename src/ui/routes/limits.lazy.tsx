import { createLazyFileRoute } from '@tanstack/react-router';
import {
    useConnection,
    useConnectionSchedule,
    useEnergize,
    useEnergizeSchedule,
    useExportLimit,
    useExportLimitSchedule,
    useGenerationLimit,
    useGenerationLimitSchedule,
    useImportLimit,
    useImportLimitSchedule,
    useLoadLimit,
    useLoadLimitSchedule,
} from '@/gen/hooks';
import { PowerLimitChart } from '../components/PowerLimitChart';
import { BooleanLimitChart } from '../components/BooleanLimitChart';

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
    const { data: limitData } = useConnection({
        query: { refetchInterval: 10_000 },
    });
    const { data: scheduleLimit } = useConnectionSchedule({
        query: { refetchInterval: 10_000 },
    });

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
    const { data: limitData } = useEnergize({
        query: { refetchInterval: 10_000 },
    });
    const { data: scheduleLimit } = useEnergizeSchedule({
        query: { refetchInterval: 10_000 },
    });

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
    const { data: exportLimitData } = useExportLimit({
        query: { refetchInterval: 10_000 },
    });
    const { data: exportLimitScheduleData } = useExportLimitSchedule({
        query: { refetchInterval: 10_000 },
    });

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
    const { data: generationLimitData } = useGenerationLimit({
        query: { refetchInterval: 10_000 },
    });
    const { data: generationLimitScheduleData } = useGenerationLimitSchedule({
        query: { refetchInterval: 10_000 },
    });

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
    const { data: importLimitData } = useImportLimit({
        query: { refetchInterval: 10_000 },
    });
    const { data: importLimitScheduleData } = useImportLimitSchedule({
        query: { refetchInterval: 10_000 },
    });

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
    const { data: loadLimitData } = useLoadLimit({
        query: { refetchInterval: 10_000 },
    });
    const { data: loadLimitScheduleData } = useLoadLimitSchedule({
        query: { refetchInterval: 10_000 },
    });

    return (
        <PowerLimitChart
            title="Load limit"
            limitData={loadLimitData ?? []}
            scheduleData={loadLimitScheduleData ?? []}
            scheduleKey="opModLoadLimW"
        />
    );
}
