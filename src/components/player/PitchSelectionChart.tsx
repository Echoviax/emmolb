import { usePlayerPitchSelection } from "@/hooks/api/Player";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartOptions, LegendItem, Chart } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useSettings } from "../Settings";
import { LoadingMini } from "../Loading";

ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.defaults.font.family = 'GeistSans, "GeistSans Fallback"';

const pitchTypeColors: Record<string, string> = {
    'Fastball': '#195cc7',
    'Sinker': '#8186d7',
    'Cutter': '#3b059b',
    'Splitter': '#328bb0',
    'Slider': '#db2943',
    'Curveball': '#752017',
    'Sweeper': '#fb5c99',
    'Knuckle curve': '#e56d41',
    'Changeup': '#55a144',
};

export function PitchSelectionChart({ id }: { id: string }) {
    const { settings } = useSettings();
    const pitchSelection = usePlayerPitchSelection({
        playerId: id
    });

    const data = {
        datasets: [{
            data: pitchSelection.data?.map(p => p.count),
            backgroundColor: pitchSelection.data?.map(p => pitchTypeColors[p.pitch_type])
        }],
        labels: pitchSelection.data?.map(p => p.pitch_type),
    };

    const options: ChartOptions<'doughnut'> = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: settings.theme?.text, 
                    generateLabels: (chart: Chart): LegendItem[] => {
                        const { data } = chart;
                        const labels = data.labels || [];
                        const dataset = data.datasets[0];

                        if (!labels.length || !dataset) {
                            return [];
                        }

                        const total = (chart.getDatasetMeta(0) as any).total || 0;

                        return labels.map((label, i) => {
                            const value = (dataset.data[i] as number) || 0;
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

                            const backgroundColor = Array.isArray(dataset.backgroundColor)
                                ? dataset.backgroundColor[i]
                                : '#ccc';

                            return {
                                text: `${label}: ${chart.getDataVisibility(i) ? `${percentage}%` : ``} (${value})`,
                                fillStyle: backgroundColor,
                                strokeStyle: settings.theme?.text,
                                lineWidth: 1,
                                hidden: !chart.getDataVisibility(i),
                                index: i,
                                fontColor: settings.theme?.text
                            };
                        });
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const total = (context.chart.getDatasetMeta(0) as any).total || 0;
                        const label = context.label || '';
                        const value = context.raw as number;

                        if (total > 0) {
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${percentage}% (${value})`;
                        }
                        return `${label}: ${value}`;
                    }
                }
            }
        }
    };

    return (
        <div className='flex flex-col items-center gap-2 mt-6'>
            <div className="text-lg font-bold">Pitch Selection</div>
            <div className='w-120 h-60'>
                {!pitchSelection.isPending && pitchSelection.data && pitchSelection.data.length > 0
                    ? <Doughnut data={data} options={options} />
                    : <LoadingMini />
                }
            </div>
        </div>
    );
}