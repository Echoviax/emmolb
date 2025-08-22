'use client';
import React, { useEffect, useState } from 'react';

const messages = [
    'Did you know? Now you know!',
    'Lost in the stars...',
    "We aren't good at coming up with these",
    'Join the official MMOLB Discord!',
    'This app was not approved for use by anyone',
    "Any bugs are actually the end user's fault",
    'Fun fact: {error in line 4: "facts" not found}!',
    'May contain nuts',
    "The E stands for 'Echo'",
    "The E stands for 'Enhanced'",
    "The E stands for 'Egyptian'",
    "The E stands for 'Ecological'",
    "The E stands for 'Emo'",
    "Consider supporting us on Ko-fi!",
    "So many options!",
    "Report bugs in the MMOLB Discord",
    "We put the E in baseball",
    "The E was almost an X",
    "Shoutouts to Danny for MMOLB",
    "This is actually the first thing I've programmed",
    "This is much cooler than hosting a personal site",
    "Updates Daily! (Except when they aren't)",
    "6808fdde3b8130e9cda46c23",
    "It took the Universe 13.4B years to make this",
    "Neutronium is so dense it would pass through the Earth",
    "This website might look good on a portfolio",
    "Powered by Hopes, Dreams, and Duct Tape",
    "You can tell we don't major in web design",
    "If you encounter a bug, try refreshing!",
    "If you encounter a bug, try swatting it!",
    "_(:3」∠)_",
    "I'm tired",
    "Untangling stat spaghetti",
    "If you're seeing this, it's because I wrote it",
    "Today is... oh wait, we can't put live code here",
    "Pineapple is the best pizza topping",
    "Pineapple is also one of the best fruits",
    "dGhpcyBpcyBiYXNlNjQ="
];

export function LoadingMini() {
    return (
        <div className="flex flex-col items-center justify-center size-full text-theme-text select-none">
            <div className="animate-spin text-4xl">⚾</div>
        </div>
    )
}

export default function Loading() {
    const [index, setIndex] = useState<number>(Math.floor(Math.random() * messages.length))

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex(Math.floor(Math.random() * messages.length))
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    const message = index !== null ? messages[index] : 'Loading...'

    return (
        <div className="flex flex-col items-center justify-center h-[80vh] text-theme-text select-none">
            <div className="animate-spin text-4xl">⚾</div>
            <div className="mt-4 text-sm opacity-70">{message}</div>
        </div>
    )
}
