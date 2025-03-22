import { createLazyFileRoute } from '@tanstack/react-router';
import { type ChartData } from 'chart.js/auto';
import { Chart } from 'chart.js/auto';
import 'chartjs-adapter-date-fns';
import { useEffect, useMemo, useRef } from 'react';
import { Card, CardBody, CardHeader } from "@heroui/card";

import { readingColors } from '../../../tailwind.config';

import { useSiteRealPower } from '@/gen/hooks';

export const Route = createLazyFileRoute('/readings')({
    component: Readings,
});

function Readings() {
    return (
        <div>
            <RealPower />
        </div>
    );
}

function RealPower() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<Chart | null>(null);
    const { data } = useSiteRealPower({ query: { refetchInterval: 1000 } });

    const chartData = useMemo((): ChartData<
        'line',
        { x: number; y: number }[]
    > => {
        if (!data) {
            return { datasets: [] };
        }

        return {
            datasets: [
                {
                    label: 'Net',
                    data: data
                        .filter((d) => d.phase === 'net')
                        .map((d) => ({
                            x: new Date(d._time).getTime(),
                            y: d._value,
                        })),
                    borderColor: readingColors.site,
                    borderWidth: 1.5,
                    pointStyle: false,
                    fill: {
                        target: 'origin',
                        above: 'rgba(255,100,100,0.05)',
                        below: 'rgba(100,255,100,0.05)',
                    },
                },
                {
                    label: 'Phase A',
                    data: data
                        .filter((d) => d.phase === 'A')
                        .map((d) => ({
                            x: new Date(d._time).getTime(),
                            y: d._value,
                        })),
                    borderWidth: 1.5,
                    pointStyle: false,
                },
                {
                    label: 'Phase B',
                    data: data
                        .filter((d) => d.phase === 'B')
                        .map((d) => ({
                            x: new Date(d._time).getTime(),
                            y: d._value,
                        })),
                    borderWidth: 1.5,
                    pointStyle: false,
                },
                {
                    label: 'Phase C',
                    data: data
                        .filter((d) => d.phase === 'C')
                        .map((d) => ({
                            x: new Date(d._time).getTime(),
                            y: d._value,
                        })),
                    borderWidth: 1.5,
                    pointStyle: false,
                },
            ],
        };
    }, [data]);

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        if (chartRef.current === null) {
            chartRef.current = new Chart(canvasRef.current, {
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
                            grid: {
                                display: false,
                            },
                        },
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255,255,255,0.05)',
                            },
                        },
                    },
                    maintainAspectRatio: false,
                    interaction: {
                        intersect: false,
                        mode: 'index',
                    },
                },
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
