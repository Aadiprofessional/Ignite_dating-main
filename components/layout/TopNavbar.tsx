"use client";

import { Bell, Flame, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useStore } from "@/lib/store";

export function TopNavbar() {
  const { notifications } = useStore();
  const unreadNotifications = notifications.filter((notification) => !notification.isRead).length;

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-zinc-900/50 bg-[#080808]/90 px-4 backdrop-blur-md lg:rounded-t-3xl lg:px-8">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2 text-crimson">
          <Flame className="h-6 w-6 fill-crimson" />
          <span className="font-serif text-2xl font-bold tracking-wide text-white">IGNITE</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/discover" className="relative p-2 text-zinc-400 transition-colors hover:text-white">
            <Flame className="h-6 w-6" />
          </Link>
          <Link href="/discover" className="p-2 text-zinc-400 transition-colors hover:text-white">
            <SlidersHorizontal className="h-6 w-6" />
          </Link>

          <Link href="/notifications" className="relative p-2 text-zinc-400 transition-colors hover:text-white">
            <Bell className="h-6 w-6" />
            {unreadNotifications > 0 ? <span className="absolute right-2 top-2 h-2 w-2 animate-pulse rounded-full bg-crimson" /> : null}
          </Link>
        </div>
      </div>
    </header>
  );
}
