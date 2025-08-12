'use client'
import { useEffect, useState } from "react";
import Loading from "../Loading";
import { MapAPITeamResponse, MapTeamLite, Team } from "@/types/Team";
import { EditLeague } from "./EditCustomLeague";
import { Time } from "@/types/Time";
import { fetchTime } from "@/types/Api";
import GamesRemaining, { getGamesLeft } from "./GamesRemaining";
import { LeagueStandings } from "./LeagueStandings";
import LeagueHeader from "./LeagueHeader";

type CustomLeagueSubleaguePageProps = {
    league: any;
};

export default function CustomLeagueSubleaguePage({ league }: CustomLeagueSubleaguePageProps) {
    const [input, setInput] = useState('');
    const [teams, setTeams] = useState<Team[]>([]);
    const [time, setTime] = useState<Time>();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [hideInactive, setHideInactive] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string>('');

    useEffect(() => {
        async function getTeams() {
            try {
                if (league?.league_teams?.trim()) {
                    const res = await fetch(`/nextapi/cashews-teams-lite?ids=${league.league_teams}`);
                    if (!res.ok) throw new Error('Failed to fetch team!');
                    const data = await res.json();
                    const teams: Team[] = data.map((t: any) => MapTeamLite(t));
                    setTeams(teams);
                }

                setTime(await fetchTime());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        getTeams();
    }, [league?.league_teams]);

    const addTeamID = async () => {
        const trimmedId = input.trim();
        if (!trimmedId) return;

        setStatus('submitting');

        try {
            const teamRes = await fetch(`/nextapi/team/${trimmedId}`);
            if (!teamRes.ok) throw new Error('Could not fetch new team data.');

            const addRes = await fetch('/nextapi/db/leagues/add-team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    league_name: league.league_name,
                    team_id: trimmedId,
                }),
            });

            if (!addRes.ok) {
                const errorData = await addRes.json();
                throw new Error(errorData.message || 'Failed to add team.');
            }

            const newTeam = MapAPITeamResponse(await teamRes.json());
            setTeams(prevTeams => [...prevTeams, newTeam]);
            setInput('');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setStatus('idle');
        }
    };

    const removeTeamID = async (id: string) => {
        setStatus('submitting');

        try {
            const removeRes = await fetch('/nextapi/db/leagues/remove-team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    league_name: league.league_name,
                    team_id: id,
                }),
            });

            if (!removeRes.ok) {
                const errorData = await removeRes.json();
                throw new Error(errorData.error || 'Failed to remove team.');
            }

            setTeams(prevTeams => prevTeams.filter(team => team.id !== id));

        } catch (err: any) {
            console.log(err);
            setError(err.message);
        } finally {
            setStatus('idle');
        }
    };

    if (loading || !time) return (<Loading />);
    if (!teams.length) return (
        <div className="mb-8">
            {isEditing ?
                (<EditLeague league={league} status={status} setStatus={setStatus} />)
                :
                (<>
                    <LeagueHeader league={league} />
                    <button onClick={() => setIsEditing(prev => !prev)} className="px-4 py-2 link-hover text-theme-secondary rounded mb-4">
                        {isEditing ? 'Save Changes' : 'Edit League'}
                    </button>
                    <button onClick={() => setHideInactive(prev => !prev)} className="px-4 py-2 link-hover text-theme-secondary rounded mb-4">
                        {hideInactive ? 'Show Inactive Teams' : 'Hide Inactive Teams'}
                    </button>
                </>)
            }
            {isEditing && (<div className="flex flex-col w-2xl">
                <input type="text" placeholder="Enter Team ID" value={input} onChange={e => setInput(e.target.value)} className="p-2 border rounded mb-2 text-theme-secondary opacity-80" />
                <button onClick={addTeamID} className="px-4 py-2 link-hover text-theme-secondary rounded mb-4">
                    {status === 'submitting' ? 'Editing...' : 'Add Team'}
                </button>
            </div>)}
            {error && (<div>{error}</div>)}
        </div>
    );

    teams.sort((a, b) => {
        const aWins = a.record.regular_season.wins;
        const aLosses = a.record.regular_season.losses;
        const bWins = b.record.regular_season.wins;
        const bLosses = b.record.regular_season.losses;

        const winDiff = (bWins - bLosses) - (aWins - aLosses);
        if (winDiff !== 0) return winDiff;

        return b.record.regular_season.run_differential - a.record.regular_season.run_differential;
    });

    const gamesLeft = getGamesLeft(time, false);
    const topTeamWinDiff = teams[0].record.regular_season.wins - teams[0].record.regular_season.losses;

    return (
        <div className="min-h-screen">
            {isEditing ?
                (<EditLeague league={league} status={status} setStatus={setStatus} />)
                :
                (<>
                    <LeagueHeader league={league} />
                    <div className="flex justify-between mt-2">
                        <button onClick={() => setIsEditing(prev => !prev)} className="px-4 py-2 link-hover text-theme-secondary rounded mb-4">
                            {isEditing ? 'Save Changes' : 'Edit League'}
                        </button>
                        <button onClick={() => setHideInactive(prev => !prev)} className="px-4 py-2 link-hover text-theme-secondary rounded mb-4">
                            {hideInactive ? 'Show Inactive Teams' : 'Hide Inactive Teams'}
                        </button>
                    </div>
                </>)
            }
            {isEditing && (<div className="flex flex-col w-2xl max-w-full">
                <input type="text" placeholder="Enter Team ID" value={input} onChange={e => setInput(e.target.value)} className="p-2 border rounded mb-2 text-theme-secondary opacity-80" />
                <button onClick={addTeamID} className="self-start px-4 py-2 link-hover text-theme-secondary rounded mb-4">
                    {status === 'submitting' ? 'Adding...' : 'Add Team'}
                </button>
            </div>)}
            {error && (<div>{error}</div>)}
            <GamesRemaining time={time} playsOnOddDays={false} />

            <div className="flex justify-center">
                <div className='w-full max-w-[36rem]'>
                    <LeagueStandings
                        league={league}
                        teams={teams}
                        cutoff={{ winDiff: topTeamWinDiff, minTeams: 1, gamesLeft: gamesLeft[1], text: '#1 CUTOFF' }}
                        showIndex={true}
                        customElement={(team) =>
                            isEditing && (
                                <button onClick={() => removeTeamID(team.id)} className="text-red-500 hover:underline text-sm" disabled={status === 'submitting'}>
                                    Remove
                                </button>
                            )
                        } />
                </div>
            </div>
        </div>
    );
}