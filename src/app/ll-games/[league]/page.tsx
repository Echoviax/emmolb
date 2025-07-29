import LLGamesPage from "@/components/LLGamesPage";

interface PageProps {
    params: Promise<{ league: string }>;
}

export default async function GLGamesServerPage({params}: PageProps) {
    const { league } = await params;
    const timeRes = await fetch(`http://lunanova.space/nextapi/time`, {
        next: { revalidate: 0 },
    });
    const time = await timeRes.json();
    const day = time.season_day % 2 == 0 ? time.season_day : Number(time.season_day) - 1;
    const season = time.season_number;

    return (<LLGamesPage season={Number(season)} initialDay={Number(day)} league={league} />);
}