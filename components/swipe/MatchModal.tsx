"use client";

import { Profile } from "@/lib/mockProfiles";
import { motion } from "framer-motion";
import { Heart, MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

interface MatchModalProps {
  profile: Profile;
  onClose: () => void;
  onChat: () => void;
}

export function MatchModal({ profile, onClose, onChat }: MatchModalProps) {
  // Mock current user photo
  const currentUserPhoto = "https://randomuser.me/api/portraits/men/99.jpg";

  // Confetti particles
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  useEffect(() => {
    // Generate confetti
    const newParticles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // vw
      y: Math.random() * 100, // vh
      color: Math.random() > 0.5 ? "#E8192C" : "#FFFFFF",
    }));
    setParticles(newParticles);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl p-6"
    >
      {/* Confetti */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, y: -20, x: p.x + "%" }}
          animate={{
            opacity: 0,
            y: "100vh",
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            top: -20,
            left: `${p.x}%`,
            width: "8px",
            height: "8px",
            backgroundColor: p.color,
            borderRadius: "50%",
          }}
        />
      ))}

      {/* Match Text */}
      <motion.h1
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
        className="font-serif font-bold text-5xl md:text-6xl text-white italic mb-12 text-center drop-shadow-[0_0_15px_rgba(232,25,44,0.5)]"
      >
        IT'S A MATCH! 🔥
      </motion.h1>

      {/* Photos */}
      <div className="flex items-center justify-center gap-4 mb-12 relative">
        {/* Current User */}
        <motion.div
          initial={{ x: -100, opacity: 0, rotate: -15 }}
          animate={{ x: 0, opacity: 1, rotate: -10 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="w-32 h-48 md:w-40 md:h-60 rounded-xl overflow-hidden border-4 border-white shadow-2xl relative z-10"
        >
          <img src={currentUserPhoto} alt="You" className="w-full h-full object-cover" />
        </motion.div>

        {/* Heart Burst */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.5, 1] }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="absolute z-30 bg-white rounded-full p-3 shadow-xl text-crimson"
        >
          <Heart size={32} fill="currentColor" strokeWidth={0} />
        </motion.div>

        {/* Matched Profile */}
        <motion.div
          initial={{ x: 100, opacity: 0, rotate: 15 }}
          animate={{ x: 0, opacity: 1, rotate: 10 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="w-32 h-48 md:w-40 md:h-60 rounded-xl overflow-hidden border-4 border-white shadow-2xl relative z-10"
        >
          <img src={profile.photos[0]} alt={profile.name} className="w-full h-full object-cover" />
        </motion.div>
      </div>

      <div className="text-center mb-8">
        <p className="text-zinc-300 font-mono text-sm">
          You and <span className="text-white font-bold">{profile.name}</span> have liked each other.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={onChat}
          className="w-full py-4 bg-crimson rounded-full font-bold text-white flex items-center justify-center gap-2 hover:bg-crimson/90 transition-colors shadow-[0_0_20px_rgba(232,25,44,0.4)]"
        >
          <MessageCircle size={20} />
          Send a Message
        </motion.button>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1 }}
          onClick={onClose}
          className="w-full py-4 bg-transparent border border-zinc-700 rounded-full font-medium text-zinc-300 hover:bg-white/5 transition-colors"
        >
          Keep Swiping
        </motion.button>
      </div>
    </motion.div>
  );
}
