"use client";

import { Check, Star } from "lucide-react";
import { motion } from "framer-motion";

interface PlanCardProps {
  name: string;
  price: string;
  features: { text: string; included: boolean }[];
  isPopular?: boolean;
  isPlatinum?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function PlanCard({
  name,
  price,
  features,
  isPopular,
  isPlatinum,
  isSelected,
  onSelect,
}: PlanCardProps) {
  return (
    <motion.div
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      animate={isSelected ? { scale: 1.03, borderColor: "#E8192C" } : { scale: 1, borderColor: isPlatinum ? "#CA8A04" : "#27272a" }}
      className={`relative p-6 rounded-3xl cursor-pointer transition-all duration-300 border bg-[#0A0A0A] overflow-hidden group h-full flex flex-col justify-between ${
        isSelected
          ? "shadow-[0_0_30px_rgba(232,25,44,0.3)] z-10"
          : "hover:border-zinc-700"
      }`}
    >
      {/* Background Effects */}
      {isSelected && (
        <div className="absolute inset-0 bg-gradient-to-b from-crimson/10 to-transparent pointer-events-none" />
      )}
      
      <div>
        {/* Badges */}
        {isPopular && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-crimson text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg z-20 whitespace-nowrap border border-white/10">
            MOST POPULAR
          </div>
        )}
        
        {/* Header */}
        <div className="text-center mb-6 pt-2 relative z-10">
          <h3 className={`font-serif font-bold text-2xl mb-1 ${isPlatinum ? "text-yellow-500" : "text-white"}`}>
            {name}
          </h3>
          <p className="font-mono text-sm text-zinc-400">{price}</p>
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8 relative z-10">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              {feature.included ? (
                <div className={`mt-0.5 p-0.5 rounded-full ${isPlatinum ? "bg-yellow-500/20 text-yellow-500" : "bg-crimson/20 text-crimson"}`}>
                  <Check size={12} strokeWidth={3} />
                </div>
              ) : (
                <span className="text-zinc-700 font-mono mt-0.5 w-4 text-center select-none">—</span>
              )}
              <span className={`leading-tight ${feature.included ? "text-zinc-300" : "text-zinc-600 line-through decoration-zinc-700"}`}>
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Selection Indicator */}
      <div className="relative z-10 mt-auto">
        <div
          className={`w-full py-3 rounded-xl text-sm font-bold text-center transition-all duration-300 border ${
            isSelected
              ? "bg-crimson border-crimson text-white shadow-lg"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 group-hover:bg-zinc-800 group-hover:border-zinc-700"
          }`}
        >
          {isSelected ? "Selected" : "Select Plan"}
        </div>
      </div>
    </motion.div>
  );
}
