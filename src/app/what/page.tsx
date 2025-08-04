import Link from "next/link";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'What is EMMOLB?',
};

export default function WhatPage() {
    return (<>
        <main className='mt-16'>
            <div className="min-h-screen bg-theme-background text-theme-text font-sans p-4 pt-20 max-w-3xl mx-auto">
                <div className="bg-theme-primary rounded-xl shadow-lg p-6 text-center text-2xl font-semibold mb-6">What is EMMOLB?</div>
                <div className="bg-theme-primary rounded-xl shadow-lg p-6 text-lg text-theme-primary opacity-70 leading-relaxed">
                    <p className="mb-4">
                        EMMOLB is a third-party viewing client for the website <Link href='https://mmolb.com' className="text-theme-secondary font-bold">MMOLB</Link>.<br></br>
                        If you don't know what MMOLB is and found your way here? That's pretty impressive actually. I don't think any of us would expect this page to get popular enough for that.
                    </p>
                    <p className="mb-4">
                        With that being said, if you don't know what <Link href='https://mmolb.com' className="text-theme-secondary font-bold">MMOLB</Link> is, we would highly recommend 
                        using the official site to create a team, and then maybe come back here once you have a grasp on <Link href='https://mmolb.com' className="text-theme-secondary font-bold">MMOLB</Link> basics.
                    </p>
                    <p className="mb-4">
                        This site was made as there were a few changes we wanted to see on the main site, but obviously we can't just change things, so we made a new site that uses the official API to pull data live. 
                        This way we can make whatever visual changes we want to make to the site, all while preserving the original and official data.
                    </p>
                    <p className="mb-4">
                        If you really enjoy using this app, consider donating to us through our <Link href='https://ko-fi.com/echoviax' className="text-theme-secondary font-bold">Ko-fi</Link>. It's of course not required, but is greatly appreciated 
                        and keeps us motivated to keep updating.
                    </p>
                    <p className="mb-4">
                        With all that said, thanks for using this site, and happy balling.<br></br>
                        - the Echo Cluster
                    </p>
                </div>
            </div>
        </main>
    </>);
}