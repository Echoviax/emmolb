// components/EventBlock.tsx
// Authors: Luna, Navy, Vivi
import React, { useEffect } from "react";
import PitchZone from "./PitchZone";
import { getContrastTextColor } from "@/helpers/ColorHelper";
import { Event } from "@/types/Event";
import { useSettings } from "./Settings";

function useHighlightEventOnHash() {
    useEffect(() => {
        function highlight() {
            if (!window.location.hash) return;
            const id = window.location.hash.substring(1);
            const el = document.getElementById(id);
            if (el) {
                el.classList.add("highlighted-event");

                setTimeout(() => {
                    el.classList.remove("highlighted-event");
                }, 2000);
            }
        }

        highlight();

        window.addEventListener("hashchange", highlight);

        return () => {
            window.removeEventListener("hashchange", highlight);
        };
    }, []);
}

interface EventBlockProps {
    emoji?: string;
    title?: string;
    color?: string;
    titleColor?: string;
    messages: Event[] | { index: number, message: string, pitch_info?: string, zone?: string }[];
    onClick?: () => void;
    links?: boolean;
    inning?: string;
}

function getEventMessage(event: Event, mentionBatterOnHomer: boolean): string {
    let message = event.message;
    const batterName = (typeof event.batter === 'object' && event.batter !== null) ? event.batter.name : event.batter ?? '';

    if ((message.includes("homers on") || message.includes("grand slam")) && mentionBatterOnHomer) {
        if (!message.includes(`${batterName} scores!`)) {
            const scoreRegex = new RegExp(`<strong> Score is now ${event.away_score}-${event.home_score}</strong>`);
            if (scoreRegex.test(message))
                message = message.replace(scoreRegex, `<strong>${batterName} scores!</strong> <strong> Score is now ${event.away_score}-${event.home_score}</strong>`);
            else
                message += ` <strong>${batterName} scores!</strong>`;
        }
        if (!message.includes('Score is now '))
            message += `<strong> Score is now ${event.away_score}-${event.home_score}</strong>`;
    }
    if ((message.includes("scores!") || message.includes("steals home")) && !message.includes('Score is now ')) message += `<strong> Score is now ${event.away_score}-${event.home_score}</strong>`

    return message;
}

export function EventBlock({ emoji, title, color, titleColor, messages, onClick, links = true, inning }: EventBlockProps) {
    const { settings } = useSettings();

    useHighlightEventOnHash();
    return (
        <div className="relative mt-6">
            {(emoji || title) && (
                <div className={`absolute -top-3 left-3 z-10 inline-block rounded-full px-3 py-1 text-base font-bold text-theme-secondary border border-theme-accent shadow-md ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick} style={{ background: titleColor ? `#${titleColor}` : 'var(--theme-secondary)', borderColor: titleColor ? getContrastTextColor(titleColor) : 'var(--theme-accent)', color: titleColor ? getContrastTextColor(titleColor) : '' }}>
                    {emoji && <span className="mr-1">{emoji}</span>} {title}
                </div>
            )}
            {inning &&
                <div className={`absolute -top-3 right-3 z-10 inline-block rounded-full px-3 py-1 text-base font-bold text-theme-secondary border border-theme-accent shadow-md ${onClick ? 'cursor-pointer' : ''}`} style={{ background: 'var(--theme-secondary)', borderColor: 'var(--theme-accent)' }}>
                    {inning}
                </div>
            }
            <div className="rounded-md pt-6 p-3 mt-4" style={{ background: color || 'var(--theme-primary)' }}>
                <div className="text-sm whitespace-pre-line space-y-1">
                    {messages.map((event, i) => {
                        const { index, pitch_info, zone } = event;
                        const message = 'away_score' in event && settings.gamePage?.modifyEvents ? getEventMessage(event, settings.gamePage?.mentionBatterOnHomer) : event.message;
                        return (
                            <div key={index} className="flex justify-between items-start gap-2">
                                {links && (<button
                                    type="button"
                                    onClick={() => {
                                        const url = `${window.location.origin}${window.location.pathname}#event-${index}`;
                                        navigator.clipboard.writeText(url);
                                        (window as any).showCopiedPopup?.();
                                    }}
                                    className="cursor-pointer no-underline">
                                    🔗
                                </button>)}
                                <div id={`event-${index}`} className="flex-1 text-left leading-[1.3] [&>*]:inline [&>*]:whitespace-normal" style={{ scrollMarginTop: '15rem' }} dangerouslySetInnerHTML={{ __html: message }} />
                                {(pitch_info && zone) && (
                                    <div className="flex items-center gap-1 ml-2 text-[10px] opacity-80 w-fit shrink-0">
                                        <span>{pitch_info}</span>
                                        <PitchZone zone={Number(zone)} />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
