// components/LeaguePage.tsx
'use client';
import { League } from "@/types/League";
import MiniTeamHeader from "../MiniTeamHeader";
import { Team } from "@/types/Team";

export type LeagueStandingsProps = {
    league: League;
    teams: Team[];
    cutoff?: { winDiff: number, minTeams: number, gamesLeft: number, text: string },
    showIndex?: boolean;
    customElement?: (team: Team) => React.ReactNode;
}

export function LeagueStandings({ league, teams, cutoff, showIndex, customElement }: LeagueStandingsProps) {
    if (!league || !teams.length) return (<div className="text-white text-center mt-10">Can't find that league</div>);
    const columnWidths = [14, 8, 10, 8];

    let cutoffIndex: number;
    if (cutoff) {
        const worstCaseTopTeam = cutoff.winDiff - cutoff.gamesLeft;
        cutoffIndex = teams.findIndex(team => (((team.record.regular_season.wins + cutoff.gamesLeft) - team.record.regular_season.losses) < (worstCaseTopTeam)));
        if (cutoffIndex !== -1)
            cutoffIndex = Math.max(cutoffIndex, cutoff.minTeams);
    }

    return <div className="flex flex-col justify-center gap-2">
        <div className='flex justify-end px-2 text-xs font-semibold uppercase'>
            <div className={`ml-1 w-${columnWidths[0]} text-right`}>Record</div>
            <div className={`ml-1 w-${columnWidths[1]} text-right`}>WD</div>
            <div className={`ml-1 w-${columnWidths[2]} text-right`}>RD</div>
            <div className={`ml-1 w-${columnWidths[3]} text-right`}>GB</div>
        </div>
        {teams.map((team: any, index) => (
            <div key={team.id || index}>
                {index === cutoffIndex && (
                    <div className="relative my-4 flex items-center" aria-label="Cutoff line">
                        <div className="absolute -left-2 sm:left-0 sm:-translate-x-full bg-theme-text text-xs font-bold px-2 py-0.5 rounded-sm select-none text-theme-background whitespace-nowrap">
                            {cutoff?.text}
                        </div>
                        <div className="flex-grow border-t-2 border-theme-text"></div>
                    </div>
                )}
                <MiniTeamHeader team={team} leader={teams[0]} index={showIndex ? index + 1 : undefined} columnWidths={columnWidths} />
                {customElement && customElement(team)}
            </div>
        ))}
    </div>;
}
