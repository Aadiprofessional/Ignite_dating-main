"use client";

import { Bell, Flame, SlidersHorizontal } from "lucide-react";

export function TopNavbar() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-zinc-900/50 bg-[#080808]/90 px-4 backdrop-blur-md lg:rounded-t-3xl lg:px-8">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between">
      {/* Left: Logo */}
        <div className="flex items-center gap-2 text-crimson">
          <Flame className="h-6 w-6 fill-crimson" />
          <span className="font-serif text-2xl font-bold tracking-wide text-white">IGNITE</span>
        </div>

      {/* Right: Icons */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-zinc-400 transition-colors hover:text-white">
            <Flame className="h-6 w-6" />
          </button>
          <button className="p-2 text-zinc-400 transition-colors hover:text-white">
            <SlidersHorizontal className="h-6 w-6" />
          </button>

          <button className="relative p-2 text-zinc-400 transition-colors hover:text-white">
            <Bell className="h-6 w-6" />
            <span className="absolute right-2 top-2 h-2 w-2 animate-pulse rounded-full bg-crimson" />
          </button>
        </div>
      </div>
    </header>
  );
}
