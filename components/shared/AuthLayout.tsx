"use client";

import { motion } from "framer-motion";
import { FlameLogo } from "@/components/ui/flame-logo";
import Link from "next/link";

interface AuthLayoutProps {
  children: React.ReactNode;
  quote?: string;
  author?: string;
}

export function AuthLayout({ children, quote, author }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground lg:grid lg:grid-cols-2">
      {/* Left Panel */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="hidden flex-col justify-between bg-zinc-900 p-10 lg:flex relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-crimson/20 via-zinc-900 to-zinc-900 opacity-50" />
        
        {/* Abstract Background Element */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-crimson/5 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="relative z-20 flex items-center text-lg font-medium text-white">
          <FlameLogo className="mr-2 h-8 w-8 text-crimson" />
          <span className="font-serif tracking-tight">IGNITE</span>
        </div>

        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-2xl font-serif text-white/90">
              &ldquo;{quote || "Love is not about finding the right person, but creating a right relationship. It's not about how much love you have in the beginning but how much love you build till the end."}&rdquo;
            </p>
            <footer className="text-sm font-mono text-crimson tracking-widest uppercase">
              {author || "The Ignite Team"}
            </footer>
          </blockquote>
        </div>
      </motion.div>

      {/* Right Panel (Form) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex items-center justify-center p-8 lg:p-8"
      >
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          <div className="lg:hidden flex justify-center mb-8">
            <FlameLogo className="h-12 w-12 text-crimson" />
          </div>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
