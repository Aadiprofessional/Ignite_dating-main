"use client";

import { useStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Heart, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function LikesPage() {
  const { incomingLikes, refreshIncomingLikes, respondIncomingLike } = useStore();
  const [loadingSwipeId, setLoadingSwipeId] = useState<string | null>(null);

  useEffect(() => {
    void refreshIncomingLikes({ limit: 20, offset: 0 });
  }, [refreshIncomingLikes]);

  const handleRespond = async (swiperId: string, decision: "accept" | "reject") => {
    setLoadingSwipeId(swiperId);
    try {
      await respondIncomingLike(swiperId, decision);
    } finally {
      setLoadingSwipeId(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#080808] pb-24 lg:pb-8">
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-[#080808]/80 px-4 py-4 backdrop-blur-md lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-white">Likes</h1>
            <p className="text-xs text-white/50">{incomingLikes.length} people like you</p>
          </div>
          <div className="rounded-full bg-white/10 p-2">
            <Heart className="h-5 w-5 fill-crimson text-crimson" />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pt-6 lg:px-8">
        {incomingLikes.length === 0 ? (
          <div className="flex h-[65vh] flex-col items-center justify-center text-center">
            <div className="mb-3 rounded-full bg-white/5 p-4">
              <Heart className="h-8 w-8 text-white/40" />
            </div>
            <h2 className="font-serif text-2xl text-white">No incoming likes</h2>
            <p className="mt-2 max-w-sm text-sm text-white/50">When someone likes your profile, they will show up here for accept or reject.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {incomingLikes.map((user, i) => (
              <motion.div
                key={user.swipeId}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={user.photos[0]}
                    alt={user.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-end gap-2">
                      <h3 className="font-serif text-2xl font-bold text-white">{user.name}</h3>
                      <span className="pb-1 text-sm text-white/80">{Math.round(user.distanceKm)} km</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-white/70">{user.bio || `${user.city}${user.city && user.country ? ", " : ""}${user.country}`}</p>
                    <div className="mt-2 text-[11px] text-white/60">
                      {user.universityName || `${user.city}${user.city && user.country ? ", " : ""}${user.country}`}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-3">
                  <button
                    onClick={() => void handleRespond(user.swiperId, "reject")}
                    disabled={loadingSwipeId === user.swiperId}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-transparent py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => void handleRespond(user.swiperId, "accept")}
                    disabled={loadingSwipeId === user.swiperId}
                    className="flex items-center justify-center gap-2 rounded-xl bg-crimson py-2 text-sm font-semibold text-white transition-colors hover:bg-crimson/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                    Accept
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
