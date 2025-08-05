import TeamSelector from "@/components/TeamSelector";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Favorite Teams',
};
export default function FavoriteTeamsPage() {
    return (
        <main className="mt-16">
                <TeamSelector />
        </main>
    );
}
