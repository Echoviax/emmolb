'use client';
import { usePathname } from "next/navigation";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { QueryClient } from "@tanstack/react-query";
import { createIDBPersister } from "@/lib/persister";
import { SettingsProvider } from "@/components/Settings";
import { ThemeUpdater } from "@/components/ThemeUpdater";
import { Navbar } from "@/components/Navbar";

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
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
            <SettingsProvider>
                <ThemeUpdater />
                {!hideNavbar && <Navbar />}
                {children}
            </SettingsProvider>
        </PersistQueryClientProvider>
    );
}