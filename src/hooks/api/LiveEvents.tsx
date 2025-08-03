import { useCallback, useState } from "react";
import { usePolling } from "../Poll";
import { Event } from "@/types/Event";

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

export function useGameLiveEvents({ gameId, initialState, pollingFrequency = 6000, maxEvents }: GameLiveEventsOptions): GameLiveEvents {
    const [eventLog, setEventLog] = useState(() => maxEvents ? initialState.slice(-maxEvents) : initialState);
    const [lastUpdated, setLastUpdated] = useState(Date.now());
    const isComplete = eventLog.length > 0 && isGameComplete(eventLog[eventLog.length - 1]);

    const pollFn = useCallback(async () => {
        const after = eventLog.length > 0 ? eventLog[eventLog.length - 1].index + 1 : 0;
        const res = await fetch(`/nextapi/game/${gameId}/live?after=${after}${maxEvents ? `&limit=${maxEvents}` : ''}`);
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
    }, [gameId, eventLog]);

    const killCon = useCallback(() => {
        if (!eventLog || eventLog.length === 0) return false;
        return isGameComplete(eventLog[eventLog.length - 1]);
    }, [eventLog]);

    usePolling({
        interval: pollingFrequency,
        pollFn,
        onData: (newData) => {
            if (newData.entries?.length) {
                setEventLog(prev => {
                    const newEventLog = [...prev, ...newData.entries];
                    return maxEvents ? newEventLog.slice(-maxEvents) : newEventLog;
                });
                setLastUpdated(Date.now());
            }
        },
        killCon
    });

    return { eventLog, isComplete, lastUpdated };
}
