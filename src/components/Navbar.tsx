'use client'

import { getContrastTextColor } from '@/helpers/ColorHelper'
import { useAccount } from '@/hooks/Account'
import { useTeam } from '@/hooks/api/Team'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import React, { useState, useRef, useEffect, useMemo } from 'react'

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const { user } = useAccount();

    const queryClient = useQueryClient();

  const favoriteTeamIds = useMemo(() => JSON.parse(localStorage.getItem('favoriteTeamIDs') || '[]'), []);
  const { data: team } = useTeam({
    teamId: favoriteTeamIds.length > 0 ? favoriteTeamIds[0]: undefined
  });

    function clearCacheAndReset() {
        queryClient.clear();
        window.location.reload();
    }

  // Close dropdowns on outside click
  const navRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Dropdown toggle handler
  function toggleDropdown(name: string) {
    setOpenDropdown(openDropdown === name ? null : name)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-theme-background text-theme-text font-sans">
      <div ref={navRef} className={`relative overflow-visible transition-all duration-300`}>
        {/* Background logo */}
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-100">
          <div className="relative w-24 h-24 opacity-20">
            <Link href='/' className='pointer-events-auto'>
              <img
                src="/logo.svg"
                alt="Star Emoji"
                className="w-full h-full object-contain z-100"
                draggable={false}
              />
              <div className="absolute inset-0 z-100 flex items-center justify-center">
                <svg
                  viewBox="0 0 120 30"
                  className="w-full h-full opacity-80 select-none"
                  aria-hidden="true"
                >
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                    fontSize="26"
                    fill="var(--theme-text)"
                    stroke="var(--theme-accent)"
                    strokeWidth="8"
                    paintOrder="stroke"
                  >
                    EMMOLB
                  </text>
                </svg>
              </div>
            </Link>
          </div>
        </div>

        {/* Mobile top bar */}
        <div className="flex justify-between items-center px-4 py-3 sm:hidden relative z-10">
          <button
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-theme-text focus:outline-none"
          >
            {mobileMenuOpen ? (
              // Close icon
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              // Hamburger icon
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden px-6 pb-4 pt-2 space-y-2 text-left z-10">
            <details className='group'>
              <summary className='cursor-pointer py-2'>
                Watch
              </summary>
              <div className='ml-4 space-y-1'>
                <Link href='/' className='block'>Home</Link>
                <Link href='/gl-games' className='block'>GL Games</Link>
                <Link href='/ll-games' className='block'>LL Games</Link>
              </div>
            </details>
            
            <details className='group'>
              <summary className='cursor-pointer py-2'>
                Leagues
              </summary>
              <div className='ml-4 space-y-1'>
                <Link href='/greater-league' className='block'>Greater League</Link>
                <Link href='/lesser-league' className='block'>Lesser League</Link>
                <Link href='/custom-league' className='block'>Custom League</Link>
              </div>
            </details>

            <details className='group'>
              <summary className='cursor-pointer py-2'>
                Info
              </summary>
              <div className='ml-4 space-y-1'>
                <Link href='/schedule' className='block'>Schedule</Link>
                <Link href='/what' className='block'>What is EMMOLB?</Link>
                <Link href='https://www.patreon.com/MMOLB' className='block'>MMOLB Patreon</Link>
                <Link href='https://discord.gg/cr3tRG2xqq' className='block'>MMOLB Discord</Link>
                <Link href='https://reddit.com/r/MMOLB' className='block'>MMOLB Reddit</Link>
                <Link href='https://ko-fi.com/echoviax' className='block'>Buy us a Coffee</Link>
                <Link href='https://github.com/LunarianNova/emmolb' className='block'>Github Repo</Link>
              </div>
            </details>

            <details className='group'>
              <summary className='cursor-pointer py-2'>
                Account
              </summary>
              <div className='ml-4 space-y-1'>
                <Link href='/teams' className='block'>Favorite Teams</Link>
                <Link href='/options' className='block'>Options</Link>
                <Link href={user ? '/account' : '/auth'} className='block'>{user ? 'My Account' : 'Log In/Sign Up'}</Link>
                {user ?
                <button className="block" onClick={async () => {await fetch('/nextapi/db/account/logout'); window.location.reload();}}>
                  Log Out
                </button>
                : null}
                <button className="block" onClick={clearCacheAndReset}>
                  Clear Cache
                </button>
              </div>
            </details>

            {team && 
              <Link href={`/team/${team.id}`}>
                <div className='size-8 rounded-full flex justify-center items-center text-center text-md text-shadow-lg/30 border-2' style={{backgroundColor: `#${team.color}`, borderColor: getContrastTextColor(team.color)}}>
                  {team.emoji}
                </div>
              </Link>
            }
          </div>
        )}

        {/* Desktop / large screen menu */}
        <div
          className={`sm:flex sm:justify-center sm:items-center sm:gap-42 py-5 z-10 hidden`}
        >
          {/* Home */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('home')}
              className="text-lg font-bold tracking-wide cursor-pointer"
              aria-expanded={openDropdown === 'home'}
              aria-haspopup="true"
            >
              Watch
            </button>
            <div
              className={`absolute top-12 left-1/2 -translate-x-1/2 w-44 bg-theme-primary border border-theme-accent rounded-xl p-2 shadow-xl transition-all duration-200 ease-out transform z-50
                ${
                  openDropdown === 'home'
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
            >
              <Link href='/' className="block w-full text-left px-3 py-2 rounded link-hover transition cursor-pointer">
                Home
              </Link>
              <Link href='/gl-games' className="block w-full text-left px-3 py-2 rounded link-hover transition cursor-pointer">
                GL Games
              </Link>
              <Link href='/ll-games' className="block w-full text-left px-3 py-2 rounded link-hover transition cursor-pointer">
                LL Games
              </Link>
            </div>
          </div>

          {/* Leagues dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('leagues')}
              className="text-lg font-bold tracking-wide cursor-pointer"
              aria-expanded={openDropdown === 'leagues'}
              aria-haspopup="true"
            >
              Leagues
            </button>
            <div
              className={`absolute top-12 left-1/2 -translate-x-1/2 w-44 bg-theme-primary border border-theme-accent rounded-xl p-2 shadow-xl transition-all duration-200 ease-out transform z-50
                ${
                  openDropdown === 'leagues'
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
            >
              <Link href='/greater-league' className="block w-full text-left px-3 py-2 rounded link-hover transition cursor-pointer">
                Greater League
              </Link>
              <Link href='/lesser-league' className="block w-full text-left px-3 py-2 rounded link-hover transition cursor-pointer">
                Lesser League
              </Link>
              <Link href='/custom-league' className="block w-full text-left px-3 py-2 rounded link-hover transition cursor-pointer">
                Custom League
              </Link>
            </div>
          </div>

          {/* Info dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('info')}
              className="text-lg font-bold tracking-wide cursor-pointer"
              aria-expanded={openDropdown === 'info'}
              aria-haspopup="true"
            >
              Info
            </button>
            <div
              className={`absolute top-12 left-1/2 -translate-x-1/2 w-48 bg-theme-primary border border-theme-accent rounded-xl p-2 shadow-xl transition-all duration-200 ease-out transform z-50
                ${
                  openDropdown === 'info'
                    ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
            >
              <Link
                href="/schedule"
                className="block w-full text-left px-3 py-2 rounded link-hover transition cursor-pointer"
              >
                Schedule
              </Link>
              <Link
                href="/what"
                className="block w-full text-left px-3 py-2 rounded link-hover transition cursor-pointer"
              >
                What is EMMOLB?
              </Link>
              <Link
                href="https://ko-fi.com/echoviax"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left px-3 py-2 rounded link-hover transition cursor-pointer"
              >
                Buy us a Coffee
              </Link>
              <Link
                href="https://www.patreon.com/MMOLB"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left px-3 py-2 rounded link-hover transition cursor-pointer"
              >
                MMOLB Patreon
              </Link>
              <Link
                href="https://discord.gg/cr3tRG2xqq"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left px-3 py-2 rounded link-hover transition cursor-pointer"
              >
                MMOLB Discord
              </Link>
              <Link
                href="https://reddit.com/r/MMOLB"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left px-3 py-2 rounded link-hover transition cursor-pointer"
              >
                MMOLB Reddit
              </Link>
              <Link
                href="https://github.com/LunarianNova/emmolb"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-left px-3 py-2 rounded link-hover transition cursor-pointer"
              >
                Github Repo
              </Link>
            </div>
          </div>

          {/* Account dropdown */}
          <div className='flex gap-2 items-center'>
            <div className="relative">
              <button
                onClick={() => toggleDropdown('account')}
                className="text-lg font-bold tracking-wide cursor-pointer"
                aria-expanded={openDropdown === 'account'}
                aria-haspopup="true"
              >
                Account
              </button>
              <div
                className={`absolute top-12 left-1/2 -translate-x-1/2 w-52 bg-theme-primary border border-theme-accent rounded-xl p-2 shadow-xl transition-all duration-200 ease-out transform z-50
                  ${
                    openDropdown === 'account'
                      ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }`}
              >
                <Link href="/teams">
                  <button className="block w-full text-left px-3 py-2 rounded link-hover transition cursor-pointer">
                    Favorite Teams
                  </button>
                </Link>
                <Link href="/options">
                  <button className="block w-full text-left px-3 py-2 rounded link-hover transition cursor-pointer">
                    Options
                  </button>
                </Link>
                <Link href={user ? "/account" : '/auth'}>
                  <button className="block w-full text-left px-3 py-2 rounded link-hover transition cursor-pointer">
                    {user ? 'Account' : 'Log in/Sign up'}
                  </button>
                </Link>
                {user ?
                  <button className="block w-full text-left px-3 py-2 rounded link-hover transition cursor-pointer" onClick={() => {fetch('/nextapi/db/account/logout'); window.location.reload();}}>
                    Log Out
                  </button>
                  : null}
                <button className="block w-full text-left px-3 py-2 rounded link-hover transition cursor-pointer" onClick={clearCacheAndReset}>
                    Clear Cache
                  </button>
              </div>
            </div>
            {team && 
              <Link href={`/team/${team.id}`}>
                <div className='size-8 rounded-full flex justify-center items-center text-center text-md text-shadow-lg/30 border-2' style={{backgroundColor: `#${team.color}`, borderColor: getContrastTextColor(team.color)}}>
                  {team.emoji}
                </div>
              </Link>
            }
          </div>
        </div>
      </div>
    </nav>
  )
}
