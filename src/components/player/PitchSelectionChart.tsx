import { usePlayerPitchSelection } from "@/hooks/api/Player";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, ChartOptions, LegendItem, Chart } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useSettings } from "../Settings";
import { LoadingMini } from "../Loading";
import { pitchAbbrToName, Player, pitchAbbrToCategory } from "@/types/Player";
import { Tooltip } from "../ui/Tooltip";

ChartJS.register(ArcElement, ChartTooltip, Legend);
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

// Actual pitch usage stats
export function PitchUsageChart({ id }: { id: string }) {
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
    const title = "Actual Pitch Usage";
    return PitchChart({ data, settings, pitchSelection, title });
}

// Expected pitch selection stats from Player object
export function PitchSelectionChart({ player }: { player: Player }) {

    const { settings } = useSettings();

    // Extract pitch names and percentages from player.pitch_selection
    const pitchEntries = Object.entries(player.pitch_selection || {});
    const pitchNames = pitchEntries.map(([name]) => name);
    const pitchPercentages = pitchEntries.map(([, pct]) => pct);

    const data = {
        datasets: [{
            data: pitchPercentages,
            backgroundColor: pitchNames.map(p => pitchTypeColors[p] || '#cccccc')
        }],
        labels: pitchNames,
    };

    const hasData = pitchEntries.length > 0;
    const title = "Expected Pitch Selection";
    return PitchChart({ data, settings, pitchSelection: { isPending: false, data: hasData ? pitchEntries : null }, title });
}

export function PitchChart({ data, settings, pitchSelection, title = "Pitch Selection" }: { data: any, settings: any, pitchSelection: any, title?: string }) {

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
            <div className="text-lg font-bold">{title}</div>
            <div className='w-120 h-60'>
                {pitchSelection && !pitchSelection.isPending && pitchSelection.data && pitchSelection.data.length > 0
                    ? <Doughnut data={data} options={options} />
                    : <LoadingMini />
                }
            </div>
        </div>
    );
}
// table to show pitch type bonuses and category bonuses
export function PitchBonusesTable({ player }: { player: Player }) {
    const pitchCategoryBonuses = player.pitch_category_bonuses;
    const pitchTypeBonuses = player.pitch_type_bonuses;
    const pitchTypes = player.pitch_selection ? Object.keys(player.pitch_selection) : [];
    if (!pitchCategoryBonuses && !pitchTypeBonuses) {
        return <div />;
    }

    return (
        <div className="mt-6 w-full max-w-2xl">
            <div className="text-lg font-bold mb-4">Pitch Bonuses</div>
            <table className="w-full table-auto border-collapse border border-theme-text">
                <thead>
                    <tr>
                        <th className="border border-theme-text px-4 py-2 text-left">Pitch Type</th>
                        <th className="border border-theme-text px-4 py-2 text-left">Type Bonus</th>
                        <th className="border border-theme-text px-4 py-2 text-left">
                            <Tooltip content={
                                <div>
                                    {pitchCategoryBonuses && Object.entries(pitchCategoryBonuses).map(([category, bonus]) => (
                                        <div key={category}>{category}: {bonus > 0 ? `+${(bonus * 100).toFixed(1)}%` : `${(bonus * 100).toFixed(1)}%`}</div>
                                    ))}
                                </div>
                            }>
                                <span className="cursor-help">Category Bonus</span>
                            </Tooltip>
                        </th>
                        <th className="border border-theme-text px-4 py-2 text-left">Total Bonus</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(pitchAbbrToName)
                        .filter(([_abbr, name]) => pitchTypes.includes(name))
                        .map(([abbr, name]) => {
                            const typeBonus = pitchTypeBonuses?.[abbr] ?? 0;
                            const category = pitchAbbrToCategory[abbr];
                            const categoryBonus = pitchCategoryBonuses?.[category] ?? 0;
                            const totalBonus = typeBonus + categoryBonus;

                            return (
                                <tr key={abbr}>
                                    <td className="border border-theme-text px-4 py-2">{name}</td>
                                    <td className="border border-theme-text px-4 py-2">{typeBonus > 0 ? `+${(typeBonus * 100).toFixed(1)}%` : `${(typeBonus * 100).toFixed(1)}%`}</td>
                                    <td className="border border-theme-text px-4 py-2">{categoryBonus > 0 ? `+${(categoryBonus * 100).toFixed(1)}%` : `${(categoryBonus * 100).toFixed(1)}%`}</td>
                                    <td className="border border-theme-text px-4 py-2">{totalBonus > 0 ? `+${(totalBonus * 100).toFixed(1)}%` : `${(totalBonus * 100).toFixed(1)}%`}</td>
                                </tr>
                            );
                        })}
                </tbody>
            </table>
        </div>
    );

}
