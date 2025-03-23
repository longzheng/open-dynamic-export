import { type DerControlBase } from '@/gen/types';
import { Card, CardHeader, CardBody } from '@heroui/card';
import {
    type ChartDataset,
    type ChartOptions,
    type Scale,
    type CoreScaleOptions,
} from 'chart.js';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { type AnnotationPluginOptions } from 'chartjs-plugin-annotation';
import { useEffect, useMemo, useRef } from 'react';

function getAnnotations(): AnnotationPluginOptions {
    return {
        annotations: {
            now: {
                type: 'line',
                xMin: new Date().getTime(),
                xMax: new Date().getTime(),
                borderColor: 'rgba(255, 255, 255, 1)',
                borderWidth: 2,
                label: {
                    content: 'Now',
                    display: true,
                },
            },
        },
    };
}

export type PowerLimitChartProps = {
    title: string;
    limitData: {
        control: string;
        _value: number;
        _time: string;
        _measurement: string;
        name: string;
    }[];
    scheduleData: {
        startInclusive: string;
        endExclusive: string;
        derControlBase: DerControlBase;
    }[];
    scheduleKey:
        | 'opModExpLimW'
        | 'opModGenLimW'
        | 'opModImpLimW'
        | 'opModLoadLimW';
};

export function PowerLimitChart({
    title,
    limitData,
    scheduleData,
    scheduleKey,
}: PowerLimitChartProps) {
    type ChartDataType = { datetime: number; value: number | null }[];

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<Chart<'line', ChartDataType> | null>(null);

    // Memoize time-related values
    const timeConfig = useMemo(() => {
        const historyHours = 24;
        const futureHours = 24;
        const now = new Date();
        return {
            now,
            minTime: new Date(now.getTime() - historyHours * 60 * 60 * 1000),
            maxTime: new Date(now.getTime() + futureHours * 60 * 60 * 1000),
        };
    }, []);

    // Format schedules for table display
    const futureSchedules = useMemo(() => {
        return scheduleData
            .filter(
                (d) =>
                    new Date(d.startInclusive).getTime() > new Date().getTime(),
            )
            .map((d) => ({
                start: new Date(d.startInclusive),
                end: new Date(d.endExclusive),
                limit: d.derControlBase[scheduleKey]
                    ? d.derControlBase[scheduleKey].value *
                      10 ** d.derControlBase[scheduleKey].multiplier
                    : null,
                startFormatted: new Date(d.startInclusive).toLocaleTimeString(
                    'en',
                    {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                    },
                ),
                endFormatted: new Date(d.endExclusive).toLocaleTimeString(
                    'en',
                    {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                    },
                ),
            }))
            .sort((a, b) => a.start.getTime() - b.start.getTime());
    }, [scheduleData, scheduleKey]);

    // Memoize chart options with proper typing
    const chartOptions = useMemo(
        (): ChartOptions<'line'> => ({
            animation: false,
            layout: {
                padding: {
                    top: 20,
                    right: 20,
                    bottom: 10,
                    left: 10,
                },
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        displayFormats: {
                            hour: 'HH:mm',
                        },
                    },
                    min: timeConfig.minTime.getTime(),
                    max: timeConfig.maxTime.getTime(),
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        tickColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    ticks: {
                        font: {
                            family: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            size: 11,
                        },
                        color: 'rgba(255, 255, 255, 0.6)',
                    },
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: (context: { tick: { value: number } }) => {
                            if (context.tick.value === 0) {
                                return 'rgba(255, 255, 255, 0.1)';
                            }
                            return context.tick.value > 0
                                ? 'rgba(255, 100, 100, 0.05)'
                                : 'rgba(100, 255, 100, 0.05)';
                        },
                        tickColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    ticks: {
                        font: {
                            family: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            size: 11,
                        },
                        color: 'rgba(255, 255, 255, 0.6)',
                        callback(
                            this: Scale<CoreScaleOptions>,
                            tickValue: number | string,
                        ) {
                            return `${tickValue} W`;
                        },
                    },
                },
            },
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            family: '-apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                            size: 12,
                        },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        color: 'rgba(255, 255, 255, 0.8)',
                    },
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 13,
                    },
                    bodyFont: {
                        size: 12,
                    },
                    padding: 12,
                    cornerRadius: 4,
                    displayColors: true,
                    callbacks: {
                        label(tooltipItem: {
                            dataset: { label?: string };
                            parsed: { y: number };
                        }) {
                            return ` ${tooltipItem.dataset.label || ''}: ${
                                tooltipItem.parsed.y
                            } W`;
                        },
                    },
                },
                annotation: getAnnotations(),
            },
        }),
        [timeConfig],
    );

    const chartData = useMemo(() => {
        const datasets: ChartDataset<'line', ChartDataType>[] = [
            {
                label: 'Applied limit',
                data: limitData
                    .filter(
                        (d) =>
                            d._measurement === 'controlLimit' &&
                            d.name === 'csipAus' &&
                            new Date(d._time) >= timeConfig.minTime,
                    )
                    .map((d) => ({
                        datetime: new Date(d._time).getTime(),
                        value: d._value,
                    })),
                borderWidth: 0,
                fill: {
                    target: 'origin',
                },
                pointStyle: false,
                backgroundColor: 'rgba(21, 128, 61, 0.15)', // Light green background
                parsing: {
                    xAxisKey: 'datetime',
                    yAxisKey: 'value',
                },
                order: 1, // Draw on top
            },
            {
                label: 'Active control',
                data: limitData
                    .filter(
                        (d) =>
                            d._measurement === 'controlScheduler' &&
                            d.control === 'active' &&
                            new Date(d._time) >= timeConfig.minTime,
                    )
                    .map((d) => ({
                        datetime: new Date(d._time).getTime(),
                        value: d._value,
                    })),
                borderWidth: 2,
                pointStyle: false,
                borderColor: 'rgba(21, 128, 61, 0.8)', // Solid green line
                backgroundColor: 'rgba(21, 128, 61, 0.8)',
                tension: 0.3, // Smooth line
                parsing: {
                    xAxisKey: 'datetime',
                    yAxisKey: 'value',
                },
                order: 2,
            },
            {
                label: 'Default control',
                data: limitData
                    .filter(
                        (d) =>
                            d._measurement === 'controlScheduler' &&
                            d.control === 'default' &&
                            new Date(d._time) >= timeConfig.minTime,
                    )
                    .map((d) => ({
                        datetime: new Date(d._time).getTime(),
                        value: d._value,
                    })),
                borderWidth: 2,
                pointStyle: false,
                borderColor: 'rgba(156, 163, 175, 0.6)', // Light grey color
                backgroundColor: 'rgba(156, 163, 175, 0.6)',
                tension: 0.3, // Smooth line
                parsing: {
                    xAxisKey: 'datetime',
                    yAxisKey: 'value',
                },
                order: 3,
            },
        ];

        let lastEnd: number | null = null;

        datasets.push({
            label: 'Future schedule',
            data: scheduleData
                .filter(
                    (d) =>
                        new Date(d.endExclusive).getTime() <=
                        timeConfig.maxTime.getTime(),
                )
                .map((d) => {
                    const points: ChartDataType = [];
                    const start = new Date(d.startInclusive).getTime();
                    const end = new Date(d.endExclusive).getTime();

                    if (lastEnd && start !== lastEnd) {
                        points.push({
                            datetime: lastEnd,
                            value: null,
                        });
                    }

                    lastEnd = end;

                    points.push({
                        datetime: start,
                        value: d.derControlBase[scheduleKey]
                            ? d.derControlBase[scheduleKey].value *
                              10 ** d.derControlBase[scheduleKey].multiplier
                            : null,
                    });

                    points.push({
                        datetime: end,
                        value: d.derControlBase[scheduleKey]
                            ? d.derControlBase[scheduleKey].value *
                              10 ** d.derControlBase[scheduleKey].multiplier
                            : null,
                    });

                    return points;
                })
                .flatMap((d) => d),
            borderWidth: 2,
            pointStyle: 'circle',
            borderColor: 'rgba(103, 232, 249, 0.8)', // Light cyan color
            borderDash: [3, 3],
            parsing: {
                xAxisKey: 'datetime',
                yAxisKey: 'value',
            },
            order: 4,
        });

        return { datasets };
    }, [limitData, scheduleData, timeConfig, scheduleKey]);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        if (chartRef.current === null) {
            chartRef.current = new Chart<'line', ChartDataType>(
                canvasRef.current,
                {
                    type: 'line',
                    data: chartData,
                    options: chartOptions,
                },
            );
            return;
        }

        if (!chartRef.current.data.datasets.length) {
            chartRef.current.data = chartData;
        } else {
            // update each dataset data directly
            for (let i = 0; i < chartData.datasets.length; i++) {
                chartRef.current.data.datasets[i].data =
                    chartData.datasets[i].data;
            }
        }

        // Update options
        chartRef.current.options = chartOptions;
        chartRef.current.update();
    }, [chartData, chartOptions]);

    return (
        <Card>
            <CardHeader className="border-b border-gray-700/40">
                <h1 className="text-xl font-semibold text-gray-100">{title}</h1>
            </CardHeader>
            <CardBody className="p-6">
                <div className="relative h-[500px]">
                    <canvas ref={canvasRef} />
                </div>

                {futureSchedules.length > 0 && (
                    <div className="mt-6">
                        <h2 className="mb-3 text-lg font-semibold">
                            Future Schedules
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-700/40 text-left">
                                        <th className="pb-2">Start Time</th>
                                        <th className="pb-2">End Time</th>
                                        <th className="pb-2">{title}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {futureSchedules.map((schedule, index) => (
                                        <tr
                                            key={index}
                                            className="border-b border-gray-700/20"
                                        >
                                            <td className="py-2">
                                                {schedule.startFormatted}
                                            </td>
                                            <td className="py-2">
                                                {schedule.endFormatted}
                                            </td>
                                            <td className="py-2">
                                                {schedule.limit !== null
                                                    ? `${schedule.limit.toLocaleString()} W`
                                                    : 'No limit'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </CardBody>
        </Card>
    );
}
