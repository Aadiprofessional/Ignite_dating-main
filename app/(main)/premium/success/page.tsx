"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export default function SuccessPage() {
  useEffect(() => {
    // Fire confetti on mount
    const end = Date.now() + 3000;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#E8192C", "#FFFFFF"],
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#E8192C", "#FFFFFF"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-crimson/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-md w-full text-center"
      >
        {/* Animated Checkmark */}
        <div className="w-24 h-24 bg-gradient-to-br from-crimson to-red-600 rounded-full mx-auto mb-8 flex items-center justify-center shadow-[0_0_50px_rgba(232,25,44,0.5)] relative">
            <div className="absolute inset-0 bg-crimson rounded-full animate-ping opacity-20" />
            <motion.svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white relative z-10"
            >
                <motion.path 
                    d="M20 6L9 17l-5-5" 
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                />
            </motion.svg>
        </div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-serif font-bold text-4xl mb-4"
        >
          You're now <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-crimson to-yellow-500 animate-pulse">
            IGNITE PRO 🔥
          </span>
        </motion.h1>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8 text-left backdrop-blur-sm shadow-xl"
        >
          <h3 className="text-xs font-mono text-zinc-400 mb-4 uppercase tracking-wider border-b border-zinc-800 pb-2">
            Subscription Details
          </h3>
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-lg text-white">Ignite Pro</span>
            <span className="text-crimson font-bold">$14.99/mo</span>
          </div>
          <p className="text-sm text-zinc-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
            Active from today
          </p>
          <p className="text-xs text-zinc-500 mt-4">
            Renewal: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Link
            href="/home"
            className="block w-full bg-white text-black font-bold text-lg py-4 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Explore Pro Features
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
