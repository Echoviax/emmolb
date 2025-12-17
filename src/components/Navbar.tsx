"use client";

import { getContrastTextColor } from "@/helpers/ColorHelper";
import { useAccount } from "@/hooks/Account";
import { useTeam } from "@/hooks/api/Team";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import React, {
    useState,
    useRef,
    useEffect,
    useMemo,
    KeyboardEvent,
} from "react";

type NavbarLink = {
    title: string;
    link: string;
    external?: boolean;
};

type NavbarCategory = {
    id: string;
    title: string;
    links: NavbarLink[];
};

const NAV_CATEGORIES: NavbarCategory[] = [
    {
        id: "watch",
        title: "Watch",
        links: [
            { title: "Home", link: "/" },
            { title: "Greater Games", link: "/gl-games" },
            { title: "Lesser Games", link: "/ll-games" },
        ],
    },
    {
        id: "leagues",
        title: "Leagues",
        links: [
            { title: "Greater League", link: "/greater-league" },
            { title: "Lesser League", link: "/lesser-league" },
            { title: "Custom League", link: "/custom-league" },
        ],
    },
    {
        id: "info",
        title: "Info",
        links: [
            { title: "Schedule", link: "/schedule" },
            { title: "What is EMMOLB?", link: "/what" },
            {
                title: "MMOLB Patreon",
                link: "https://www.patreon.com/MMOLB",
                external: true,
            },
            {
                title: "MMOLB Discord",
                link: "https://discord.gg/cr3tRG2xqq",
                external: true,
            },
            {
                title: "MMOLB Reddit",
                link: "https://reddit.com/r/MMOLB",
                external: true,
            },
            {
                title: "Buy us a Coffee",
                link: "https://ko-fi.com/echoviax",
                external: true,
            },
            {
                title: "Github Repo",
                link: "https://github.com/LunarianNova/emmolb",
                external: true,
            },
        ],
    },
];

function Logo() {
    return (
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-100">
            <div className="relative w-24 h-24 opacity-20">
                <Link href="/" className="pointer-events-auto">
                    <img
                        src="/logo.svg"
                        alt="EMMOLB Logo"
                        className="w-full h-full object-contain z-100"
                        draggable={false}
                    />
                    <div className="absolute inset-0 z-100 flex items-center justify-center">
                        <svg
                            viewBox="0 0 120 30"
                            className="w-full h-full opacity-80 select-none"
                        >
                            <text
                                x="50%"
                                y="50%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontFamily="sans-serif"
                                fontWeight="bold"
                                fontSize="26"
                                fill="var(--theme-text)"
                                stroke="var(--theme-accent)"
                                strokeWidth="8"
                                paintOrder="stroke"
                            >
                                EMMOLB
                            </text>
                        </svg>
                    </div>
                </Link>
            </div>
        </div>
    );
}

function TeamAvatar({ team }: { team: any }) {
    if (!team) return null;
    return (
        <Link href={`/team/${team.id}`}>
            <div
                className="size-8 rounded-full flex justify-center items-center text-center text-md text-shadow-lg/30 border-2"
                style={{
                    backgroundColor: `#${team.color}`,
                    borderColor: getContrastTextColor(team.color),
                }}
            >
                {team.emoji}
            </div>
        </Link>
    );
}

