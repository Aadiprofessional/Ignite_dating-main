"use client";

import { motion } from "framer-motion";

interface PricingToggleProps {
  isYearly: boolean;
  onToggle: (val: boolean) => void;
}

export function PricingToggle({ isYearly, onToggle }: PricingToggleProps) {
  return (
    <div className="flex justify-center mb-12 relative z-10">
      <div className="bg-zinc-900 border border-zinc-800 p-1 rounded-full flex relative w-fit mx-auto shadow-inner">
        {/* Animated Background Pill */}
        <motion.div
          className="absolute top-1 bottom-1 bg-zinc-800 rounded-full shadow-sm"
          initial={false}
          animate={{
            x: isYearly ? "100%" : "0%",
            width: isYearly ? "calc(55% - 4px)" : "calc(45% - 4px)",
            left: isYearly ? "auto" : "4px",
            right: isYearly ? "4px" : "auto",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />

        <button
          onClick={() => onToggle(false)}
          className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors w-[45%] text-center ${
            !isYearly ? "text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => onToggle(true)}
          className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors w-[55%] flex items-center justify-center gap-2 ${
            isYearly ? "text-white" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Yearly
          <span className="text-[10px] bg-crimson text-white px-2 py-0.5 rounded-full shadow-lg animate-pulse whitespace-nowrap">
            SAVE 40%
          </span>
        </button>
      </div>
    </div>
  );
}
