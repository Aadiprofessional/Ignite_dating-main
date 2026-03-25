"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Flame, MessageCircle, Search, User, Users, Sparkles, Compass, ShieldCheck, CalendarRange, LogOut, Coins, Crown, Bell } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { connectChatSocket, disconnectChatSocket } from "@/lib/chatSocket";
import { BottomNav } from "./BottomNav";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { matches, notifications, currentUser, session, hydrateFromApi, refreshOnboardingStatus, accountState, onboardingStatus, logout, refreshWallet, wallet } =
    useStore();
  const [isHydrated, setIsHydrated] = useState(useStore.persist?.hasHydrated?.() ?? true);

  useEffect(() => {
    if (!useStore.persist) {
      setIsHydrated(true);
      return;
    }
    const unsubscribeHydrate = useStore.persist.onHydrate(() => setIsHydrated(false));
    const unsubscribeFinishHydration = useStore.persist.onFinishHydration(() => setIsHydrated(true));
    setIsHydrated(useStore.persist.hasHydrated());
    return () => {
      unsubscribeHydrate();
      unsubscribeFinishHydration();
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!session?.accessToken) {
      router.replace("/login");
    }
  }, [isHydrated, session?.accessToken, router]);

  useEffect(() => {
    if (!isHydrated || !session?.accessToken) return;
    const run = async () => {
      await hydrateFromApi();
      await refreshOnboardingStatus();
      await refreshWallet();
    };
    void run();
  }, [isHydrated, session?.accessToken, hydrateFromApi, refreshOnboardingStatus, refreshWallet]);

  useEffect(() => {
    if (!isHydrated) return;
    const token = session?.accessToken;
    if (!token) {
      disconnectChatSocket();
      return;
    }
    const socket = connectChatSocket(token);
    if (!socket.connected) {
      socket.connect();
    }
    return () => {
      disconnectChatSocket();
    };
  }, [isHydrated, session?.accessToken]);

  useEffect(() => {
    if (!isHydrated || !session?.accessToken) return;
    const accessStatus =
      accountState?.access_status ||
      (accountState?.can_use_app || onboardingStatus?.verification?.status === "approved"
        ? "approved"
        : onboardingStatus?.verification?.status === "rejected"
          ? "rejected"
          : onboardingStatus?.verification?.status === "pending_admin_approval" ||
              onboardingStatus?.verification?.status === "pending"
            ? "pending_admin_approval"
            : "pending_submission");
    if (accessStatus === "approved") return;
    if (accessStatus === "pending_admin_approval") {
      router.replace("/setup/review");
      return;
    }
    if (pathname !== "/setup") {
      router.replace("/setup");
    }
  }, [
    isHydrated,
    session?.accessToken,
    accountState?.access_status,
    accountState?.can_use_app,
    onboardingStatus?.verification?.status,
    pathname,
    router,
  ]);

  const hideNavRoutes = ["/messages/"];
  const showNav = !hideNavRoutes.some((route) => pathname.includes(route) && pathname !== "/messages");
  const showRightPanel = !pathname.startsWith("/events");
  const unreadMatches = matches.filter((match) => match.isNew).length;
  const unreadNotifications = notifications.filter((notification) => !notification.isRead).length;
  const navItems = [
    { href: "/home", icon: Flame, label: "Home" },
    { href: "/discover", icon: Search, label: "Discover" },
    { href: "/events", icon: CalendarRange, label: "Events" },
    { href: "/matches", icon: Users, label: "Matches", badge: unreadMatches },
    { href: "/notifications", icon: Bell, label: "Notifications", badge: unreadNotifications },
    { href: "/messages", icon: MessageCircle, label: "Messages" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/home") return pathname === "/home";
    return pathname.startsWith(path);
  };
  const hasActiveSubscription = wallet?.active_subscription?.status === "active";

  if (!isHydrated || !session?.accessToken) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-[#080808] text-white lg:grid lg:h-screen lg:gap-6 lg:overflow-hidden lg:px-6 lg:py-6",
        showRightPanel ? "lg:grid-cols-[260px_minmax(0,1fr)_300px]" : "lg:grid-cols-[260px_minmax(0,1fr)]"
      )}
    >
      <aside className="hidden lg:flex lg:h-full lg:flex-col lg:rounded-3xl lg:border lg:border-white/10 lg:bg-[#0E0E0E] lg:p-5 lg:shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
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

        <div className="mt-auto space-y-3">
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs font-mono uppercase tracking-[0.16em] text-zinc-500">Active Account</div>
            <div className="flex items-center justify-between gap-2">
              <div className="text-lg font-semibold text-white">{currentUser?.name ?? "Ignite User"}</div>
              {hasActiveSubscription ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-300">
                  <Crown className="h-3 w-3" />
                  Pro
                </span>
              ) : null}
            </div>
            <div className="text-sm text-zinc-400">
              {typeof currentUser?.location === "string"
                ? currentUser.location
                : currentUser?.location?.city ?? "Loves meaningful connections"}
            </div>
            {!hasActiveSubscription ? (
              <Link
                href="/wallet/buy"
                className="flex w-full items-center justify-center rounded-xl bg-crimson px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-600"
              >
                Buy Subscription
              </Link>
            ) : null}
          </div>
          {hasActiveSubscription ? (
            <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-zinc-200">
                <Coins className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-mono uppercase tracking-[0.14em] text-zinc-400">Coins</span>
              </div>
              <div className="text-2xl font-bold text-white">{wallet?.coins ?? 0}</div>
              <div className="flex gap-2">
                <Link
                  href="/wallet/transactions"
                  className="flex-1 rounded-xl border border-white/10 px-3 py-2 text-center text-xs font-medium text-zinc-200 transition-colors hover:bg-white/10"
                >
                  Transactions
                </Link>
                <Link
                  href="/wallet/buy"
                  className="flex-1 rounded-xl border border-crimson/30 px-3 py-2 text-center text-xs font-medium text-crimson transition-colors hover:bg-crimson/10"
                >
                  Buy
                </Link>
              </div>
              {(wallet?.coins ?? 0) < 30 ? (
                <Link
                  href="/wallet/buy?type=addon"
                  className="flex w-full items-center justify-center rounded-xl bg-amber-500 px-3 py-2 text-xs font-semibold text-black transition-colors hover:bg-amber-400"
                >
                  Buy Addon
                </Link>
              ) : null}
            </div>
          ) : null}
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="min-w-0 lg:h-full lg:overflow-y-auto lg:rounded-3xl lg:border lg:border-white/10 lg:bg-[#0B0B0B] lg:shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
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

      {showRightPanel ? (
        <aside className="hidden lg:flex lg:h-full lg:flex-col lg:gap-4 lg:rounded-3xl lg:border lg:border-white/10 lg:bg-[#0E0E0E] lg:p-5 lg:shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
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
      ) : null}

      {showNav && <BottomNav />}
    </div>
  );
}
