"use client";

import { Match } from "@/lib/mockMatches";
import { motion } from "framer-motion";
import Link from "next/link";

interface NewMatchesRowProps {
  matches: Match[];
}

export function NewMatchesRow({ matches }: NewMatchesRowProps) {
  const newMatches = matches.filter((m) => m.isNew);

  if (newMatches.length === 0) return null;

  return (
    <div className="border-b border-zinc-900/50 py-6 lg:rounded-2xl lg:border lg:border-white/10 lg:bg-white/5 lg:px-3">
      <div className="flex gap-4 overflow-x-auto px-4 pb-4 no-scrollbar lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-1">
        {newMatches.map((match, index) => (
          <Link key={match.id} href={`/messages/${match.id}`} className="flex-shrink-0 group">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Glowing Ring */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-crimson to-orange-500 opacity-70 blur-sm animate-pulse" />
              
              <div className="relative w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-crimson to-orange-500">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#080808]">
                  <img
                    src={match.avatar}
                    alt={match.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                </div>
              </div>

              {/* Online Dot */}
              {match.online && (
                <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#080808] z-10" />
              )}
            </motion.div>
            
            <div className="mt-2 text-center">
              <span className="block font-serif font-bold text-sm text-white">{match.name}</span>
              <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-bold text-white bg-crimson rounded-full">
                NEW
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
