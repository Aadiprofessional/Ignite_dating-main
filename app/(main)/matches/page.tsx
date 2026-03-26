"use client";

import { useStore } from "@/lib/store";
import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo } from "react";

export default function MatchesPage() {
  const { matches, refreshMatches } = useStore();
  const sortedMatches = useMemo(
    () => [...matches].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [matches]
  );

  useEffect(() => {
    void refreshMatches();
  }, [refreshMatches]);

  return (
    <div className="min-h-screen bg-[#080808] pb-24 lg:pb-8">
      <header className="sticky top-0 z-20 bg-[#080808]/80 px-4 pb-4 pt-6 backdrop-blur-md lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <h1 className="font-serif text-3xl font-bold text-white">
            Your Matches <span className="text-crimson">🔥</span>
          </h1>
          <p className="mt-1 text-sm text-zinc-400">{sortedMatches.length} active connections</p>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 pt-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {sortedMatches.map((match, i) => (
            <motion.article
              key={match.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 via-white/[0.04] to-transparent shadow-[0_24px_70px_-28px_rgba(0,0,0,0.9)]"
            >
              <div className="relative h-56">
                <Image src={match.avatar} alt={match.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
                  <span className="rounded-full border border-white/30 bg-black/45 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-white/90">
                    Match
                  </span>
                  {match.online ? (
                    <span className="rounded-full border border-emerald-300/35 bg-emerald-400/20 px-2.5 py-1 text-[10px] font-semibold text-emerald-200">
                      Online
                    </span>
                  ) : null}
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate font-serif text-2xl font-bold text-white">{match.name}</h2>
                    {match.isVerified ? <CheckCircle2 className="h-4 w-4 text-sky-400" /> : null}
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4">
                <p className="line-clamp-2 min-h-[40px] text-sm text-zinc-300">
                  {match.lastMessage || "Say hi and start the conversation"}
                </p>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span>{new Date(match.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {match.unreadCount > 0 ? (
                      <span className="rounded-full bg-crimson px-2 py-0.5 text-[10px] font-bold text-white">
                        {match.unreadCount} new
                      </span>
                    ) : null}
                  </div>
                  <Link
                    href={`/messages/${match.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-crimson px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-[1.02] hover:bg-crimson/90"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
}
