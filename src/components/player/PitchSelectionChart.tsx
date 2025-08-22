import { usePlayerPitchSelection } from "@/hooks/api/Player";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useSettings } from "../Settings";
import { LoadingMini } from "../Loading";

ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.defaults.font.family = 'GeistSans, "GeistSans Fallback"';

const pitchTypeColors: Record<string, string> = {
    'Fastball': '#195cc7',      // oklch(0.5 0.18 260)
    'Sinker': '#8186d7',        // oklch(0.65 0.12 280)
    'Cutter': '#3b059b',        // oklch(0.35 0.2 285)
    'Splitter': '#328bb0',      // oklch(0.6 0.1 230)
    'Slider': '#db2943',        // oklch(0.58 0.21 20)
    'Curveball': '#752017',     // oklch(0.38 0.12 30)
    'Sweeper': '#fb5c99',       // oklch(0.7 0.2 360)
    'Knuckle Curve': '#e56d41', // oklch(0.67 0.16 40)
    'Changeup': '#55a144',      // oklch(0.64 0.15 140)
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

    return (
        <div className='flex flex-col items-center gap-2 mt-6'>
            <div className="text-lg font-bold">Pitch Selection</div>
            <div className='w-80 h-60'>
                {!pitchSelection.isPending
                    ? <Doughnut data={data} options={{
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right',
                                labels: {
                                    color: settings.theme?.text,
                                }
                            },
                        }
                    }} />
                    : <LoadingMini />
                }
            </div>
        </div>
    );
}