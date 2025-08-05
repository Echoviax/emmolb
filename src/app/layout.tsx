'use client'
import type { Metadata } from "next";
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { SettingsProvider } from "@/components/Settings";
import { ThemeUpdater } from "@/components/ThemeUpdater";
import { Navbar } from "@/components/Navbar";
import { usePathname } from "next/navigation";
import { QueryClient } from "@tanstack/react-query";
import { createIDBPersister } from "@/lib/persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
        },
        dehydrate: {
            shouldDehydrateQuery: query => query.queryKey[0] !== 'game-live'
        },
    },
})

const persister = createIDBPersister()

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
    const pathname = usePathname();
    const hideNavbar = pathname.includes('live');

    return (
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }} >
            <html lang="en">
                <body className={`${GeistSans.className} ${GeistMono.variable} min-h-screen`}>
                    {!hideNavbar && <Navbar />}
                    <SettingsProvider>
                        <ThemeUpdater />
                        {children}
                    </SettingsProvider>
                    <Analytics />
                </body>
            </html>
        </PersistQueryClientProvider>
    );
}
