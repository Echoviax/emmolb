import LeaguePage from "@/components/leagues/LesserLeaguePage";

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Lesser League Standings',
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
    const {id} = await params;
    return <LeaguePage id={id} />;
}
