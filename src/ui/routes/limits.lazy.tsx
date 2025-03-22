import { Card, CardHeader, CardBody } from "@heroui/card";
import { createLazyFileRoute } from '@tanstack/react-router';
import { type ChartData, type ChartDataset } from 'chart.js/auto';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { type AnnotationPluginOptions } from 'chartjs-plugin-annotation';
import annotationPlugin from 'chartjs-plugin-annotation';

import {
    useConnection,
    useConnectionSchedule,
    useEnergize,
    useEnergizeSchedule,
    useExportLimit,
    useExportLimitSchedule,
    useGenerationLimit,
    useGenerationLimitSchedule,
} from '@/gen/hooks';
import { useEffect, useMemo, useRef } from 'react';

Chart.register(annotationPlugin);

export const Route = createLazyFileRoute('/limits')({
    component: Limits,
});

function Limits() {
    return (
        <div className="grid gap-4">
            <ConnectionLimit />
            <EnergizeLimit />
            <GenerationLimit />
            <ExportLimit />
        </div>
    );
}

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
            future: {
                type: 'box',
                xMin: new Date().getTime(),
                display: (ctx) => ctx.chart.isDatasetVisible(3),
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 0,
                z: -10,
            },
        },
    };
}

function ConnectionLimit() {
    type ChartDataType = { datetime: number[]; value: boolean | null }[];

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<Chart<'bar', ChartDataType> | null>(null);
    const { data: limitData } = useConnection({
        query: { refetchInterval: 1000 },
    });
    const { data: scheduleLimit } = useConnectionSchedule({
        query: { refetchInterval: 1000 },
    });

    const chartData = useMemo((): ChartData<'bar', ChartDataType> => {
        if (!limitData) {
            return { datasets: [] };
        }

        const datasets: ChartDataset<'bar', ChartDataType>[] = [
            {
                label: 'Applied limit',
                data: limitData
                    .filter(
                        (d) =>
                            d._measurement === 'controlLimit' &&
                            d.name === 'fixed' &&
                            d._value === false,
                    )
                    .reduce<
                        {
                            start_time: string;
                            end_time: string;
                            _value: boolean;
                        }[]
                    >((acc, curr) => {
                        if (acc.length === 0) {
                            // Initialize with the first item
                            acc.push({
                                ...curr,
                                start_time: curr._time,
                                end_time: curr._time,
                            });
                        } else {
                            const lastGroup = acc[acc.length - 1];

                            if (curr._value === lastGroup._value) {
                                // Merge with the last group
                                lastGroup.end_time = curr._time;
                            } else {
                                // Start a new group
                                acc.push({
                                    ...curr,
                                    start_time: curr._time,
                                    end_time: curr._time,
                                });
                            }
                        }

                        return acc;
                    }, [])
                    .map((d) => {
                        return {
                            datetime: [
                                new Date(d.start_time).getTime(),
                                new Date(d.end_time).getTime(),
                            ],
                            value: d._value,
                        };
                    }),
                borderWidth: 0,
                pointStyle: false,
                backgroundColor: 'red',
                parsing: {
                    xAxisKey: 'datetime',
                    yAxisKey: 'value',
                },
            },
            {
                label: 'Applied limit',
                data: limitData
                    .filter(
                        (d) =>
                            d._measurement === 'controlLimit' &&
                            d.name === 'fixed' &&
                            d._value === true,
                    )
                    .reduce<
                        {
                            start_time: string;
                            end_time: string;
                            _value: boolean;
                        }[]
                    >((acc, curr) => {
                        if (acc.length === 0) {
                            // Initialize with the first item
                            acc.push({
                                ...curr,
                                start_time: curr._time,
                                end_time: curr._time,
                            });
                        } else {
                            const lastGroup = acc[acc.length - 1];

                            if (curr._value === lastGroup._value) {
                                // Merge with the last group
                                lastGroup.end_time = curr._time;
                            } else {
                                // Start a new group
                                acc.push({
                                    ...curr,
                                    start_time: curr._time,
                                    end_time: curr._time,
                                });
                            }
                        }

                        return acc;
                    }, [])
                    .map((d) => {
                        return {
                            datetime: [
                                new Date(d.start_time).getTime(),
                                new Date(d.end_time).getTime(),
                            ],
                            value: d._value,
                        };
                    }),
                borderWidth: 0,
                pointStyle: false,
                backgroundColor: 'rgba(58, 146, 83, 0.53)',
                parsing: {
                    xAxisKey: 'datetime',
                    yAxisKey: 'value',
                },
            },
        ];

        if (scheduleLimit) {
            const opModConnectFalse = scheduleLimit.filter(
                (d) => d.derControlBase.opModConnect === false,
            );
            const opModConnectTrue = scheduleLimit.filter(
                (d) => d.derControlBase.opModConnect === true,
            );

            if (opModConnectFalse.length > 0) {
                datasets.push({
                    label: 'Schedule',
                    data: opModConnectFalse
                        // TODO: make the chart time range fixed, show in the future
                        // currently limited to the next 2 hours
                        .filter(
                            (d) =>
                                new Date(d.endExclusive).getTime() <
                                new Date().getTime() + 1000 * 60 * 60 * 2,
                        )
                        .map((d) => {
                            const points: ChartDataType = [];
                            const start = new Date(d.startInclusive).getTime();
                            const end = new Date(d.endExclusive).getTime();

                            points.push({
                                // start
                                datetime: [start, end],
                                value: d.derControlBase.opModConnect ?? null,
                            });

                            return points;
                        })
                        .flatMap((d) => d),
                    backgroundColor: 'rgba(255, 100, 100, 0.3)',
                    parsing: {
                        xAxisKey: 'datetime',
                        yAxisKey: 'value',
                    },
                });
            }

            if (opModConnectTrue.length > 0) {
                datasets.push({
                    label: 'Schedule',
                    data: scheduleLimit
                        .filter((d) => d.derControlBase.opModConnect === true)
                        // TODO: make the chart time range fixed, show in the future
                        // currently limited to the next 2 hours
                        .filter(
                            (d) =>
                                new Date(d.endExclusive).getTime() <
                                new Date().getTime() + 1000 * 60 * 60 * 2,
                        )
                        .map((d) => {
                            const points: ChartDataType = [];
                            const start = new Date(d.startInclusive).getTime();
                            const end = new Date(d.endExclusive).getTime();

                            points.push({
                                // start
                                datetime: [start, end],
                                value: d.derControlBase.opModConnect ?? null,
                            });

                            return points;
                        })
                        .flatMap((d) => d),
                    backgroundColor: 'rgba(100, 255, 100, 0.3)',
                    parsing: {
                        xAxisKey: 'datetime',
                        yAxisKey: 'value',
                    },
                });
            }
        }

        return { datasets };
    }, [limitData, scheduleLimit]);

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
                    options: {
                        indexAxis: 'y',
                        animation: false,
                        scales: {
                            x: {
                                type: 'time',
                                time: {
                                    unit: 'minute',
                                },
                                // adapters: {
                                //     date: {
                                //         locale: 'en',
                                //     },
                                // },
                            },
                            y: {
                                stacked: true,
                            },
                            // y: {
                            //     beginAtZero: true,
                            //     grid: {
                            //         color: (context) => {
                            //             if (context.tick.value > 0) {
                            //                 return 'rgba(255,100, 100, 0.1)';
                            //             } else {
                            //                 return 'rgba(100, 255, 100, 0.1)';
                            //             }
                            //         },
                            //     },
                            // },
                        },
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false,
                            },
                            annotation: getAnnotations(),
                        },
                    },
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

            if (chartRef.current.options.plugins) {
                chartRef.current.options.plugins.annotation = getAnnotations();
            }
        }

        chartRef.current.update();
    }, [chartData]);

    return (
        <Card>
            <CardHeader>
                <h1>Connection limit</h1>
            </CardHeader>
            <CardBody>
                <div className="relative h-[100px]">
                    <canvas ref={canvasRef} />
                </div>
            </CardBody>
        </Card>
    );
}

