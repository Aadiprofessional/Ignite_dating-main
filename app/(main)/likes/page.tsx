"use client";

import { useStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Lock, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Mock data for likes
const mockLikes = Array.from({ length: 12 }).map((_, i) => ({
  id: `like-${i}`,
  name: ["Sarah", "Jessica", "Emily", "Chloe", "Mia", "Sophia", "Olivia", "Ava", "Isabella", "Harper", "Camila", "Luna"][i],
  age: 20 + Math.floor(Math.random() * 10),
  photo: `https://randomuser.me/api/portraits/women/${i + 10}.jpg`,
  isOnline: Math.random() > 0.7,
}));

export default function LikesPage() {
  const { isPro } = useStore();

  return (
    <div className="relative min-h-screen bg-[#080808] pb-24 lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-white/5 bg-[#080808]/80 px-4 py-4 backdrop-blur-md lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <div>
          <h1 className="font-serif text-2xl font-bold text-white">Likes</h1>
          <p className="text-xs text-white/50">{mockLikes.length} people like you</p>
        </div>
        <div className="bg-white/10 p-2 rounded-full">
          <Heart className="w-5 h-5 text-crimson fill-crimson" />
        </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pt-6 lg:px-8">
        {/* Pro Banner if not upgraded */}
        {!isPro && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-crimson/20 border border-amber-500/30 text-center relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-bold text-amber-500 mb-1">Upgrade to See Who Likes You</h3>
              <p className="text-xs text-white/60 mb-3">Do not keep them waiting! See everyone who swiped right.</p>
              <Link href="/wallet/buy">
                <button className="bg-gradient-to-r from-amber-500 to-crimson text-white font-bold text-xs px-6 py-2 rounded-full shadow-lg hover:scale-105 transition-transform">
                  Unlock Likes
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Likes Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {mockLikes.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/5 group"
            >
              {/* Blur effect for non-pro users */}
              <div className={`absolute inset-0 z-10 ${!isPro ? 'backdrop-blur-xl bg-black/30' : ''}`}>
                <Image
                  src={user.photo}
                  alt={user.name}
                  fill
                  className={`object-cover transition-transform duration-500 ${!isPro ? 'scale-110 blur-md' : 'group-hover:scale-110'}`}
                />
              </div>

              {/* Overlay Content */}
              <div className="absolute inset-0 z-20 flex flex-col justify-end p-3 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                {!isPro ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-2">
                      <Lock className="w-5 h-5 text-amber-500" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-lg">{user.name}</span>
                      <span className="text-white/80 text-sm">{user.age}</span>
                    </div>
                    {user.isOnline && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-[10px] text-white/60">Online Now</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Tap feedback */}
              <div className="absolute inset-0 z-30 opacity-0 active:opacity-10 transition-opacity bg-white pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
