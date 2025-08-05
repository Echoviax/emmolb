import GreaterLeaguePage from "@/components/leagues/GreaterLeaguePage";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Greater League Standings',
};

export default async function LeagueServer() {
    return <GreaterLeaguePage />;
}
