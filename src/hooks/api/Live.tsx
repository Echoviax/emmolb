import { useCallback, useState } from "react";
import { usePolling } from "../Poll";
import { Event } from "@/types/Event";

type GameLastEventOptions = {
    gameId: string;
    initialData: Event | (() => Event);
    pollingFrequency?: number;
}

type GameLiveEventsOptions = {
    gameId: string;
    initialData: Event[] | (() => Event[]);
    pollingFrequency?: number;
    maxEvents?: number;
}

type GameLastEvent = {
    event: Event | null;
    isComplete: boolean;
}

type GameLiveEvents = {
    eventLog: Event[];
    isComplete: boolean;
}

export function useGameLastEvent({ gameId, initialData, pollingFrequency }: GameLastEventOptions): GameLastEvent {
    const { eventLog, isComplete } = useGameLiveEvents({
        gameId,
        initialData: typeof initialData === 'function' ? () => [initialData()] : [initialData],
        pollingFrequency,
        maxEvents: 1,
    });
    return {
        event: eventLog.length > 0 ? eventLog[eventLog.length - 1] : null,
        isComplete,
    };
}

export function useGameLiveEvents({ gameId, initialData, pollingFrequency = 6000, maxEvents }: GameLiveEventsOptions): GameLiveEvents {
    const [eventLog, setEventLog] = useState(initialData);
    const isComplete = eventLog.length > 0 && eventLog[eventLog.length - 1].event === 'Recordkeeping';

    const pollFn = useCallback(async () => {
        const after = eventLog.length > 0 ? eventLog[eventLog.length - 1].index + 1 : 0;
        const res = await fetch(`/nextapi/game/${gameId}/live?after=${after}${maxEvents && `&limit=${maxEvents}`}`);
        if (!res.ok) throw new Error("Failed to fetch events");
        return res.json();
    }, [gameId, eventLog]);

    const killCon = useCallback(() => {
        if (!eventLog || eventLog.length === 0) return false;
        return eventLog[eventLog.length - 1].event === 'Recordkeeping';
    }, [eventLog]);

    usePolling({
        interval: pollingFrequency,
        pollFn,
        onData: (newData) => {
            if (newData.entries?.length) {
                setEventLog(prev => ([...prev, ...newData.entries]));
            }
        },
        killCon
    });

    return { eventLog, isComplete };
}
