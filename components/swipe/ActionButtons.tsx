"use client";

import { Undo2, X, Heart, Star } from "lucide-react";
import { motion } from "framer-motion";

interface ActionButtonsProps {
  onRewind: () => void;
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  canRewind?: boolean;
}

export function ActionButtons({ onRewind, onPass, onLike, onSuperLike, canRewind }: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      {/* Rewind */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onRewind}
        disabled={!canRewind}
        className={`w-12 h-12 rounded-full border-2 border-zinc-500 bg-black/40 backdrop-blur-md flex items-center justify-center text-zinc-300 shadow-lg transition-opacity ${!canRewind ? "opacity-50 cursor-not-allowed" : "hover:border-white hover:text-white"}`}
      >
        <Undo2 size={20} />
      </motion.button>

      {/* Pass */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onPass}
        className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-red-500 shadow-xl hover:bg-zinc-700"
      >
        <X size={28} strokeWidth={3} />
      </motion.button>

      {/* Like */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onLike}
        className="w-16 h-16 rounded-full bg-crimson flex items-center justify-center text-white shadow-xl hover:shadow-crimson/40 hover:scale-105"
      >
        <Heart size={32} fill="currentColor" strokeWidth={0} />
      </motion.button>

      {/* Super Like */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onSuperLike}
        className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-blue-400 shadow-xl hover:bg-zinc-700"
      >
        <Star size={28} fill="currentColor" strokeWidth={0} />
      </motion.button>
    </div>
  );
}
