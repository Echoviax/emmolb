'use client';

import { EventBlock } from '@/components/EventBlock';
import { formatCountdown } from '@/helpers/TimeHelper';
import React, { useEffect, useState } from 'react';

type PhaseTimes = Record<string, string>;

export default function PhaseCountdownList() {
  const [now, setNow] = useState(() => new Date());
  const [phaseTimes, setPhaseTimes] = useState<PhaseTimes | null>(null);

  useEffect(() => {
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
