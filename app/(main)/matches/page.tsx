"use client";

import { ConversationsList } from "@/components/matches/ConversationsList";
import { NewMatchesRow } from "@/components/matches/NewMatchesRow";
import { mockMatches } from "@/lib/mockMatches";
import { Flame } from "lucide-react";

export default function MatchesPage() {
  const hasMatches = mockMatches.length > 0;

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

      {hasMatches ? (
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8">
          {/* New Matches */}
          <section className="lg:sticky lg:top-24 lg:h-fit">
            <h2 className="mb-2 px-4 font-mono text-xs font-bold uppercase tracking-wider text-zinc-500 lg:px-0">
              New Matches
            </h2>
            <NewMatchesRow matches={mockMatches} />
          </section>

          {/* Conversations */}
          <section>
            <h2 className="mb-2 px-4 font-mono text-xs font-bold uppercase tracking-wider text-zinc-500 lg:px-0">
              Messages
            </h2>
            <ConversationsList matches={mockMatches} />
          </section>
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
          <button className="px-8 py-3 bg-crimson text-white font-bold rounded-full shadow-[0_0_20px_rgba(232,25,44,0.4)] hover:scale-105 transition-transform">
            Start Swiping
          </button>
        </div>
      )}
    </div>
  );
}
