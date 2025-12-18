'use client';
import LeagueScoreboard from "@/components/LeagueScoreboard";
import Navbar from "@/components/Navbar";
import { useSettings } from "@/components/Settings";

export default function WatchLayout({ children, }: Readonly<{children: React.ReactNode;}>) {
    const {settings} = useSettings();
    return <>
        <Navbar />
        {settings.gamePage?.showAwayScoreboard ? <div className='mt-24'>
            <LeagueScoreboard />
        </div> : null}
        {children}
    </>;
}