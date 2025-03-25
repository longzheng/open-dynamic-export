import { type DerControlBase } from '../gen/types';
import { Card, CardHeader, CardBody } from '@heroui/card';
import {
    type ChartDataset,
    type ChartOptions,
    type TooltipItem,
} from 'chart.js';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { type AnnotationPluginOptions } from 'chartjs-plugin-annotation';
import { useEffect, useMemo, useRef, useState } from 'react';
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(annotationPlugin);

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

export type BooleanLimitChartProps = {
    title: string;
    limitData: {
        _value: boolean;
        _time: string;
        _measurement: string;
        name: string;
    }[];
    scheduleData: {
        startInclusive: string;
        endExclusive: string;
        derControlBase: DerControlBase;
    }[];
    scheduleKey: 'opModConnect' | 'opModEnergize';
};

export function BooleanLimitChart({
    title,
    limitData,
    scheduleData,
    scheduleKey,
}: BooleanLimitChartProps) {
    type ChartDataType = { datetime: number[]; value: boolean | null }[];

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<Chart<'bar', ChartDataType> | null>(null);

    // Add state for current time
    const [now, setNow] = useState(() => new Date());

    // Update current time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Memoize time-related values
    const timeConfig = useMemo(() => {
        const historyHours = 24;
        const futureHours = 24;
        return {
            now,
            minTime: new Date(now.getTime() - historyHours * 60 * 60 * 1000),
            maxTime: new Date(now.getTime() + futureHours * 60 * 60 * 1000),
        };
    }, [now]);

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
                value: d.derControlBase[scheduleKey] ?? null,
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

    const chartOptions = useMemo(
        (): ChartOptions<'bar'> => ({
            indexAxis: 'y',
            animation: false,
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
                    stacked: true,
                    grid: {
                        display: false,
                    },
                    ticks: {
                        display: false,
                    },
                },
            },
            maintainAspectRatio: false,
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
                        label(item: TooltipItem<'bar'>) {
                            return `${item.dataset.label || ''}: ${item.parsed.y === 1 ? 'Allowed' : 'Not allowed'}`;
                        },
                    },
                },
                annotation: getAnnotations(),
            },
        }),
        [timeConfig],
    );

    const chartData = useMemo(() => {
        // Group consecutive values
        const groupedLimitData = limitData
            .filter(
                (d) =>
                    d._measurement === 'controlLimit' &&
                    d.name === 'csipAus' &&
                    new Date(d._time) >= timeConfig.minTime,
            )
            .reduce<{ start_time: string; end_time: string; value: boolean }[]>(
                (acc, curr) => {
                    if (acc.length === 0) {
                        acc.push({
                            start_time: curr._time,
                            end_time: curr._time,
                            value: curr._value,
                        });
                    } else {
                        const lastGroup = acc[acc.length - 1];
                        if (curr._value === lastGroup.value) {
                            lastGroup.end_time = curr._time;
                        } else {
                            acc.push({
                                start_time: curr._time,
                                end_time: curr._time,
                                value: curr._value,
                            });
                        }
                    }
                    return acc;
                },
                [],
            );

        const datasets: ChartDataset<'bar', ChartDataType>[] = [
            {
                label: 'Not allowed',
                data: groupedLimitData
                    .filter((d) => !d.value)
                    .map((d) => ({
                        datetime: [
                            new Date(d.start_time).getTime(),
                            new Date(d.end_time).getTime(),
                        ],
                        value: d.value,
                    })),
                borderWidth: 0,
                backgroundColor: 'rgba(239, 68, 68, 0.8)', // Red
                parsing: {
                    xAxisKey: 'datetime',
                    yAxisKey: 'value',
                },
                order: 1,
            },
            {
                label: 'Allowed',
                data: groupedLimitData
                    .filter((d) => d.value)
                    .map((d) => ({
                        datetime: [
                            new Date(d.start_time).getTime(),
                            new Date(d.end_time).getTime(),
                        ],
                        value: d.value,
                    })),
                borderWidth: 0,
                backgroundColor: 'rgba(34, 197, 94, 0.8)', // Green
                parsing: {
                    xAxisKey: 'datetime',
                    yAxisKey: 'value',
                },
                order: 2,
            },
        ];

        // Add schedule data
        const falseSchedules = scheduleData.filter(
            (d) => d.derControlBase[scheduleKey] === false,
        );
        if (falseSchedules.length > 0) {
            datasets.push({
                label: 'Future schedule (Not allowed)',
                data: falseSchedules
                    .filter(
                        (d) =>
                            new Date(d.endExclusive).getTime() <=
                            timeConfig.maxTime.getTime(),
                    )
                    .map((d) => ({
                        datetime: [
                            new Date(d.startInclusive).getTime(),
                            new Date(d.endExclusive).getTime(),
                        ],
                        value: false,
                    })),
                backgroundColor: 'rgba(239, 68, 68, 0.3)', // Light red
                parsing: {
                    xAxisKey: 'datetime',
                    yAxisKey: 'value',
                },
                order: 3,
            });
        }

        const trueSchedules = scheduleData.filter(
            (d) => d.derControlBase[scheduleKey] === true,
        );
        if (trueSchedules.length > 0) {
            datasets.push({
                label: 'Future schedule (Allowed)',
                data: trueSchedules
                    .filter(
                        (d) =>
                            new Date(d.endExclusive).getTime() <=
                            timeConfig.maxTime.getTime(),
                    )
                    .map((d) => ({
                        datetime: [
                            new Date(d.startInclusive).getTime(),
                            new Date(d.endExclusive).getTime(),
                        ],
                        value: true,
                    })),
                backgroundColor: 'rgba(34, 197, 94, 0.3)', // Light green
                parsing: {
                    xAxisKey: 'datetime',
                    yAxisKey: 'value',
                },
                order: 4,
            });
        }

        return { datasets };
    }, [limitData, scheduleData, timeConfig, scheduleKey]);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        if (chartRef.current === null) {
            chartRef.current = new Chart<'bar', ChartDataType>(
                canvasRef.current,
                {
                    type: 'bar',
                    data: chartData,
                    options: chartOptions,
                },
            );
            return;
        }

        // Update or create datasets as needed
        while (
            chartRef.current.data.datasets.length < chartData.datasets.length
        ) {
            // Create a properly typed empty dataset
            chartRef.current.data.datasets.push({
                data: [],
                label: '',
                borderWidth: 0,
                backgroundColor: 'rgba(0,0,0,0)',
                parsing: {
                    xAxisKey: 'datetime',
                    yAxisKey: 'value',
                },
            });
        }

        // Trim excess datasets
        chartRef.current.data.datasets.length = chartData.datasets.length;

        // Update each dataset's properties
        for (let i = 0; i < chartData.datasets.length; i++) {
            Object.assign(
                chartRef.current.data.datasets[i],
                chartData.datasets[i],
            );
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
                <div className="relative h-[100px]">
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
                                        <th className="pb-2">Status</th>
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
                                                {schedule.value
                                                    ? 'Allowed'
                                                    : 'Not allowed'}
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
