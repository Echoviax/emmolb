import { useEffect, useState } from "react";
import { Event } from "@/types/Event";
import { QueryClient, QueryFunctionContext, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { combineEnabled } from "./helpers";

type GameLiveEventsQueryKey = readonly ['game-live', gameId: string | undefined, { after?: number, limit?: number }]
type GameLiveEventsQueryData = {
    entries: Event[];
}

async function fetchLiveEvents({ queryKey, client }: QueryFunctionContext<GameLiveEventsQueryKey>): Promise<GameLiveEventsQueryData> {
    const [_, gameId, { after, limit }] = queryKey;
    if (!gameId) throw new Error('gameId is required');
    const res = await fetch(`/nextapi/game/${gameId}/live?after=${after}${limit ? `&limit=${limit}` : ''}`);
    if (!res.ok) throw new Error("Failed to fetch events");
    const newEvents = await res.json();
    if (newEvents?.entries?.length) {
        // Cache an empty array for the next after value so we don't try to fetch it immediately
        const nextAfter = newEvents.entries[newEvents.entries.length - 1].index + 1;
        client.setQueryData(['game-live', gameId, { after: nextAfter, limit }], []);
    }
    return newEvents;
}

type GameLiveEventsQueryOptions<TData> = {
    gameId: string;
    initialState: Event[];
    maxEvents?: number;
} & Omit<UseQueryOptions<GameLiveEventsQueryData, Error, TData, GameLiveEventsQueryKey>, 'queryKey' | 'queryFn' | 'select'>

type GameLiveEvents = {
    eventLog: Event[];
    isComplete: boolean;
    lastUpdated: number;
}

export function isGameComplete(event: Event | null) {
    return event?.event === 'Recordkeeping';
}

export function useGameLiveEvents({ gameId, initialState, maxEvents, ...options }: GameLiveEventsQueryOptions<GameLiveEventsQueryData>): GameLiveEvents {
    const [eventLog, setEventLog] = useState(() => maxEvents ? initialState.slice(-maxEvents) : initialState);
    const [lastUpdated, setLastUpdated] = useState(Date.now());
    const isComplete = eventLog.length > 0 && isGameComplete(eventLog[eventLog.length - 1]);

    const after = eventLog.length > 0 ? eventLog[eventLog.length - 1].index + 1 : 0;
    const interval = typeof options.refetchInterval === 'number' ? options.refetchInterval : 6000;
    const { data } = useQuery({
        queryKey: ['game-live', gameId, { after, limit: maxEvents }],
        queryFn: fetchLiveEvents,
        staleTime: interval / 2,
        gcTime: 60000,
        persister: undefined,
        ...options,
        refetchInterval: interval,
        enabled: combineEnabled(options.enabled, !!gameId && !isComplete),
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

type GameLastEventOptions<TData> = {
    gameId: string;
    initialState: Event[] | Event | null;
} & Omit<UseQueryOptions<GameLiveEventsQueryData, Error, TData, GameLiveEventsQueryKey>, 'queryKey' | 'queryFn' | 'select'>

type GameLastEvent = {
    event: Event | null;
    isComplete: boolean;
    lastUpdated: number;
}

export function useGameLastEvent({ gameId, initialState, ...options }: GameLastEventOptions<GameLiveEventsQueryData>): GameLastEvent {
    const { eventLog, isComplete, lastUpdated } = useGameLiveEvents({
        gameId,
        initialState: Array.isArray(initialState) ? initialState : (initialState ? [initialState] : []),
        maxEvents: 1,
        ...options
    });
    return {
        event: eventLog.length > 0 ? eventLog[eventLog.length - 1] : null,
        isComplete,
        lastUpdated,
    };
}

