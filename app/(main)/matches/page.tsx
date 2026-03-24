"use client";

import { ConversationsList } from "@/components/matches/ConversationsList";
import { NewMatchesRow } from "@/components/matches/NewMatchesRow";
import { useStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Check, Flame, Heart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MatchesPage() {
  const { matches, incomingLikes, refreshMatches, refreshIncomingLikes, respondIncomingLike } = useStore();
  const [loadingSwipeId, setLoadingSwipeId] = useState<string | null>(null);
  const hasMatches = matches.length > 0;
  const hasMatchRequests = incomingLikes.length > 0;

  useEffect(() => {
    void Promise.allSettled([refreshMatches(), refreshIncomingLikes({ limit: 20, offset: 0 })]);
  }, [refreshMatches, refreshIncomingLikes]);

  const handleRespond = async (swiperId: string, decision: "accept" | "reject") => {
    setLoadingSwipeId(swiperId);
    try {
      await respondIncomingLike(swiperId, decision);
    } finally {
      setLoadingSwipeId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] pb-24 lg:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#080808]/80 px-4 pb-4 pt-6 backdrop-blur-md lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="font-serif text-3xl font-bold text-white">
            Your Matches <span className="text-crimson">🔥</span>
          </h1>
        </div>
      </header>

      {hasMatchRequests && (
        <section className="mx-auto w-full max-w-6xl px-4 pt-6 lg:px-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">
              Match Requests
            </h2>
            <span className="text-xs text-white/50">{incomingLikes.length} pending</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {incomingLikes.map((user, i) => (
              <motion.div
                key={user.swipeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <div className="relative h-40">
                  <Image
                    src={user.photos[0]}
                    alt={user.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-xl font-bold text-white">{user.name}</h3>
                      <span className="text-xs text-white/80">{Math.round(user.distanceKm)} km</span>
                    </div>
                    <p className="line-clamp-1 text-xs text-white/70">
                      {user.universityName || `${user.city}${user.city && user.country ? ", " : ""}${user.country}`}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-3">
                  <button
                    onClick={() => void handleRespond(user.swiperId, "reject")}
                    disabled={loadingSwipeId === user.swiperId}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/15 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => void handleRespond(user.swiperId, "accept")}
                    disabled={loadingSwipeId === user.swiperId}
                    className="flex items-center justify-center gap-2 rounded-xl bg-crimson py-2 text-sm font-semibold text-white transition-colors hover:bg-crimson/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {hasMatches ? (
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 pt-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8">
          {/* New Matches */}
          <section className="lg:sticky lg:top-24 lg:h-fit">
            <h2 className="mb-2 px-4 font-mono text-xs font-bold uppercase tracking-wider text-zinc-500 lg:px-0">
              New Matches
            </h2>
            <NewMatchesRow matches={matches} />
          </section>

          {/* Conversations */}
          <section>
            <h2 className="mb-2 px-4 font-mono text-xs font-bold uppercase tracking-wider text-zinc-500 lg:px-0">
              Messages
            </h2>
            <ConversationsList matches={matches} />
          </section>
        </div>
      ) : hasMatchRequests ? (
        <div className="mx-auto flex w-full max-w-6xl px-4 pt-6 lg:px-8">
          <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2 text-white">
              <Heart className="h-4 w-4 text-crimson" />
              <p className="text-sm font-semibold">No confirmed matches yet</p>
            </div>
            <p className="mt-1 text-sm text-white/60">
              Approve a request above to create a match and start chatting.
            </p>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex h-[70vh] flex-col items-center justify-center px-8 text-center">
          <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <Flame size={48} className="text-zinc-700" />
          </div>
          <h2 className="font-serif font-bold text-2xl text-white mb-2">
            No matches yet
          </h2>
          <p className="text-zinc-400 mb-8 max-w-xs">
            Start swiping to find your perfect match. Don't be shy!
          </p>
          <Link href="/home" className="px-8 py-3 bg-crimson text-white font-bold rounded-full shadow-[0_0_20px_rgba(232,25,44,0.4)] hover:scale-105 transition-transform">
            Start Swiping
          </Link>
        </div>
      )}
    </div>
  );
}
