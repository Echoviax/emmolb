import { getContrastTextColor } from "@/helpers/ColorHelper";
import { Team } from "@/types/Team";
import Link from "next/link";

type MiniTeamHeaderProps = {
    team: Team;
    leader?: Team;
    index?: number;
    columnWidths?: number[];
    corruptedPlayers?: Record<string, number>;
};

export default function MiniTeamHeader({ team, leader, index, columnWidths, corruptedPlayers }: MiniTeamHeaderProps) {
    if (!team) return null;
    if (!('color' in team)) return null;

    const gamesBehind = (leader) ? (leader.record.regular_season.wins - team.record.regular_season.wins + team.record.regular_season.losses - leader.record.regular_season.losses) / 2 : null;
    let formattedGB: React.ReactNode = '';
    if (gamesBehind != null) {
        if (gamesBehind === 0) {
            formattedGB = '—';
        } else if (gamesBehind < 1) {
            formattedGB = <span style={{ fontFamily: 'geist, sans-serif' }}>½</span>;
        } else if (Number.isInteger(gamesBehind)) {
            formattedGB = `${gamesBehind}`;
        } else {
            formattedGB = (
                <>
                    {Math.floor(gamesBehind)}
                    <span style={{ fontFamily: 'geist, sans-serif' }}>½</span>
                </>
            );
        }
    }

    return (
        <Link href={`/team/${team.id}`} className='block'>
            <div className='flex max-sm:flex-col justify-between items-center p-2 rounded cursor-pointer transition h-16 sm:h-12' style={{ background: `#${team.color}`, color: getContrastTextColor(team.color) }}>
                <div className='flex max-sm self-start items-center gap-3 overflow-hidden min-w-0 max-w-full'>
                    {index ? <span className='w-5 text-right font-mono text-sm opacity-70 flex-shrink-0'>{index}.</span> : ''}
                    <span className='w-6 text-xl text-center flex-shrink-0 text-shadow-sm/30'>{team.emoji}</span>
                    <span className="flex-1 font-semibold text-left truncate min-w-0">{team.location} {team.name}</span>
                </div>
                <span className='max-sm:self-end text-sm font-semibold opacity-80 flex-shrink-0'>
                    {corruptedPlayers && corruptedPlayers[team.id] && (
                        <>
                            <span className="ml-2 text-right">
                                {corruptedPlayers[team.id]}
                            </span>
                            <span className="text-base text-shadow-sm/50">
                                🫀
                            </span>
                        </>
                    )}
                    <span className={`ml-2 ${columnWidths && `inline-block w-${columnWidths[0]} text-right`}`}>
                        {team.record.regular_season.wins}–{team.record.regular_season.losses}
                    </span>
                    <span className={`ml-1 ${columnWidths && `inline-block w-${columnWidths[1]} text-right`}`}>
                        {!columnWidths && '('}{team.record.regular_season.wins - team.record.regular_season.losses > 0 ? '+' : ''}{team.record.regular_season.wins - team.record.regular_season.losses}{!columnWidths && ')'}
                    </span>
                    <span className={`ml-1 ${columnWidths && `inline-block w-${columnWidths[2]} text-right`}`}>
                        {!columnWidths && '('}{team.record.regular_season.run_differential > 0 ? '+' : ''}{team.record.regular_season.run_differential}{!columnWidths && ')'}
                    </span>
                    {leader && (
                        <span className={`ml-1 ${columnWidths && `inline-block w-${columnWidths[3]} text-right`}`}>
                            {formattedGB}
                        </span>
                    )}
                </span>
            </div>
        </Link>
    );
}