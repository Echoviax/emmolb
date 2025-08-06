import { Time } from "@/types/Time";

function getCurrentPhase(time: Time): string {
    const now = new Date();
    return now >= new Date(time.phaseTimes.postseasonPreview) ? "Postseason" : "Regular Season";
}

export function getGamesLeft(time: Time, playsOnOddDays: boolean): [low: number, high: number] {
    const totalGamesInSeason = 120;
    let day = time.seasonDay;
    if (day === 'Preseason') day = 0;
    else if (['Holiday', 'Election', 'Postseason Preview', 'Event', 'Special Event'].includes(String(day))) day = 240;
    else if (['Superstar Break', 'Home Run Challenge', 'Superstar Game'].includes(String(day))) day = 120;
    else day = Number(day);
    day = Number.isNaN(day) ? 240 : day;
    const gamesPlayed = playsOnOddDays ? Math.ceil(day/2) : Math.ceil((day-1)/2);
    return [totalGamesInSeason - gamesPlayed, totalGamesInSeason - gamesPlayed + 1];
}

type GamesRemainingProps = {
    time: Time;
    playsOnOddDays: boolean;
}

export default function GamesRemaining({ time, playsOnOddDays }: GamesRemainingProps) {
    const gamesLeft = getGamesLeft(time, playsOnOddDays);
    console.log(gamesLeft);
    const phase = getCurrentPhase(time);
    const isPostseason = phase === 'Postseason';
    const postSeasonGL = `Final Standings for Season ${time.seasonNumber}`

    let day = time.seasonDay;
    if (day === 'Preseason') day = 0;
    else if (['Holiday', 'Election', 'Postseason Preview', 'Event', 'Special Event'].includes(String(day))) day = 240;
    else if (['Superstar Break', 'Home Run Challenge', 'Superstar Game'].includes(String(day))) day = 120;
    else day = Number(day);
    day = Number.isNaN(day) ? 240 : day;
    const isCurrentGameDay = day % 2 === (playsOnOddDays ? 1 : 0);
    const pluralGamesLeft = gamesLeft[1] !== 1;
    const formattedGL = `${gamesLeft[0]}${isCurrentGameDay ? `-${gamesLeft[1]}` : ''} Game${pluralGamesLeft ? 's' : ''} Remain${pluralGamesLeft ? '' : 's'}`;

    return <div className="text-center mt-0 mb-4 text-lg font-bold">{isPostseason ? postSeasonGL : formattedGL}</div>
}