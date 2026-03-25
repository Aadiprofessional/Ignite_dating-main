"use client";

import { ChatPageClient } from "@/components/chat/ChatPageClient";
import { useStore } from "@/lib/store";
import { format } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export function MessagesInboxClient() {
  const { matches, refreshMatches } = useStore();
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  useEffect(() => {
    void refreshMatches();
  }, [refreshMatches]);

  const sortedMatches = useMemo(
    () => [...matches].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [matches]
  );

  useEffect(() => {
    if (!sortedMatches.length) {
      setActiveMatchId(null);
      return;
    }
    setActiveMatchId((prev) => {
      if (prev && sortedMatches.some((match) => match.id === prev)) return prev;
      return sortedMatches[0].id;
    });
  }, [sortedMatches]);

  if (!sortedMatches.length) {
    return (
      <div className="flex min-h-[70dvh] items-center justify-center px-6 text-center">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">No conversations yet</h1>
          <p className="mt-2 text-sm text-zinc-400">Once you match with someone, your chats appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-9rem)] min-h-[560px] flex-col overflow-hidden bg-[#080808] lg:h-full lg:min-h-0 lg:flex-row">
      <aside className="flex w-full min-h-0 flex-col border-b border-white/10 bg-[#0A0A0A] lg:h-full lg:w-[340px] lg:flex-shrink-0 lg:border-b-0 lg:border-r">
        <div className="shrink-0 border-b border-white/10 px-4 py-4">
          <h1 className="font-serif text-2xl font-bold text-white">
            Messages <span className="text-crimson">🔥</span>
          </h1>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pb-24 lg:pb-0">
          {sortedMatches.map((match) => {
            const isActive = activeMatchId === match.id;
            return (
              <button
                key={match.id}
                type="button"
                onClick={() => setActiveMatchId(match.id)}
                className={`hidden w-full items-center gap-3 border-b border-white/5 px-4 py-3 text-left transition-colors lg:flex ${
                  isActive ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-white/15">
                  <img src={match.avatar} alt={match.name} className="h-full w-full object-cover" />
                  {match.online ? (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0A0A0A] bg-emerald-500" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`truncate text-sm ${match.unreadCount > 0 ? "font-bold text-white" : "text-zinc-100"}`}>
                        {match.name}
                      </span>
                      {match.isVerified ? <CheckCircle2 size={13} className="text-blue-400" /> : null}
                    </div>
                    <span className="text-[11px] text-zinc-500">{format(new Date(match.timestamp), "HH:mm")}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className={`truncate text-xs ${match.unreadCount > 0 ? "text-zinc-100" : "text-zinc-400"}`}>{match.lastMessage}</p>
                    {match.unreadCount > 0 ? (
                      <span className="rounded-full bg-crimson px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {match.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })}
          {sortedMatches.map((match) => (
            <Link
              key={`mobile-${match.id}`}
              href={`/messages/${match.id}`}
              className="flex items-center gap-3 border-b border-white/5 px-4 py-3 transition-colors hover:bg-white/5 lg:hidden"
            >
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-white/15">
                <img src={match.avatar} alt={match.name} className="h-full w-full object-cover" />
                {match.online ? (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0A0A0A] bg-emerald-500" />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`truncate text-sm ${match.unreadCount > 0 ? "font-bold text-white" : "text-zinc-100"}`}>
                      {match.name}
                    </span>
                    {match.isVerified ? <CheckCircle2 size={13} className="text-blue-400" /> : null}
                  </div>
                  <span className="text-[11px] text-zinc-500">{format(new Date(match.timestamp), "HH:mm")}</span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className={`truncate text-xs ${match.unreadCount > 0 ? "text-zinc-100" : "text-zinc-400"}`}>{match.lastMessage}</p>
                  {match.unreadCount > 0 ? (
                    <span className="rounded-full bg-crimson px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {match.unreadCount}
                    </span>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </aside>

      <section className="hidden min-h-0 min-w-0 flex-1 lg:flex lg:h-full lg:flex-col">
        {activeMatchId ? <ChatPageClient id={activeMatchId} layout="embedded" /> : null}
      </section>
    </div>
  );
}
