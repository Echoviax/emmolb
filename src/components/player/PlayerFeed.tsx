import { FeedMessage } from "@/types/FeedMessage";
import { useState, useDeferredValue, useMemo } from "react";
import { FeedTable } from "../team/TeamFeed";
import { usePlayerFeed } from "@/hooks/api/Player";
import { LoadingMini } from "../Loading";

type PlayerFeedProps = {
    playerId: string;
}

export function PlayerFeed({ playerId }: PlayerFeedProps) {
    const { data: feed, isPending: feedIsPending } = usePlayerFeed({ playerId })

    const [selectedSeason, setSelectedSeason] = useState<number | 'all'>('all');
    const [selectedType, setSelectedType] = useState('all');
    const [searchText, setSearchText] = useState('');
    const searchTextDeferred = useDeferredValue(searchText.toLowerCase());

    const uniqueSeasons = useMemo(() => (feed && Array.from(new Set(feed.map((event: FeedMessage) => event.season))).reverse()) ?? [], [feed]);

    const filteredFeed = useMemo(() => feed?.filter(entry => {
        if (selectedSeason && selectedSeason !== 'all' && selectedSeason !== entry.season)
            return false;

        if (selectedType !== 'all' && selectedType !== entry.type)
            return false;

        if (searchTextDeferred !== '' && !entry.text.toLowerCase().includes(searchTextDeferred))
            return false;

        return true;
    }).reverse() ?? [], [feed, selectedSeason, selectedType, searchTextDeferred]);

    if (feedIsPending) return (
        <div className="h-80">
            <LoadingMini />
        </div>
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
                    <div className='text-sm font-medium text-theme-secondary opacity-80'>Search:</div>
                    <input type='text' className='text-sm bg-(--theme-primary) p-1 rounded-sm' onChange={evt => setSearchText(evt.target.value)} />
                </div>
            </div>
            <FeedTable filteredFeed={filteredFeed} season={selectedSeason} />
        </>
    );
}