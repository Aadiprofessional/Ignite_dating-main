"use client";

import { Match } from "@/lib/mockMatches";
import { motion } from "framer-motion";
import { X, Heart, ShieldAlert, Flag } from "lucide-react";

interface MiniProfileDrawerProps {
  match: Match;
  onClose: () => void;
  onUnmatch: () => void;
}

export function MiniProfileDrawer({ match, onClose, onUnmatch }: MiniProfileDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      />

      {/* Drawer */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-x-0 bottom-0 z-50 bg-[#0A0A0A] border-t border-zinc-800 rounded-t-[32px] overflow-hidden max-h-[85vh] flex flex-col"
      >
        {/* Handle */}
        <div className="w-full flex justify-center pt-4 pb-2" onClick={onClose}>
          <div className="w-12 h-1.5 bg-zinc-800 rounded-full" />
        </div>

        <div className="overflow-y-auto p-6 space-y-6 pb-12">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full border-4 border-zinc-900 shadow-xl overflow-hidden mb-4 relative">
              <img src={match.avatar} alt={match.name} className="w-full h-full object-cover" />
              {match.online && (
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-[#0A0A0A]" />
              )}
            </div>
            <h2 className="font-serif font-bold text-3xl text-white mb-1">{match.name}</h2>
            {match.verified && (
               <div className="flex items-center gap-1 bg-blue-500/10 text-blue-400 px-3 py-0.5 rounded-full border border-blue-500/20 text-xs font-medium">
                 Verified Profile
               </div>
            )}
          </div>

          {/* Bio Section - Simplified from full profile */}
          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50">
            <h3 className="font-serif font-bold text-lg text-crimson mb-2">About</h3>
            <p className="text-zinc-300 text-sm leading-relaxed">
              Hey there! I'm {match.name}. This is a mini profile view. 
              Usually this would pull the full bio from the profile data.
              Let's grab coffee sometime? ☕️
            </p>
          </div>

          {/* Shared Interests (Mocked for now as Match type might not have full interests) */}
          <div>
             <h3 className="font-serif font-bold text-lg text-crimson mb-3">Shared Interests</h3>
             <div className="flex flex-wrap gap-2">
               {["Travel", "Photography", "Sushi"].map((interest) => (
                 <span key={interest} className="px-3 py-1 bg-crimson/10 text-crimson border border-crimson/20 rounded-full text-xs font-medium">
                   {interest}
                 </span>
               ))}
               <span className="px-3 py-1 bg-zinc-800 text-zinc-500 rounded-full text-xs font-medium border border-zinc-700">
                 +2 more
               </span>
             </div>
          </div>

          {/* Actions */}
          <div className="pt-4 space-y-3">
             <button 
               onClick={onUnmatch}
               className="w-full py-4 bg-zinc-900 text-red-500 font-bold rounded-xl border border-zinc-800 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
             >
               <ShieldAlert size={18} />
               Unmatch {match.name}
             </button>
             
             <button className="w-full py-4 bg-transparent text-zinc-500 font-mono text-xs hover:text-white transition-colors flex items-center justify-center gap-2">
               <Flag size={14} />
               Report Profile
             </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
