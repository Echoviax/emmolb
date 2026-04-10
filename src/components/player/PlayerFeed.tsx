import { FeedMessage } from "@/types/FeedMessage";
import { useState, useDeferredValue, useMemo } from "react";
import { FeedTable } from "../team/TeamFeed";
import { usePlayerFeed } from "@/hooks/api/Player";
import { LoadingMini } from "../Loading";

type PlayerFeedProps = {
    playerId: string;
}

export function PlayerFeed({ playerId }: PlayerFeedProps) {
    const { data: initialData, isPending: feedIsPending } = usePlayerFeed({ playerId });
    const [extraPages, setExtraPages] = useState<FeedMessage[][]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const activeCursor = nextCursor ?? initialData?.next_cursor ?? null;

    const feed = useMemo(() => {
        if (!initialData?.feed) return undefined;
        return [...initialData.feed, ...extraPages.flat()];
    }, [initialData, extraPages]);

    async function fetchMore() {
        if (!activeCursor) return;
        setIsFetchingMore(true);
        try {
            const res = await fetch(`/nextapi/player/${playerId}/feed?cursor=${encodeURIComponent(activeCursor)}`);
            if (!res.ok) throw new Error('Failed to fetch more feed data');
            const data = await res.json();
            setExtraPages(prev => [...prev, data.feed]);
            setNextCursor(data.next_cursor ?? null);
        } finally {
            setIsFetchingMore(false);
        }
    }

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
    }) ?? [], [feed, selectedSeason, selectedType, searchTextDeferred]);

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
            {/* IDK if this is actually needed for players but maybe eventually a player will have a lot of feed events! */}
            {activeCursor && (
                <div className='flex justify-center my-4'>
                    <button
                        className='text-sm px-4 py-2 rounded-sm bg-(--theme-primary) hover:opacity-80 disabled:opacity-50'
                        onClick={fetchMore}
                        disabled={isFetchingMore}
                    >
                        {isFetchingMore ? 'Loading...' : 'Fetch more'}
                    </button>
                </div>
            )}
        </>
    );
}
