"use client";

import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 bg-[#ffffff0d] rounded-[20px_20px_20px_4px] px-4 py-3 w-fit border border-white/5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.4, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1.2 }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.2,
          }}
          className="w-2 h-2 bg-zinc-400 rounded-full"
        />
      ))}
    </div>
  );
}
