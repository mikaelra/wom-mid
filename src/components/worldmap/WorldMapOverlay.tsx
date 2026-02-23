'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function WorldMapOverlay() {
  const [loggedInName, setLoggedInName] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setLoggedInName(localStorage.getItem('playerName') || '');
    }
  }, []);

  if (!mounted) return null;

  const isLoggedIn = !!loggedInName;

  return (
    <>
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 pointer-events-none">
        {/* Left: player info */}
        <div className="pointer-events-auto flex items-center gap-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-sm font-bold text-black">
                {loggedInName[0]?.toUpperCase()}
              </div>
              <span className="text-white font-semibold text-sm">{loggedInName}</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/login"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 py-2 rounded-lg text-sm font-semibold no-underline hover:bg-white/20 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 py-2 rounded-lg text-sm font-semibold no-underline hover:bg-white/20 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Right: nav links */}
        <div className="pointer-events-auto flex items-center gap-2">
          <Link
            href="/leaderboards"
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 py-2 rounded-lg text-sm font-semibold no-underline hover:bg-white/20 transition-colors"
          >
            Leaderboards
          </Link>
          <Link
            href="/rules"
            className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-3 py-2 rounded-lg text-sm font-semibold no-underline hover:bg-white/20 transition-colors"
          >
            Rules
          </Link>
        </div>
      </div>

      {/* Center title */}
      <div className="absolute top-16 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <h1 className="text-white/80 text-lg font-light tracking-[0.3em] uppercase drop-shadow-lg">
          World of Mythos
        </h1>
      </div>

      {/* Bottom hint */}
      <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <p className="text-white/50 text-sm animate-pulse">
          Click a city to enter
        </p>
      </div>
    </>
  );
}