function EnergizeLimit() {
    type ChartDataType = { datetime: number[]; value: boolean | null }[];

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<Chart<'bar', ChartDataType> | null>(null);
    const { data: limitData } = useEnergize({
        query: { refetchInterval: 1000 },
    });
    const { data: scheduleLimit } = useEnergizeSchedule({
        query: { refetchInterval: 1000 },
    });

    const chartData = useMemo((): ChartData<'bar', ChartDataType> => {
        if (!limitData) {
            return { datasets: [] };
        }

        const datasets: ChartDataset<'bar', ChartDataType>[] = [
            {
                label: 'Applied limit',
                data: limitData
                    .filter(
                        (d) =>
                            d._measurement === 'controlLimit' &&
                            d.name === 'fixed' &&
                            d._value === false,
                    )
                    .reduce<
                        {
                            start_time: string;
                            end_time: string;
                            _value: boolean;
                        }[]
                    >((acc, curr) => {
                        if (acc.length === 0) {
                            // Initialize with the first item
                            acc.push({
                                ...curr,
                                start_time: curr._time,
                                end_time: curr._time,
                            });
                        } else {
                            const lastGroup = acc[acc.length - 1];

                            if (curr._value === lastGroup._value) {
                                // Merge with the last group
                                lastGroup.end_time = curr._time;
                            } else {
                                // Start a new group
                                acc.push({
                                    ...curr,
                                    start_time: curr._time,
                                    end_time: curr._time,
                                });
                            }
                        }

                        return acc;
                    }, [])
                    .map((d) => {
                        return {
                            datetime: [
                                new Date(d.start_time).getTime(),
                                new Date(d.end_time).getTime(),
                            ],
                            value: d._value,
                        };
                    }),
                borderWidth: 0,
                pointStyle: false,
                backgroundColor: 'red',
                parsing: {
                    xAxisKey: 'datetime',
                    yAxisKey: 'value',
                },
            },
            {
                label: 'Applied limit',
                data: limitData
                    .filter(
                        (d) =>
                            d._measurement === 'controlLimit' &&
                            d.name === 'fixed' &&
                            d._value === true,
                    )
                    .reduce<
                        {
                            start_time: string;
                            end_time: string;
                            _value: boolean;
                        }[]
                    >((acc, curr) => {
                        if (acc.length === 0) {
                            // Initialize with the first item
                            acc.push({
                                ...curr,
                                start_time: curr._time,
                                end_time: curr._time,
                            });
                        } else {
                            const lastGroup = acc[acc.length - 1];

                            if (curr._value === lastGroup._value) {
                                // Merge with the last group
                                lastGroup.end_time = curr._time;
                            } else {
                                // Start a new group
                                acc.push({
                                    ...curr,
                                    start_time: curr._time,
                                    end_time: curr._time,
                                });
                            }
                        }

                        return acc;
                    }, [])
                    .map((d) => {
                        return {
                            datetime: [
                                new Date(d.start_time).getTime(),
                                new Date(d.end_time).getTime(),
                            ],
                            value: d._value,
                        };
                    }),
                borderWidth: 0,
                pointStyle: false,
                backgroundColor: 'rgba(58, 146, 83, 0.53)',
                parsing: {
                    xAxisKey: 'datetime',
                    yAxisKey: 'value',
                },
            },
        ];

        if (scheduleLimit) {
            datasets.push({
                label: 'Schedule',
                data: scheduleLimit
                    .filter((d) => d.derControlBase.opModEnergize === false)
                    // TODO: make the chart time range fixed, show in the future
                    // currently limited to the next 2 hours
                    .filter(
                        (d) =>
                            new Date(d.endExclusive).getTime() <
                            new Date().getTime() + 1000 * 60 * 60 * 2,
                    )
                    .map((d) => {
                        const points: ChartDataType = [];
                        const start = new Date(d.startInclusive).getTime();
                        const end = new Date(d.endExclusive).getTime();

                        points.push({
                            // start
                            datetime: [start, end],
                            value: d.derControlBase.opModEnergize ?? null,
                        });

                        return points;
                    })
                    .flatMap((d) => d),
                backgroundColor: 'rgba(255, 100, 100, 0.3)',
                parsing: {
                    xAxisKey: 'datetime',
                    yAxisKey: 'value',
                },
            });

            datasets.push({
                label: 'Schedule',
                data: scheduleLimit
                    .filter((d) => d.derControlBase.opModEnergize === true)
                    // TODO: make the chart time range fixed, show in the future
                    // currently limited to the next 2 hours
                    .filter(
                        (d) =>
                            new Date(d.endExclusive).getTime() <
                            new Date().getTime() + 1000 * 60 * 60 * 2,
                    )
                    .map((d) => {
                        const points: ChartDataType = [];
                        const start = new Date(d.startInclusive).getTime();
                        const end = new Date(d.endExclusive).getTime();

                        points.push({
                            // start
                            datetime: [start, end],
                            value: d.derControlBase.opModEnergize ?? null,
                        });

                        return points;
                    })
                    .flatMap((d) => d),
                backgroundColor: 'rgba(100, 255, 100, 0.3)',
                parsing: {
                    xAxisKey: 'datetime',
                    yAxisKey: 'value',
                },
            });
        }

        return { datasets };
    }, [limitData, scheduleLimit]);

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
                    options: {
                        indexAxis: 'y',
                        animation: false,
                        scales: {
                            x: {
                                type: 'time',
                                time: {
                                    unit: 'minute',
                                },
                                // adapters: {
                                //     date: {
                                //         locale: 'en',
                                //     },
                                // },
                            },
                            y: {
                                stacked: true,
                            },
                            // y: {
                            //     beginAtZero: true,
                            //     grid: {
                            //         color: (context) => {
                            //             if (context.tick.value > 0) {
                            //                 return 'rgba(255,100, 100, 0.1)';
                            //             } else {
                            //                 return 'rgba(100, 255, 100, 0.1)';
                            //             }
                            //         },
                            //     },
                            // },
                        },
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false,
                            },
                            annotation: getAnnotations(),
                        },
                    },
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

            if (chartRef.current.options.plugins) {
                chartRef.current.options.plugins.annotation = getAnnotations();
            }
        }

        chartRef.current.update();
    }, [chartData]);

    return (
        <Card>
            <CardHeader>
                <h1>Energize limit</h1>
            </CardHeader>
            <CardBody>
                <div className="relative h-[100px]">
                    <canvas ref={canvasRef} />
                </div>
            </CardBody>
        </Card>
    );
}

