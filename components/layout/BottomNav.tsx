"use client";

import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Flame, MessageCircle, Search, User, Users, CalendarRange, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();
  const { matches, notifications } = useStore();

  const unreadMatches = matches.filter((m) => m.isNew).length;
  const unreadMessages = 0;
  const unreadNotifications = notifications.filter((notification) => !notification.isRead).length;

  const navItems = [
    { href: "/home", icon: Flame, label: "Home" },
    { href: "/discover", icon: Search, label: "Discover" },
    { href: "/events", icon: CalendarRange, label: "Events" },
    { href: "/matches", icon: Users, label: "Matches", badge: unreadMatches },
    { href: "/notifications", icon: Bell, label: "Notifications", badge: unreadNotifications },
    { href: "/messages", icon: MessageCircle, label: "Messages", badge: unreadMessages },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/home" && pathname === "/home") return true;
    if (path !== "/home" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-safe pb-3 lg:hidden">
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-[#0A0A0A]/85 px-1.5 py-1.5 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.9)] backdrop-blur-2xl">
        <div className="grid h-14 grid-cols-7 items-center">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="relative flex h-full items-center justify-center">
              <motion.div
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-300",
                  active
                    ? "bg-crimson/15 text-crimson shadow-[inset_0_0_0_1px_rgba(232,25,44,0.3)]"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Icon size={21} strokeWidth={active ? 2.4 : 2} fill={active && item.label === "Home" ? "currentColor" : "none"} />

                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-md bg-zinc-800/95 px-1 text-[9px] font-semibold leading-3 text-zinc-200">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </motion.div>

              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-[3px] h-1.5 w-8 rounded-full bg-crimson"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
        </div>
      </div>
    </nav>
  );
}
