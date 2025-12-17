'use client';
import { usePathname } from "next/navigation";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { QueryClient } from "@tanstack/react-query";
import { createIDBPersister } from "@/lib/persister";
import { SettingsProvider } from "@/components/Settings";
import { ThemeUpdater } from "@/components/ThemeUpdater";
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import Navbar from "@/components/Navbar";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
        },
    },
});

const persister = createIDBPersister();

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const hideNavbar = pathname.includes('live');

    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={{
            persister,
            buster: process.env.BUILD_ID,
            dehydrateOptions: {
                shouldDehydrateQuery: query => query.state.status === 'success' && query.queryKey[0] !== 'game-live' &&
                    (query.queryKey[0] !== 'gameheader' && query.state.dataUpdatedAt > Date.now() - 1000 * 60 * 60 * 24 ||
                    query.state.dataUpdatedAt > Date.now() - 1000 * 60 * 60)
            }}}
        >            
            <div className={`${GeistSans.className} ${GeistMono.variable}`}>
                <SettingsProvider>
                    <ThemeUpdater />
                    {!hideNavbar && <Navbar />}
                    {children}
                </SettingsProvider>
            </div>
        </PersistQueryClientProvider>
    );
}