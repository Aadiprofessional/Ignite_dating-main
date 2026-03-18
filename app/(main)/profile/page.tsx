"use client";

import { useStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Settings, Shield, Edit2, Star, Zap, Heart, ChevronRight, Crown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
  const { currentUser, isPro } = useStore();

  // Fallback if no user (should rely on auth guard in real app)
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white/50">Loading profile...</div>
      </div>
    );
  }

  // Calculate profile completion (mock logic)
  const filledFields = [
    currentUser.bio,
    currentUser.job,
    currentUser.company,
    currentUser.education,
    currentUser.interests.length > 0,
    currentUser.photos.length > 2
  ].filter(Boolean).length;
  const completionPercentage = Math.min(100, Math.round((filledFields / 6) * 100));

  return (
    <div className="relative min-h-screen overflow-hidden pb-24 lg:pb-8">
      {/* Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-full max-w-3xl -translate-x-1/2 bg-crimson/10 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-10 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-white">Profile</h1>
          <Link href="/settings">
            <Settings className="w-6 h-6 text-white/60 hover:text-white transition-colors" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="relative mb-4 flex flex-col items-center">
              <div className="relative h-32 w-32 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-crimson p-1">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src={currentUser.photos[0]}
                  alt={currentUser.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            {isPro && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-600 text-black text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-amber-500/20">
                <Crown className="w-3 h-3" />
                <span>PRO</span>
              </div>
            )}
            <Link 
              href="/profile/edit"
              className="absolute bottom-0 right-0 bg-[#27272a] p-2 rounded-full border border-white/10 hover:bg-white/10 transition-colors shadow-lg"
            >
              <Edit2 className="w-4 h-4 text-white" />
            </Link>
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
              {currentUser.name}, {currentUser.age}
              {currentUser.isVerified && (
                <div className="bg-blue-500 rounded-full p-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </h2>
            <p className="text-white/50 text-sm mt-1">{currentUser.job || "Add job title"}</p>
          </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Matches", value: "128", icon: Heart, color: "text-crimson" },
            { label: "Likes", value: "850+", icon: Star, color: "text-amber-500" },
            { label: "Views", value: "1.2k", icon: Zap, color: "text-purple-500" }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-white/10 transition-colors"
            >
              <div className={`p-2 rounded-full bg-white/5 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold font-mono">{stat.value}</span>
              <span className="text-xs text-white/40 uppercase tracking-wider">{stat.label}</span>
            </motion.div>
          ))}
            </div>
          </div>

          <div>
        <div className="mb-8 bg-white/5 rounded-2xl p-4 border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Profile Strength</span>
            <span className="text-sm text-crimson font-mono">{completionPercentage}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-crimson rounded-full"
            />
          </div>
          {completionPercentage < 100 && (
            <p className="text-xs text-white/40 mt-2">
              Tip: Add more photos to reach 100%
            </p>
          )}
        </div>

        {/* Ignite Pro Banner */}
        {!isPro && (
          <Link href="/premium">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mb-8 rounded-2xl p-1 bg-gradient-to-r from-amber-500 via-orange-500 to-crimson"
            >
              <div className="bg-[#080808] rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-crimson flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">Get Ignite Pro</h3>
                    <p className="text-xs text-white/50">See who likes you & more</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30" />
              </div>
            </motion.div>
          </Link>
        )}

        {/* Menu Items */}
        <div className="space-y-3">
          {[
            { icon: Shield, label: "Safety Center", href: "/safety" },
            { icon: Settings, label: "Settings", href: "/settings" },
          ].map((item, i) => (
            <Link key={item.label} href={item.href}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-white/60" />
                  <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight className="w-5 h-5 text-white/30" />
              </motion.div>
            </Link>
          ))}
        </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-xs text-white/20 font-mono uppercase tracking-widest">Ignite v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
