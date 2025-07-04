'use client';

import { EventBlock } from '@/components/EventBlock';
import React, { useEffect, useState } from 'react';

type PhaseTimes = Record<string, string>;

function formatCountdown(diffMs: number): string {
    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600) % 24;
    const days = Math.floor(totalSeconds / (3600 * 24));

    const parts: string[] = [];

    if (days > 0) parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    if (minutes > 0) parts.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
    if (parts.length === 0 || seconds > 0) {
        parts.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`);
    }

    return `Starts in ${parts.join(', ')}`;
}

export default function PhaseCountdownList() {
  const [now, setNow] = useState(() => new Date());
  const [phaseTimes, setPhaseTimes] = useState<PhaseTimes | null>(null);

  useEffect(() => {
    // Fetch phase times
    fetch('/nextapi/time')
      .then((res) => res.json())
      .then((data) => setPhaseTimes(data.phase_times))
      .catch((err) => {
        console.error('Failed to load phase times:', err);
        setPhaseTimes({});
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!phaseTimes) {
    return <div className="text-theme-secondary">Loading phase times...</div>;
  }

  const sorted = Object.entries(phaseTimes).sort(
    ([, a], [, b]) => new Date(a).getTime() - new Date(b).getTime()
  );

    const emoji: Record<string, string> = {
        'ElectionStart': '📜', 
        'HolidayStart': '🚧', 
        'HomeRunChallenge': '‼️', 
        'OpeningDay': '🏟️', 
        'PostseasonPreview': '👀', 
        'PostseasonRound1': '🏆', 
        'PostseasonRound2': '🏆', 
        'PostseasonRound3': '🏆', 
        'Preseason': '⚾', 
        'RegularSeasonResume': '⚾', 
        'SuperstarBreakStart': '⭐', 
        'SuperstarGame': '🌟',
    };

    return (
        <main className='mt-16'>
            <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 max-w-3xl mx-auto">
                <div className="space-y-8">
                    {sorted.map(([label, time]) => {
                        const target = new Date(time);
                        const diff = target.getTime() - now.getTime();
                        const isPast = diff <= 0;
                        const displayLabel = label.replace(/([a-z])([A-Z]|[0-9])/g, '$1 $2');

                        const localTimeStr = target.toLocaleString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                            timeZoneName: 'short'
                        });

                        return (!isPast ?
                            <EventBlock
                                key={displayLabel}
                                emoji={emoji[label]}
                                title={displayLabel}
                                messages={[{index: 0, message: `📅 ${localTimeStr}`}, {index: 1, message: `🕑 ${formatCountdown(diff)}`}]}
                                links={false}
                            /> : null
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
