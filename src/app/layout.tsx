import type { Metadata } from "next";
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import "./globals.css";
import ClientLayout from "./clientLayout";

export const metadata: Metadata = {
    title: {
        template: '%s - EMMOLB',
        default: 'EMMOLB',
    },
    description: 'EMMOLB is a third-party open-source viewing client for MMOLB',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en" className="min-h-screen">
            <body>
                <ClientLayout>
                    {children}
                </ClientLayout>
            </body>
        </html>
    );
}