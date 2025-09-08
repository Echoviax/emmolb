'use client';
import { useEffect, useState } from 'react';
import Loading from '@/components/Loading';
import Link from 'next/link';
import { LiveGameCompact } from '@/components/LiveGameCompact';
import { FullBlobileDisplay } from '@/components/BlobileLayout';
import { useSettings } from '@/components/Settings';
import { MapAPITeamResponse } from '@/types/Team';
import { MapAPIGameResponse } from '@/types/Game';
import Changelog from '@/components/Changelog';
import PostseasonPage from '@/components/PostSeason';
import DayGamesPage from '@/components/DayGamesPage';
import { useMmolbDay, useMmolbTime } from '@/hooks/api/Time';

interface GameHeaderApiResponse {
    teamId: string;
    gameHeader: GameHeaderResponse;
}

interface GameHeaderResponse {
    game: any;
    gameId: any;
    awayTeam: any;
    homeTeam: any;
}

export default function HomePage() {
    const [gameHeaders, setGameHeaders] = useState<GameHeaderApiResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const {settings} = useSettings();
    const [showPostseasonLink, setShowPostseasonLink] = useState(false);
    const [showHolidayPage, setShowHolidayPage] = useState(false);

    const { data: time } = useMmolbTime({});
    const day = (typeof time?.seasonDay === 'number' ? time.seasonDay : Number(time?.seasonDay)) ?? 1

    useEffect(() => {
        async function checkPostseasonStatus() {
            try {
                const res = await fetch('/nextapi/time');
                const data = await res.json();
                if (data?.season_status?.toLowerCase().includes('postseason')) {
                    setShowPostseasonLink(true);
                }
                else if (data?.season_status?.toLowerCase().includes('holiday')) {
                    setShowHolidayPage(true);
                }
            } catch (err) {
                console.error('Failed to check postseason status:', err);
            }
        }

        checkPostseasonStatus();
    }, []);

    useEffect(() => {
        async function fetchGameHeaders() {
            const favoriteTeamIDs = JSON.parse(localStorage.getItem('favoriteTeamIDs') || '[]');

            if (favoriteTeamIDs.length === 0) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch('/nextapi/gameheaders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ teamIds: favoriteTeamIDs }),
                });
                if (!res.ok) throw new Error('Failed to load game headers');

                const data: GameHeaderApiResponse[] = await res.json();
                setGameHeaders(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        fetchGameHeaders();
    }, []);

    if (loading) return <Loading />;

    if (showPostseasonLink) return <PostseasonPage />

    if (showHolidayPage) return (<>
            <div className='flex flex-col items-center justify-center h-[80vh] font-sans text-2xl text-theme-text'>
                It is currently Holiday
                <div>
                    There are no active games
                </div>
            </div>
        </>);

    if (JSON.parse(localStorage.getItem('favoriteTeamIDs') || '[]').length === 0) {
        return (<>
            <div className='flex flex-col items-center justify-center h-[80vh] select-none font-sans text-2xl text-theme-text'>
                You have no favorite teams<br></br><Link href="/teams" className='text-blue-100'>Go here to add some!</Link>
            </div>
        </>);
    }

    if (gameHeaders.length === 0) {
        return (<>
            <div className='flex flex-col items-center justify-center h-[80vh] select-none font-sans text-2xl text-theme-text'>
                None of your favorite teams are playing!
            </div>
        </>);
    }

    return (<>
        {settings.homePage?.displayAllGames 
        ? 
            <DayGamesPage season={time?.seasonNumber ?? 0} initialDay={day} dayDiff={1} /> 
        :
            <main className="mt-16">
                {settings.homePage?.useBlasesloaded ? gameHeaders.map(({ teamId, gameHeader }) => (
                    <Link key={teamId + "link"} href={"/game/" + gameHeader.gameId}>
                        <FullBlobileDisplay key={teamId} gameId={gameHeader.gameId} homeTeam={gameHeader.homeTeam} awayTeam={gameHeader.awayTeam} game={gameHeader.game} />
                    </Link>
                )) : (
                    <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-20 max-w-3xl mx-auto">
                        {gameHeaders.map(({ teamId, gameHeader }) => (
                            <Link key={teamId + "link"} href={"/game/" + gameHeader.gameId}>
                                <LiveGameCompact key={teamId} gameId={gameHeader.gameId} homeTeam={MapAPITeamResponse(gameHeader.homeTeam)} awayTeam={MapAPITeamResponse(gameHeader.awayTeam)} game={MapAPIGameResponse(gameHeader.game)} killLinks={true} />
                            </Link>
                        ))}
                        {settings.homePage?.showChangelog && (<Changelog />)}
                    </div>
                )}  
                {settings.homePage?.useBlasesloaded && settings.homePage?.showChangelog && (
                    <div className='max-w-3xl my-4 mx-auto'>
                        <Changelog />
                    </div>
                )}      
            </main>
        }
    </>);
}