function ExportLimit() {
    type ChartDataType = { datetime: number; value: number | null }[];

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<Chart<'line', ChartDataType> | null>(null);
    const { data: exportLimitData } = useExportLimit({
        query: { refetchInterval: 1000 },
    });
    const { data: exportLimitScheduleData } = useExportLimitSchedule({
        query: { refetchInterval: 1000 },
    });

    const chartData = useMemo((): ChartData<'line', ChartDataType> => {
        if (!exportLimitData) {
            return { datasets: [] };
        }

        const datasets: ChartDataset<'line', ChartDataType>[] = [
            {
                label: 'Applied limit',
                data: exportLimitData
                    .filter(
                        (d) =>
                            d._measurement === 'controlLimit' &&
                            d.name === 'sep2',
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
                backgroundColor: 'rgba(58, 146, 83, 0.53)',
                parsing: {
                    xAxisKey: 'datetime',
                    yAxisKey: 'value',
                },
            },
            {
                label: 'Active control',
                data: exportLimitData
                    .filter(
                        (d) =>
                            d._measurement === 'controlScheduler' &&
                            d.control === 'active',
                    )
                    .map((d) => ({
                        datetime: new Date(d._time).getTime(),
                        value: d._value,
                    })),
                borderWidth: 2,
                pointStyle: false,
                borderColor: '#ff6464',
                parsing: {
                    xAxisKey: 'datetime',
                    yAxisKey: 'value',
                },
            },
            {
                label: 'Default control',
                data: exportLimitData
                    .filter(
                        (d) =>
                            d._measurement === 'controlScheduler' &&
                            d.control === 'default',
                    )
                    .map((d) => ({
                        datetime: new Date(d._time).getTime(),
                        value: d._value,
                    })),
                borderWidth: 2,
                pointStyle: false,
                borderColor: '#6464ff',
                parsing: {
                    xAxisKey: 'datetime',
                    yAxisKey: 'value',
                },
            },
        ];

        let lastEnd: number | null = null;

        if (exportLimitScheduleData) {
            datasets.push({
                label: 'Schedule',
                data: exportLimitScheduleData
                    // TODO: make the chart time range fixed, show in the future
                    // currently limited to the next 2 hours
                    .filter(
                        (d) =>
                            new Date(d.endExclusive).getTime() <
                            new Date().getTime() + 1000 * 60 * 60 * 2,
                    )
                    .map((d) => {
                        const points: ChartDataType = [];
                        const start = new Date(d.startInclusive).getTime();
                        const end = new Date(d.endExclusive).getTime();

                        if (lastEnd && start !== lastEnd) {
                            points.push(
                                ...[
                                    {
                                        datetime: lastEnd,
                                        value: null,
                                    },
                                ],
                            );
                        }

                        lastEnd = end;

                        points.push(
                            ...[
                                {
                                    // start
                                    datetime: start,
                                    value: d.derControlBase.opModExpLimW
                                        ? d.derControlBase.opModExpLimW.value *
                                          10 **
                                              d.derControlBase.opModExpLimW
                                                  .multiplier
                                        : null,
                                },
                                {
                                    // end
                                    datetime: end,
                                    value: d.derControlBase.opModExpLimW
                                        ? d.derControlBase.opModExpLimW.value *
                                          10 **
                                              d.derControlBase.opModExpLimW
                                                  .multiplier
                                        : null,
                                },
                            ],
                        );

                        return points;
                    })
                    .flatMap((d) => d),
                borderWidth: 2,
                pointStyle: 'circle',
                borderColor: '#ff6464',
                borderDash: [3, 3],
                parsing: {
                    xAxisKey: 'datetime',
                    yAxisKey: 'value',
                },
            });
        }

        return { datasets };
    }, [exportLimitData, exportLimitScheduleData]);

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
                    options: {
                        animation: false,
                        scales: {
                            x: {
                                type: 'time',
                                time: {
                                    unit: 'minute',
                                },
                                // adapters: {
                                //     date: {
                                //         locale: 'en',
                                //     },
                                // },
                            },
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: (context) => {
                                        if (context.tick.value > 0) {
                                            return 'rgba(255,100, 100, 0.1)';
                                        } else {
                                            return 'rgba(100, 255, 100, 0.1)';
                                        }
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
                            annotation: getAnnotations(),
                        },
                    },
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

            if (chartRef.current.options.plugins) {
                chartRef.current.options.plugins.annotation = getAnnotations();
            }
        }

        chartRef.current.update();
    }, [chartData]);

    return (
        <Card>
            <CardHeader>
                <h1>Export limit</h1>
            </CardHeader>
            <CardBody>
                <div className="relative h-[500px]">
                    <canvas ref={canvasRef} />
                </div>
            </CardBody>
        </Card>
    );
}

