import { getContrastTextColor } from '@/helpers/ColorHelper';

type Team = {
    id?: string;
    name: string;
    emoji: string;
    color: string;
    record?: string;
};

type MockGameHeaderProps = {
    homeTeam: Team;
    awayTeam: Team;
    label?: string;
};

export default function MockGameHeader({ homeTeam, awayTeam, label }: MockGameHeaderProps) {
  return (
    <div className="rounded-xl shadow-lg overflow-visible border-2 border-theme-accent" style={{background: `linear-gradient(60deg, #${awayTeam.color} 36%, rgb(12, 17, 27) 50%, rgb(12, 17, 27) 50%, #${homeTeam.color} 64%)`,}}>
        <div className="grid grid-cols-[minmax(100px,1fr)_auto_minmax(100px,1fr)] items-center gap-x-2 px-2 py-3">
            <div className="flex flex-col items-center text-center" style={{ color: getContrastTextColor(awayTeam.color) }}>
                <div className="text-xl text-shadow-sm/30">{awayTeam.emoji}</div>
                <div className="text-sm font-semibold">{awayTeam.name}</div>
            </div>

            <div className="text-white text-sm font-bold text-center">{label || 'Upcoming'}<br></br>{awayTeam.record}</div>

            <div className="flex flex-col items-center text-center" style={{ color: getContrastTextColor(homeTeam.color) }}>
                <div className="text-xl text-shadow-sm/30">{homeTeam.emoji}</div>
                <div className="text-sm font-semibold">{homeTeam.name}</div>
            </div>
        </div>
    </div>
  );
}