export function MobileNavbar({
    user,
    team,
    onLogout,
    onClearCache,
}: {
    user: any;
    team: any;
    onLogout: () => void;
    onClearCache: () => void;
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="sm:hidden relative z-10">
            <div className="flex justify-between items-center px-4 py-3">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-theme-text focus:outline-none"
                >
                    {isOpen ? (
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    ) : (
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    )}
                </button>
            </div>

            {isOpen && (
                <div className="px-6 pb-4 pt-2 space-y-2 text-left bg-theme-background">
                    {NAV_CATEGORIES.map((category) => (
                        <details key={category.id} className="group">
                            <summary className="cursor-pointer py-2 font-bold">
                                {category.title}
                            </summary>
                            <div className="ml-4 space-y-1">
                                {category.links.map((link) => (
                                    <Link
                                        key={link.link}
                                        href={link.link}
                                        target={
                                            link.external ? "_blank" : undefined
                                        }
                                        className="block py-1 hover:text-theme-accent"
                                    >
                                        {link.title}
                                    </Link>
                                ))}
                            </div>
                        </details>
                    ))}

                    <details className="group">
                        <summary className="cursor-pointer py-2 font-bold">
                            Account
                        </summary>
                        <div className="ml-4 space-y-1">
                            <Link href="/teams" className="block py-1">
                                Favorite Teams
                            </Link>
                            <Link href="/options" className="block py-1">
                                Options
                            </Link>
                            <Link
                                href={user ? "/account" : "/auth"}
                                className="block py-1"
                            >
                                {user ? "My Account" : "Log In/Sign Up"}
                            </Link>
                            {user && (
                                <button
                                    className="block py-1 text-left w-full"
                                    onClick={onLogout}
                                >
                                    Log Out
                                </button>
                            )}
                            <button
                                className="block py-1 text-left w-full"
                                onClick={onClearCache}
                            >
                                Clear Cache
                            </button>
                        </div>
                    </details>

                    {team && (
                        <div className="mt-4 pt-2 border-t border-theme-accent/20">
                            <TeamAvatar team={team} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export function DesktopNavbar({
    user,
    team,
    onLogout,
    onClearCache,
}: {
    user: any;
    team: any;
    onLogout: () => void;
    onClearCache: () => void;
}) {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const navRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleGlobalClick(event: MouseEvent) {
            if (
                navRef.current &&
                !navRef.current.contains(event.target as Node)
            ) {
                setOpenDropdown(null);
            }
        }
        function handleGlobalEsc(event: globalThis.KeyboardEvent) {
            if (event.key === "Escape") setOpenDropdown(null);
        }
        document.addEventListener("mousedown", handleGlobalClick);
        document.addEventListener("keydown", handleGlobalEsc);
        return () => {
            document.removeEventListener("mousedown", handleGlobalClick);
            document.removeEventListener("keydown", handleGlobalEsc);
        };
    }, []);

    const toggleDropdown = (id: string) => {
        setOpenDropdown(openDropdown === id ? null : id);
    };

    const handleDropdownKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const focusableElements = e.currentTarget.querySelectorAll(
            'a, button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
            focusableElements.length - 1
        ] as HTMLElement;
        const activeElement = document.activeElement as HTMLElement;
        const index = Array.from(focusableElements).indexOf(activeElement);

        if (e.key === "Escape") {
            setOpenDropdown(null);
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (index === -1 || index === focusableElements.length - 1) {
                firstElement?.focus();
            } else {
                (focusableElements[index + 1] as HTMLElement)?.focus();
            }
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (index === -1 || index === 0) {
                lastElement?.focus();
            } else {
                (focusableElements[index - 1] as HTMLElement)?.focus();
            }
        }
    };

    const dropdownLinkClass =
        "block w-full text-left px-3 py-2 rounded transition cursor-pointer hover:bg-theme-background/50 focus:outline-none focus:bg-theme-accent focus:text-theme-background focus:ring-2 focus:ring-theme-text/50";

    return (
        <div
            ref={navRef}
            className="hidden sm:flex sm:justify-center sm:items-center sm:gap-42 py-5 z-10"
        >
            {NAV_CATEGORIES.map((category) => (
                <div
                    key={category.id}
                    className="relative group"
                    onKeyDown={(e) =>
                        openDropdown === category.id && handleDropdownKeyDown(e)
                    }
                >
                    <button
                        onClick={() => toggleDropdown(category.id)}
                        className="text-lg font-bold tracking-wide cursor-pointer hover:text-theme-accent transition-colors rounded-md px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent focus-visible:bg-theme-primary/10"
                        aria-expanded={openDropdown === category.id}
                        aria-haspopup="true"
                    >
                        {category.title}
                    </button>

                    <div
                        className={`absolute top-12 left-1/2 -translate-x-1/2 w-48 bg-theme-primary border border-theme-accent rounded-xl p-2 shadow-xl transition-all duration-200 ease-out transform z-50 ${
                            openDropdown === category.id
                                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto visible"
                                : "opacity-0 scale-95 -translate-y-2 pointer-events-none invisible"
                        }`}
                        role="menu"
                    >
                        {category.links.map((link) => (
                            <Link
                                key={link.link}
                                href={link.link}
                                target={link.external ? "_blank" : undefined}
                                className={dropdownLinkClass}
                                role="menuitem"
                                tabIndex={openDropdown === category.id ? 0 : -1}
                                onClick={() => setOpenDropdown(null)}
                            >
                                {link.title}
                            </Link>
                        ))}
                    </div>
                </div>
            ))}

            <div className="flex gap-4 items-center">
                <div
                    className="relative"
                    onKeyDown={(e) =>
                        openDropdown === "account" && handleDropdownKeyDown(e)
                    }
                >
                    <button
                        onClick={() => toggleDropdown("account")}
                        className="text-lg font-bold tracking-wide cursor-pointer hover:text-theme-accent transition-colors rounded-md px-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-theme-accent focus-visible:bg-theme-primary/10"
                        aria-expanded={openDropdown === "account"}
                        aria-haspopup="true"
                    >
                        Account
                    </button>
                    <div
                        className={`absolute top-12 left-1/2 -translate-x-1/2 w-52 bg-theme-primary border border-theme-accent rounded-xl p-2 shadow-xl transition-all duration-200 ease-out transform z-50 ${
                            openDropdown === "account"
                                ? "opacity-100 scale-100 translate-y-0 pointer-events-auto visible"
                                : "opacity-0 scale-95 -translate-y-2 pointer-events-none invisible"
                        }`}
                        role="menu"
                    >
                        <Link
                            href="/teams"
                            className={dropdownLinkClass}
                            role="menuitem"
                            tabIndex={openDropdown === "account" ? 0 : -1}
                            onClick={() => setOpenDropdown(null)}
                        >
                            Favorite Teams
                        </Link>
                        <Link
                            href="/options"
                            className={dropdownLinkClass}
                            role="menuitem"
                            tabIndex={openDropdown === "account" ? 0 : -1}
                            onClick={() => setOpenDropdown(null)}
                        >
                            Options
                        </Link>
                        <Link
                            href={user ? "/account" : "/auth"}
                            className={dropdownLinkClass}
                            role="menuitem"
                            tabIndex={openDropdown === "account" ? 0 : -1}
                            onClick={() => setOpenDropdown(null)}
                        >
                            {user ? "My Account" : "Log In / Sign Up"}
                        </Link>
                        {user && (
                            <button
                                onClick={onLogout}
                                className={dropdownLinkClass}
                                role="menuitem"
                                tabIndex={openDropdown === "account" ? 0 : -1}
                            >
                                Log Out
                            </button>
                        )}
                        <button
                            onClick={onClearCache}
                            className={`block w-full text-left px-3 py-2 rounded transition cursor-pointer hover:bg-theme-background/50 focus:outline-none focus:bg-red-500 focus:text-white focus:ring-2 focus:ring-red-300 text-red-400`}
                            role="menuitem"
                            tabIndex={openDropdown === "account" ? 0 : -1}
                        >
                            Clear Cache
                        </button>
                    </div>
                </div>

                <TeamAvatar team={team} />
            </div>
        </div>
    );
}

export default function Navbar() {
    const { user } = useAccount();
    const queryClient = useQueryClient();

    const favoriteTeamIds = useMemo(
        () => JSON.parse(localStorage.getItem("favoriteTeamIDs") || "[]"),
        [],
    );

    const { data: team } = useTeam({
        teamId: favoriteTeamIds.length > 0 ? favoriteTeamIds[0] : undefined,
    });

    function clearCacheAndReset() {
        queryClient.clear();
        window.location.reload();
    }

    async function handleLogout() {
        await fetch("/nextapi/db/account/logout");
        window.location.reload();
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-theme-background text-theme-text font-sans shadow-md">
            <div className="relative overflow-visible transition-all duration-300">
                <Logo />

                <MobileNavbar
                    user={user}
                    team={team}
                    onLogout={handleLogout}
                    onClearCache={clearCacheAndReset}
                />

                <DesktopNavbar
                    user={user}
                    team={team}
                    onLogout={handleLogout}
                    onClearCache={clearCacheAndReset}
                />
            </div>
        </nav>
    );
}
