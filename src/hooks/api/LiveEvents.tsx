import { useEffect, useState } from "react";
import { Event } from "@/types/Event";
import { QueryClient, useQuery } from "@tanstack/react-query";

type GameLastEventOptions = {
    gameId: string;
    initialState: Event[] | Event | null;
    pollingFrequency?: number;
}

type GameLiveEventsOptions = {
    gameId: string;
    initialState: Event[];
    pollingFrequency?: number;
    maxEvents?: number;
}

type GameLastEvent = {
    event: Event | null;
    isComplete: boolean;
    lastUpdated: number;
}

type GameLiveEvents = {
    eventLog: Event[];
    isComplete: boolean;
    lastUpdated: number;
}

export function isGameComplete(event: Event | null) {
    return event?.event === 'Recordkeeping';
}

export function useGameLastEvent({ gameId, initialState, pollingFrequency }: GameLastEventOptions): GameLastEvent {
    const { eventLog, isComplete, lastUpdated } = useGameLiveEvents({
        gameId,
        initialState: Array.isArray(initialState) ? initialState : (initialState ? [initialState] : []),
        pollingFrequency,
        maxEvents: 1,
    });
    return {
        event: eventLog.length > 0 ? eventLog[eventLog.length - 1] : null,
        isComplete,
        lastUpdated,
    };
}

async function fetchLiveEvents({ queryKey, client }: { queryKey: any, client: QueryClient }) {
    const [_game, gameId, _live, { after, limit }] = queryKey;
    const res = await fetch(`/nextapi/game/${gameId}/live?after=${after}${limit ? `&limit=${limit}` : ''}`);
    if (!res.ok) throw new Error("Failed to fetch events");
    const newEvents = await res.json();
    if (newEvents?.entries?.length) {
        // Cache an empty array for the next after value so we don't try to fetch it immediately
        const nextAfter = newEvents.entries[newEvents.entries.length - 1].index + 1;
        client.setQueryData(['game', gameId, 'live', { after: nextAfter, limit }], []);
    }
    return newEvents;
}

export function useGameLiveEvents({ gameId, initialState, pollingFrequency = 6000, maxEvents }: GameLiveEventsOptions): GameLiveEvents {
    const [eventLog, setEventLog] = useState(() => maxEvents ? initialState.slice(-maxEvents) : initialState);
    const [lastUpdated, setLastUpdated] = useState(Date.now());
    const isComplete = eventLog.length > 0 && isGameComplete(eventLog[eventLog.length - 1]);

    const after = eventLog.length > 0 ? eventLog[eventLog.length - 1].index + 1 : 0;
    const { data } = useQuery({
        queryKey: ['game', gameId, 'live', { after, limit: maxEvents }],
        queryFn: fetchLiveEvents,
        enabled: !!gameId && !isComplete,
        staleTime: pollingFrequency / 2,
        refetchInterval: pollingFrequency,
        gcTime: 60000,
    })

    useEffect(() => {
        if (data?.entries?.length) {
            setEventLog(prev => {
                const newEventLog = [...prev, ...data.entries];
                return maxEvents ? newEventLog.slice(-maxEvents) : newEventLog;
            });
            setLastUpdated(Date.now());
        }
    }, [data])

    return { eventLog, isComplete, lastUpdated };
}