function GenerationLimit() {
    type ChartDataType = { datetime: number; value: number | null }[];

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<Chart<'line', ChartDataType> | null>(null);
    const { data: limitData } = useGenerationLimit({
        query: { refetchInterval: 1000 },
    });
    const { data: limitScheduleData } = useGenerationLimitSchedule({
        query: { refetchInterval: 1000 },
    });

    const chartData = useMemo((): ChartData<'line', ChartDataType> => {
        if (!limitData) {
            return { datasets: [] };
        }

        const datasets: ChartDataset<'line', ChartDataType>[] = [
            {
                label: 'Applied limit',
                data: limitData
                    .filter(
                        (d) =>
                            d._measurement === 'controlLimit' &&
                            d.name === 'sep2',
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
                backgroundColor: 'rgba(58, 146, 83, 0.53)',
                parsing: {
                    xAxisKey: 'datetime',
                    yAxisKey: 'value',
                },
            },
            {
                label: 'Active control',
                data: limitData
                    .filter(
                        (d) =>
                            d._measurement === 'controlScheduler' &&
                            d.control === 'active',
                    )
                    .map((d) => ({
                        datetime: new Date(d._time).getTime(),
                        value: d._value,
                    })),
                borderWidth: 2,
                pointStyle: false,
                borderColor: '#ff6464',
                parsing: {
                    xAxisKey: 'datetime',
                    yAxisKey: 'value',
                },
            },
            {
                label: 'Default control',
                data: limitData
                    .filter(
                        (d) =>
                            d._measurement === 'controlScheduler' &&
                            d.control === 'default',
                    )
                    .map((d) => ({
                        datetime: new Date(d._time).getTime(),
                        value: d._value,
                    })),
                borderWidth: 2,
                pointStyle: false,
                borderColor: '#6464ff',
                parsing: {
                    xAxisKey: 'datetime',
                    yAxisKey: 'value',
                },
            },
        ];

        let lastEnd: number | null = null;

        if (limitScheduleData) {
            datasets.push({
                label: 'Schedule',
                data: limitScheduleData
                    // TODO: make the chart time range fixed, show in the future
                    // currently limited to the next 2 hours
                    .filter(
                        (d) =>
                            new Date(d.endExclusive).getTime() <
                            new Date().getTime() + 1000 * 60 * 60 * 2,
                    )
                    .map((d) => {
                        const points: ChartDataType = [];
                        const start = new Date(d.startInclusive).getTime();
                        const end = new Date(d.endExclusive).getTime();

                        if (lastEnd && start !== lastEnd) {
                            points.push(
                                ...[
                                    {
                                        datetime: lastEnd,
                                        value: null,
                                    },
                                ],
                            );
                        }

                        lastEnd = end;

                        points.push(
                            ...[
                                {
                                    // start
                                    datetime: start,
                                    value: d.derControlBase.opModGenLimW
                                        ? d.derControlBase.opModGenLimW.value *
                                          10 **
                                              d.derControlBase.opModGenLimW
                                                  .multiplier
                                        : null,
                                },
                                {
                                    // end
                                    datetime: end,
                                    value: d.derControlBase.opModGenLimW
                                        ? d.derControlBase.opModGenLimW.value *
                                          10 **
                                              d.derControlBase.opModGenLimW
                                                  .multiplier
                                        : null,
                                },
                            ],
                        );

                        return points;
                    })
                    .flatMap((d) => d),
                borderWidth: 2,
                pointStyle: 'circle',
                borderDash: [3, 3],
                borderColor: '#ff6464',
                parsing: {
                    xAxisKey: 'datetime',
                    yAxisKey: 'value',
                },
            });
        }

        return { datasets };
    }, [limitData, limitScheduleData]);

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
                    options: {
                        animation: false,
                        scales: {
                            x: {
                                type: 'time',
                                time: {
                                    unit: 'minute',
                                },
                                // adapters: {
                                //     date: {
                                //         locale: 'en',
                                //     },
                                // },
                            },
                            y: {
                                beginAtZero: true,
                                grid: {
                                    color: (context) => {
                                        if (context.tick.value > 0) {
                                            return 'rgba(255,100, 100, 0.1)';
                                        } else {
                                            return 'rgba(100, 255, 100, 0.1)';
                                        }
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
                            annotation: getAnnotations(),
                        },
                    },
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

            if (chartRef.current.options.plugins) {
                chartRef.current.options.plugins.annotation = getAnnotations();
            }
        }

        chartRef.current.update();
    }, [chartData]);

    return (
        <Card>
            <CardHeader>
                <h1>Generation limit</h1>
            </CardHeader>
            <CardBody>
                <div className="relative h-[500px]">
                    <canvas ref={canvasRef} />
                </div>
            </CardBody>
        </Card>
    );
}
