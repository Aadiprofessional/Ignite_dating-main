"use client";

import { Match } from "@/lib/mockMatches";
import { format } from "date-fns";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { CheckCircle2, ShieldAlert, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ConversationsListProps {
  matches: Match[];
}

function ConversationRow({ match }: { match: Match }) {
  const controls = useAnimation();
  const [isOpen, setIsOpen] = useState(false);

  const handleDragEnd = async (event: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset < -100 || velocity < -500) {
      await controls.start({ x: -150 });
      setIsOpen(true);
    } else {
      await controls.start({ x: 0 });
      setIsOpen(false);
    }
  };

  const closeSwipe = () => {
    controls.start({ x: 0 });
    setIsOpen(false);
  };

  return (
    <div className="relative overflow-hidden group h-[88px]">
      {/* Background Actions */}
      <div className="absolute inset-y-0 right-0 flex items-center bg-zinc-900 w-[150px] h-full z-0">
        <button 
          onClick={() => console.log("Report", match.id)}
          className="flex-1 h-full bg-zinc-800 hover:bg-zinc-700 flex flex-col items-center justify-center text-zinc-400 hover:text-white text-[10px] gap-1 transition-colors"
        >
          <ShieldAlert size={18} />
          Report
        </button>
        <button 
          onClick={() => console.log("Unmatch", match.id)}
          className="flex-1 h-full bg-crimson hover:bg-red-700 flex flex-col items-center justify-center text-white text-[10px] gap-1 transition-colors"
        >
          <Trash2 size={18} />
          Unmatch
        </button>
      </div>

      {/* Foreground Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
        className="relative z-10 bg-[#080808] border-b border-zinc-900/50 h-full flex items-center"
      >
        <Link
          href={`/messages/${match.id}`}
          onClick={(e) => {
            if (isOpen) {
              e.preventDefault();
              closeSwipe();
            }
          }}
          className="flex items-center gap-4 px-4 w-full h-full hover:bg-white/5 transition-colors"
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-[60px] h-[60px] rounded-full overflow-hidden border border-zinc-800">
              <img src={match.avatar} alt={match.name} className="w-full h-full object-cover" />
            </div>
            {match.online && (
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#080808]" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex justify-between items-baseline mb-1">
              <div className="flex items-center gap-1.5">
                <h3 className={`font-sans text-lg truncate ${match.unreadCount > 0 ? "font-bold text-white" : "font-medium text-zinc-200"}`}>
                  {match.name}
                </h3>
                {match.isVerified && (
                  <CheckCircle2 size={14} className="text-blue-500 fill-blue-500/10" />
                )}
              </div>
              <span className="text-xs font-mono text-zinc-500 whitespace-nowrap">
                {format(new Date(match.timestamp), "HH:mm")}
              </span>
            </div>
            
            <div className="flex justify-between items-center gap-2">
              <p className={`text-sm truncate ${match.unreadCount > 0 ? "text-white font-medium" : "text-zinc-400"}`}>
                {match.lastMessage}
              </p>
              {match.unreadCount > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-crimson text-white text-[10px] font-bold rounded-full">
                  {match.unreadCount}
                </span>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}

export function ConversationsList({ matches }: ConversationsListProps) {
  // Sort by timestamp desc
  const sortedMatches = [...matches].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="flex flex-col pb-24 lg:rounded-2xl lg:border lg:border-white/10 lg:bg-white/5 lg:pb-0">
      {sortedMatches.map((match) => (
        <ConversationRow key={match.id} match={match} />
      ))}
    </div>
  );
}
