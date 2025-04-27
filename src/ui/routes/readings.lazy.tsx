import { createLazyFileRoute } from '@tanstack/react-router';
import { Chart } from 'chart.js/auto';
import { type TooltipItem } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useEffect, useMemo, useRef } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { readingColors } from '../../../tailwind.config';
import { $api } from '@/client';

export const Route = createLazyFileRoute('/readings')({
    component: Readings,
});

function Readings() {
    return (
        <div className="space-y-4">
            <RealPower />
            <DERPower />
            <LoadPower />
        </div>
    );
}

interface PowerData {
    _time: string;
    _value: number;
    phase: string;
}

// Common chart options
const commonChartOptions = {
    animation: false,
    scales: {
        x: {
            type: 'time' as const,
            time: {
                unit: 'minute',
            },
            grid: {
                display: false,
            },
            border: {
                display: false,
            },
            ticks: {
                padding: 10,
            },
        },
        y: {
            beginAtZero: true,
            grid: {
                color: 'rgba(255,255,255,0.05)',
            },
            border: {
                display: false,
            },
            ticks: {
                padding: 10,
                callback(tickValue: number | string) {
                    return `${tickValue}W`;
                },
            },
        },
    },
    maintainAspectRatio: false,
    interaction: {
        intersect: false,
        mode: 'index' as const,
    },
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
                size: 13,
            },
            bodyFont: {
                size: 13,
            },
            displayColors: false,
            callbacks: {
                label(tooltipItem: TooltipItem<'line'>) {
                    return `${tooltipItem.parsed.y}W`;
                },
            },
        },
    },
} as const;

const chartDataset = (
    label: string,
    color: string,
    data: PowerData[],
    fillAbove: string,
    fillBelow: string,
) => ({
    type: 'line' as const,
    label,
    data: data
        .filter((d) => d.phase === 'net')
        .map((d) => ({
            x: new Date(d._time).getTime(),
            y: d._value,
        })),
    borderColor: color,
    borderWidth: 3,
    tension: 0.4,
    pointStyle: 'circle' as const,
    radius: 0,
    fill: {
        target: 'origin',
        above: fillAbove,
        below: fillBelow,
    },
});

function RealPower() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<Chart | null>(null);
    const { data } = $api.useQuery(
        'get',
        '/api/data/siteRealPower',
        undefined,
        {
            refetchInterval: 10_000,
        },
    );

    const chartData = useMemo(
        () => ({
            datasets: !data
                ? []
                : [
                      chartDataset(
                          'Net Power',
                          readingColors.site,
                          data,
                          'rgba(234, 84, 85, 0.1)', // Red tint for power import
                          'rgba(0, 208, 132, 0.1)', // Green tint for power export
                      ),
                  ],
        }),
        [data],
    );

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        if (chartRef.current === null) {
            chartRef.current = new Chart(canvasRef.current, {
                type: 'line',
                data: chartData,
                options: commonChartOptions,
            });

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

        chartRef.current.update();
    }, [chartData]);

    return (
        <Card>
            <CardHeader>
                <h1>Site real power</h1>
            </CardHeader>
            <CardBody>
                <div className="relative h-[500px]">
                    <canvas ref={canvasRef} />
                </div>
            </CardBody>
        </Card>
    );
}

function DERPower() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<Chart | null>(null);
    const { data } = $api.useQuery('get', '/api/data/derRealPower', undefined, {
        refetchInterval: 10_000,
    });

    const chartData = useMemo(
        () => ({
            datasets: !data
                ? []
                : [
                      chartDataset(
                          'DER Power',
                          readingColors.der,
                          data,
                          'rgba(172, 121, 234, 0.1)', // DER color tint
                          'rgba(172, 121, 234, 0.1)', // DER color tint
                      ),
                  ],
        }),
        [data],
    );

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        if (chartRef.current === null) {
            chartRef.current = new Chart(canvasRef.current, {
                type: 'line',
                data: chartData,
                options: commonChartOptions,
            });

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

        chartRef.current.update();
    }, [chartData]);

    return (
        <Card>
            <CardHeader>
                <h1>DER real power</h1>
            </CardHeader>
            <CardBody>
                <div className="relative h-[500px]">
                    <canvas ref={canvasRef} />
                </div>
            </CardBody>
        </Card>
    );
}

function LoadPower() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<Chart | null>(null);
    const { data } = $api.useQuery(
        'get',
        '/api/data/loadRealPower',
        undefined,
        {
            refetchInterval: 10_000,
        },
    );

    const chartData = useMemo(
        () => ({
            datasets: !data
                ? []
                : [
                      chartDataset(
                          'Load Power',
                          readingColors.load,
                          data,
                          'rgba(234, 121, 121, 0.1)', // Load color tint
                          'rgba(234, 121, 121, 0.1)', // Load color tint
                      ),
                  ],
        }),
        [data],
    );

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        if (chartRef.current === null) {
            chartRef.current = new Chart(canvasRef.current, {
                type: 'line',
                data: chartData,
                options: commonChartOptions,
            });

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

        chartRef.current.update();
    }, [chartData]);

    return (
        <Card>
            <CardHeader>
                <h1>Load real power</h1>
            </CardHeader>
            <CardBody>
                <div className="relative h-[500px]">
                    <canvas ref={canvasRef} />
                </div>
            </CardBody>
        </Card>
    );
}
