'use client'
import Loading from "@/components/Loading";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CheckboxDropdown from "../CheckboxDropdown";
import { useTeamFeed } from "@/hooks/api/Team";
import { Team } from "@/types/Team";

type TeamFeedProps = {
    team: Team;
}

export function TeamFeed({ team }: TeamFeedProps) {
    const { data: feed, isPending: feedIsPending } = useTeamFeed({ teamId: team.id });

    const [selectedSeasons, setSelectedSeasons] = useState<string[]>(["4"]);
    const [feedFilters, setFeedFilters] = useState<string[]>(["game", "augment"]);
    const [dropdownOpen, setDropdownOpen] = useState<{ season: boolean; type: boolean }>({ season: false, type: false });

    useEffect(() => {
        if (feed && feedFilters.length === 0) {
            const uniqueTypes = Array.from(new Set(feed.map((event: any) => event.type)));
            setFeedFilters(uniqueTypes);
        }
    }, [feed, feedFilters]);

    const uniqueTypes = useMemo<string[]>(() => (feed && Array.from(new Set(feed.map((event: any) => event.type)))) ?? [], [feed]);

    if (feedIsPending) return (
        <>
            <Loading />
        </>
    );

    if (!team) return (
        <>
            <div className="text-white text-center mt-10">Can't find that team</div>
        </>
    );

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xl font-bold">Recent Events</span>
                <div className="flex gap-3 mb-2">
                    <CheckboxDropdown
                        label="Seasons"
                        options={["1", "2", "3", "4"]}
                        selected={selectedSeasons}
                        setSelected={setSelectedSeasons}
                        isOpen={dropdownOpen.season}
                        toggleOpen={() => setDropdownOpen((prev) => ({ ...prev, season: !prev.season }))}
                    />
                    <CheckboxDropdown
                        label="Types"
                        options={uniqueTypes}
                        selected={feedFilters}
                        setSelected={setFeedFilters}
                        isOpen={dropdownOpen.type}
                        toggleOpen={() => setDropdownOpen((prev) => ({ ...prev, type: !prev.type }))}
                    />
                </div>
            </div>
            <div className="bg-theme-primary rounded-xl p-3 max-h-60 overflow-y-auto text-sm space-y-1">
                {feed!.filter((event: any) =>
                    selectedSeasons.includes(event.season?.toString()) && feedFilters.includes(event.type)).slice().reverse().map((event: any, i: number) => {
                        const parts = event.text.split(/( vs\. | - )/);

                        return (
                            <div key={i}>
                                {event.emoji} Season {event.season}, {event.status}, Day {event.day}:{' '}
                                {event.type === 'game' ? (() => {
                                    let linkIndex = 0;
                                    return parts.map((part: string, index: number) => {
                                        if (/^\s*vs\.\s*$|^\s*-\s*$/.test(part)) { return <span key={`sep-${index}`}>{part}</span>; }

                                        const link = event.links?.[linkIndex];
                                        linkIndex++;

                                        if (!link) {
                                            return <span key={`text-${index}`}>{part}</span>;
                                        }

                                        const href = link.type === 'game' ? `/watch/${link.id}` : `/${link.type}/${link.id}`;

                                        return (
                                            <Link key={`link-${index}`} href={href}>
                                                <span className="underline cursor-pointer">{part}</span>
                                            </Link>
                                        );
                                    });
                                })() : event.text}
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}