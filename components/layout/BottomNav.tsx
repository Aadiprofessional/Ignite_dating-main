"use client";

import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Flame, MessageCircle, Search, User, Users, CalendarRange } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function BottomNav() {
  const pathname = usePathname();
  const { matches } = useStore();

  const unreadMatches = matches.filter((m) => m.isNew).length;
  // This is a simplification; in a real app, we'd check message read status more thoroughly
  const unreadMessages = 0; 

  const navItems = [
    { href: "/home", icon: Flame, label: "Home" },
    { href: "/discover", icon: Search, label: "Discover" },
    { href: "/events", icon: CalendarRange, label: "Events" },
    { href: "/matches", icon: Users, label: "Matches", badge: unreadMatches },
    { href: "/messages", icon: MessageCircle, label: "Messages", badge: unreadMessages }, // Assuming messages page is a list of chats
    { href: "/profile", icon: User, label: "Profile" },
  ];

  // Helper to check active state (including sub-routes)
  const isActive = (path: string) => {
    if (path === "/home" && pathname === "/home") return true;
    if (path !== "/home" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#080808]/90 backdrop-blur-lg border-t border-zinc-900 pb-safe pt-2 px-2 lg:hidden">
      <div className="mx-auto flex h-16 max-w-xl items-center justify-around">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="relative flex flex-col items-center justify-center w-full h-full">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "relative p-2 rounded-xl transition-colors duration-300",
                  active ? "text-crimson" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Icon size={26} strokeWidth={active ? 2.5 : 2} fill={active && item.label === "Home" ? "currentColor" : "none"} />
                
                {item.badge && item.badge > 0 && (
                  <div className="absolute top-1 right-1 min-w-[16px] h-4 bg-crimson text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#080808]">
                    {item.badge}
                  </div>
                )}
              </motion.div>
              
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 w-1 h-1 bg-crimson rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
