import { Time } from "@/types/Time";

function getCurrentPhase(time: Time): string {
    const now = new Date();
    return now >= new Date(time.phaseTimes.postseasonPreview) ? "Postseason" : "Regular Season";
}

export function getGamesLeft(time: Time, playsOnOddDays: boolean): number {
    const totalGamesInSeason = 120;
    const day = time.seasonDay;
    const gamesPlayed = playsOnOddDays ? Math.floor((day+1)/2) : Math.floor(day/2);
    return totalGamesInSeason - gamesPlayed;
}

type GamesRemainingProps = {
    time: Time;
    playsOnOddDays: boolean;
}

export default function GamesRemaining({ time, playsOnOddDays }: GamesRemainingProps) {
    const gamesLeft = getGamesLeft(time, playsOnOddDays);
    const phase = getCurrentPhase(time);
    const isPostseason = phase === 'Postseason';
    const postSeasonGL = `Final Standings for Season ${time.seasonNumber}`

    const isCurrentGameDay = time.seasonDay % 2 === (playsOnOddDays ? 1 : 0);
    const pluralGamesLeft = gamesLeft !== 1;
    const formattedGL = `${gamesLeft}${isCurrentGameDay ? `-${gamesLeft + 1}` : ''} Game${pluralGamesLeft ? 's' : ''} Remain${pluralGamesLeft ? '' : 's'}`;

    return <div className="text-center mt-0 mb-4 text-lg font-bold">{isPostseason ? postSeasonGL : formattedGL}</div>
}