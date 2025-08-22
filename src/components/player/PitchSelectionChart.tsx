import { usePlayerPitchSelection } from "@/hooks/api/Player";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Colors, plugins } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useSettings } from "../Settings";

ChartJS.register(ArcElement, Tooltip, Legend, Colors);
ChartJS.defaults.font.family = 'GeistSans, "GeistSans Fallback"';

export function PitchSelectionChart({ id }: { id: string }) {
    const { settings } = useSettings();
    const pitchSelection = usePlayerPitchSelection({
        playerId: id
    });

    const data = {
        datasets: [{
            data: pitchSelection.data?.map(p => p.count) ?? [],
        }],
        labels: pitchSelection.data?.map(p => p.pitch_type),
    };

    return (
        <div className='flex flex-col items-center gap-2 mt-6'>
            <div className="text-lg font-bold">Pitch Selection</div>
            {!pitchSelection.isPending && <div className='w-80 h-60'>
                <Doughnut data={data} options={{
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
            </div>}
        </div>
    );
}