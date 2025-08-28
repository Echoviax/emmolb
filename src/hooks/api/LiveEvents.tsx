import { useEffect, useState } from "react";
import { Event } from "@/types/Event";
import { QueryClient, QueryFunctionContext, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { combineEnabled } from "./helpers";
import { GameHeaderQueryData } from "./Game";

type GameLiveEventsQueryKey = readonly ['game-live', gameId: string | undefined, { limit?: number }]
type GameLiveEventsQueryData = {
    entries: Event[];
    lastUpdated?: number;
}

async function fetchLiveEvents({ queryKey, client }: QueryFunctionContext<GameLiveEventsQueryKey>): Promise<GameLiveEventsQueryData> {
    const [_, gameId, { limit }] = queryKey;
    if (!gameId) throw new Error('gameId is required');

    const liveQueryData = client.getQueryData<GameLiveEventsQueryData>(queryKey);
    const gameQueryState = client.getQueryState<GameHeaderQueryData>(['gameheader', gameId]);
    const knownEvents = liveQueryData?.entries
        ?? gameQueryState?.data?.game.event_log
        ?? [];
    let lastUpdated = liveQueryData?.lastUpdated
        ?? gameQueryState?.dataUpdatedAt
        ?? undefined;
    const after = knownEvents.length > 0 ? knownEvents[knownEvents.length - 1].index + 1 : 0;

    const res = await fetch(`/nextapi/game/${gameId}/live?after=${after}${limit ? `&limit=${limit}` : ''}`);
    if (!res.ok) throw new Error("Failed to fetch events");
    const newEvents = await res.json();

    if (newEvents.entries?.length)
        lastUpdated = Date.now();
    let updatedEvents = newEvents.entries?.length ? knownEvents.concat(newEvents.entries) : knownEvents;
    if (limit)
        updatedEvents = updatedEvents.slice(-limit);
    return {
        entries: updatedEvents,
        lastUpdated
    };
}

type GameLiveEventsQueryOptions<TData> = {
    gameId: string;
    initialEvents: Event[];
    maxEvents?: number;
} & Omit<UseQueryOptions<GameLiveEventsQueryData, Error, TData, GameLiveEventsQueryKey>, 'queryKey' | 'queryFn' | 'select' | 'placeholderData' | 'initialData'>

type GameLiveEvents = {
    eventLog: Event[];
    isComplete: boolean;
    lastUpdated: number;
}

export function isGameComplete(event: Event | null) {
    return event?.event === 'Recordkeeping';
}

export function useGameLiveEvents({ gameId, initialEvents, maxEvents, ...options }: GameLiveEventsQueryOptions<GameLiveEventsQueryData>): GameLiveEvents {
    const [isComplete, setIsComplete] = useState(false);
    const client = useQueryClient();

    const interval = typeof options.refetchInterval === 'number' ? options.refetchInterval : 6000;
    const { data } = useQuery({
        queryKey: ['game-live', gameId, { limit: maxEvents }],
        queryFn: fetchLiveEvents,
        staleTime: interval / 2,
        gcTime: 5 * 60000,
        persister: undefined,
        placeholderData: { entries: initialEvents, lastUpdated: Date.now() },
        ...options,
        refetchInterval: interval,
        enabled: combineEnabled(options.enabled, !!gameId && !isComplete),
    });

    const eventLog = data?.entries ?? [];
    const lastUpdated = data?.lastUpdated ?? Date.now();
    const newIsComplete = eventLog.length > 0 ? isGameComplete(eventLog[eventLog.length - 1]) : isComplete;
    if (!isComplete && newIsComplete)
        setIsComplete(true);

    return { eventLog, isComplete: newIsComplete, lastUpdated };
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
        initialEvents: Array.isArray(initialState) ? initialState : (initialState ? [initialState] : []),
        maxEvents: 1,
        ...options
    });
    return {
        event: eventLog.length > 0 ? eventLog[eventLog.length - 1] : null,
        isComplete,
        lastUpdated,
    };
}

