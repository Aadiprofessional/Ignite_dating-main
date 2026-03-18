"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Flame, MessageCircle, Search, User, Users, Sparkles, Compass, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { BottomNav } from "./BottomNav";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { matches, currentUser } = useStore();

  const hideNavRoutes = ["/messages/"];
  const showNav = !hideNavRoutes.some((route) => pathname.includes(route) && pathname !== "/messages");
  const unreadMatches = matches.filter((match) => match.isNew).length;
  const navItems = [
    { href: "/home", icon: Flame, label: "Home" },
    { href: "/discover", icon: Search, label: "Discover" },
    { href: "/matches", icon: Users, label: "Matches", badge: unreadMatches },
    { href: "/messages", icon: MessageCircle, label: "Messages" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/home") return pathname === "/home";
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white lg:grid lg:grid-cols-[260px_minmax(0,1fr)_300px] lg:gap-6 lg:px-6 lg:py-6">
      <aside className="hidden lg:flex lg:flex-col lg:rounded-3xl lg:border lg:border-white/10 lg:bg-[#0E0E0E] lg:p-5 lg:shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
        <Link href="/home" className="mb-8 flex items-center gap-2 text-crimson">
          <Flame className="h-7 w-7 fill-crimson" />
          <span className="font-serif text-2xl font-bold tracking-wide text-white">IGNITE</span>
        </Link>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-3 py-3 transition-colors",
                  active ? "bg-crimson/15 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon className={cn("h-5 w-5", item.label === "Home" && active ? "fill-current" : "")} />
                  <span className="font-medium">{item.label}</span>
                </span>
                {item.badge && item.badge > 0 ? (
                  <span className="min-w-5 rounded-full bg-crimson px-1.5 py-0.5 text-center text-[11px] font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs font-mono uppercase tracking-[0.16em] text-zinc-500">Active Account</div>
          <div className="text-lg font-semibold text-white">{currentUser?.name ?? "Ignite User"}</div>
          <div className="text-sm text-zinc-400">
            {typeof currentUser?.location === "string"
              ? currentUser.location
              : currentUser?.location?.city ?? "Loves meaningful connections"}
          </div>
        </div>
      </aside>

      <div className="min-w-0 lg:rounded-3xl lg:border lg:border-white/10 lg:bg-[#0B0B0B] lg:shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="pb-24 lg:pb-0"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      <aside className="hidden lg:flex lg:flex-col lg:gap-4 lg:rounded-3xl lg:border lg:border-white/10 lg:bg-[#0E0E0E] lg:p-5 lg:shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
        <div className="rounded-2xl border border-crimson/20 bg-crimson/10 p-4">
          <div className="mb-2 flex items-center gap-2 text-crimson">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-mono uppercase tracking-[0.14em]">Desktop Swipe Tips</span>
          </div>
          <div className="space-y-2 text-sm text-zinc-200">
            <p>Drag cards left to pass, right to like, and up for super like.</p>
            <p>Use keyboard-friendly buttons under the card for quick actions.</p>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-zinc-200">
            <Compass className="h-4 w-4 text-crimson" />
            <span className="font-medium">Explore Faster</span>
          </div>
          <p className="text-sm text-zinc-400">Discover, Matches, and Messages stay one click away in the left rail.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-zinc-200">
            <ShieldCheck className="h-4 w-4 text-crimson" />
            <span className="font-medium">Safe by Design</span>
          </div>
          <p className="text-sm text-zinc-400">Profile controls and safety actions remain available on every screen size.</p>
        </div>
      </aside>

      {showNav && <BottomNav />}
    </div>
  );
}
