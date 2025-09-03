'use client'
import Loading from "@/components/Loading";
import Link from "next/link";
import { ReactNode, useDeferredValue, useMemo, useState } from "react";
import { useTeamFeed } from "@/hooks/api/Team";
import { Team } from "@/types/Team";
import { FeedMessage } from "@/types/FeedMessage";

type TeamFeedProps = {
    team: Team;
}

export function TeamFeed({ team }: TeamFeedProps) {
    const { data: feed, isPending: feedIsPending } = useTeamFeed({ teamId: team.id });

    const [selectedSeason, setSelectedSeason] = useState<number | 'all'>();
    const [selectedType, setSelectedType] = useState('all');
    const [selectedPlayer, setSelectedPlayer] = useState('all');
    const [searchText, setSearchText] = useState('');
    const searchTextDeferred = useDeferredValue(searchText.toLowerCase());

    const uniqueSeasons = useMemo(() => (feed && Array.from(new Set(feed.map((event: FeedMessage) => event.season))).reverse()) ?? [], [feed]);
    const latestSeason = uniqueSeasons.length > 0 && uniqueSeasons[0];
    if (!selectedSeason && latestSeason)
        setSelectedSeason(latestSeason);

    const filteredFeed = useMemo(() => feed?.filter(entry => {
        if (selectedSeason && selectedSeason !== 'all' && selectedSeason !== entry.season)
            return false;

        if (selectedType !== 'all' && selectedType !== entry.type)
            return false;

        if (selectedPlayer !== 'all' && entry.links.every(x => x.id !== selectedPlayer))
            return false;

        if (searchTextDeferred !== '' && !entry.text.toLowerCase().includes(searchTextDeferred))
            return false;

        return true;
    }).reverse() ?? [], [feed, selectedSeason, selectedType, selectedPlayer, searchTextDeferred]);

    if (feedIsPending) return (
        <>
            <Loading />
        </>
    );

    function handleSeasonChange(newValue: string) {
        if (newValue === 'all')
            setSelectedSeason(newValue);
        else
            setSelectedSeason(Number(newValue));
    }

    return (
        <>
            <div className='flex flex-wrap mt-4 gap-x-8 gap-y-2 justify-center'>
                <div className='flex gap-2 items-center'>
                    <div className='text-sm font-medium text-theme-secondary opacity-80'>Season:</div>
                    <select className='text-sm bg-(--theme-primary) p-1 rounded-sm' value={selectedSeason} onChange={evt => handleSeasonChange(evt.target.value)}>
                        <option value='all'>All</option>
                        {uniqueSeasons.map(season => <option key={season} value={season}>{season}</option>)}
                    </select>
                </div>
                <div className='flex gap-2 items-center'>
                    <div className='text-sm font-medium text-theme-secondary opacity-80'>Type:</div>
                    <select className='text-sm bg-(--theme-primary) p-1 rounded-sm' value={selectedType} onChange={evt => setSelectedType(evt.target.value)}>
                        <option value='all'>All</option>
                        <option value='game'>Game</option>
                        <option value='augment'>Augment</option>
                    </select>
                </div>
                <div className='flex gap-2 items-center'>
                    <div className='text-sm font-medium text-theme-secondary opacity-80'>Player:</div>
                    <select className='text-sm bg-(--theme-primary) p-1 rounded-sm' value={selectedPlayer} onChange={evt => setSelectedPlayer(evt.target.value)}>
                        <option value='all'>All</option>
                        {team.players.map(player => <option key={player.player_id} value={player.player_id}>{player.slot} {player.first_name} {player.last_name}</option>)}
                    </select>
                </div>
                <div className='flex gap-2 items-center'>
                    <div className='text-sm font-medium text-theme-secondary opacity-80'>Search:</div>
                    <input type='text' className='text-sm bg-(--theme-primary) p-1 rounded-sm' onChange={evt => setSearchText(evt.target.value)} />
                </div>
            </div>
            <FeedTable filteredFeed={filteredFeed} season={selectedSeason} team={team} />
        </>
    );
}

type FeedTableProps = {
    filteredFeed: FeedMessage[],
    season?: string | number,
    team?: Team
}

export function FeedTable({ filteredFeed, season, team }: FeedTableProps) {
    if (filteredFeed.length === 0)
        return <div className="text-base mt-12 text-center">No events match the specified filter.</div>

    return (
        <div className={`grid gap-x-2 md:gap-x-4 my-4 max-md:w-full md:min-w-2xl max-w-4xl ${season !== 'all' ? 'grid-cols-[max-content_max-content_auto]' : 'grid-cols-[max-content_max-content_max-content_auto]'}`}>
            {season === 'all' && <div className='row-1 col-2 py-1 text-center text-xs uppercase font-semibold'>Season</div>}
            <div className={`row-1 ${season !== 'all' ? 'col-2' : 'col-3'} py-1 text-center text-xs uppercase font-semibold`}>Day</div>
            {filteredFeed.map((event, i) => {
                let day = event.day;
                if (day === 'Preseason')
                    day = 'Pre';
                else if (day === 'Superstar Break')
                    day = 'SSB';
                else if (day === 'Superstar Game')
                    day = 'SSG';
                else if (day === 'Holiday')
                    day = 'Hol';
                else if (day === 'Election')
                    day = 'Ele';

                let lastIndex = 0;
                const nodes: ReactNode[] = [];
                for (const link of event.links) {
                    if (team && link.match === `${team.emoji} ${team.location} ${team.name}`)
                        continue;

                    const startIndex = event.text.indexOf(link.match, lastIndex);
                    if (startIndex === -1)
                        continue;

                    if (startIndex > lastIndex)
                        nodes.push(event.text.substring(lastIndex, startIndex));

                    const href = link.type === 'game' ? `/watch/${link.id}` : `/${link.type}/${link.id}`;
                    lastIndex = startIndex + link.match.length;
                    nodes.push(<Link key={nodes.length} className='text-theme-link underline cursor-pointer' href={href}>
                        {event.text.substring(startIndex, lastIndex)}
                    </Link>);
                }
                if (lastIndex < event.text.length)
                    nodes.push(event.text.substring(lastIndex));

                return (
                    <div className='col-span-full grid-cols-subgrid grid items-baseline p-1 text-sm odd:bg-(--theme-primary) even:bg-(--theme-secondary) border-t-1 last:border-b-1 border-(--theme-text)/50' key={i}>
                        <div className='col-auto text-lg pl-2'>{event.emoji}</div>
                        {season === 'all' && <div className='col-auto text-center text-base font-semibold'>{event.season}</div>}
                        <div className='col-auto text-center text-base font-semibold'>{day}</div>
                        <div className='col-auto pr-2 pb-0.5'>
                            {nodes}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
