'use client'

import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

export default function Error({ error, reset, }: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const queryClient = useQueryClient();

    useEffect(() => {
        console.error(error)
    }, [error]);

    function clearCacheAndReset() {
        queryClient.clear();
        reset();
    }

    return (
        <main className="mt-16">
            <div className='flex flex-col items-center justify-center gap-2 w-full h-[80vh]'>
                <h2 className='text-3xl font-bold'>Oh no!</h2>
                <div className='text-base'>EMMOLB has exploded.</div>
                <button className="px-3 py-1 text-xs bg-theme-primary hover:opacity-80 rounded-md" onClick={() => clearCacheAndReset()}>Clear cache and try again</button>
            </div>
        </main>
    );
}