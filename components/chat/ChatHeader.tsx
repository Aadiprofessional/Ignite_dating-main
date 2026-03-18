"use client";

import { Match } from "@/lib/mockMatches";
import { ArrowLeft, MoreHorizontal, Video } from "lucide-react";
import Link from "next/link";

interface ChatHeaderProps {
  match: Match;
  onProfileClick?: () => void;
}

export function ChatHeader({ match, onProfileClick }: ChatHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-[#080808]/90 backdrop-blur-md border-b border-zinc-900/50">
      <Link href="/matches" className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft size={24} />
      </Link>

      <div className="flex flex-col items-center cursor-pointer" onClick={onProfileClick}>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-800">
              <img src={match.avatar} alt={match.name} className="w-full h-full object-cover" />
            </div>
            {match.online && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#080808]" />
            )}
          </div>
          <div className="text-center">
            <h2 className="font-bold text-white text-lg leading-tight">{match.name}</h2>
            {match.online && (
              <span className="text-[10px] font-mono text-green-500 block leading-none">Online</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="p-2 text-zinc-400 hover:text-white transition-colors">
          <Video size={24} />
        </button>
        <button className="p-2 text-zinc-400 hover:text-white transition-colors">
          <MoreHorizontal size={24} />
        </button>
      </div>
    </div>
  );
}
