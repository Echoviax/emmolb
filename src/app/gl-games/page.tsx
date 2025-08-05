import GLGamesPage from "@/components/GLGamesPage";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Greater League Games',
};

export default async function GLGamesServerPage() {
    const timeRes = await fetch(`http://lunanova.space/nextapi/time`, {
        next: { revalidate: 0 },
    });
    const time = await timeRes.json();
    const day = time.season_day % 2 == 1 ? time.season_day : Number(time.season_day) - 1;
    const season = time.season_number;

    return (<GLGamesPage season={Number(season)} initialDay={Number(day)} />);
}