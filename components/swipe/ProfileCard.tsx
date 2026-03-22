"use client";

import { Profile } from "@/lib/mockProfiles";
import { cn } from "@/lib/utils";
import { motion, MotionStyle, MotionValue, useTransform } from "framer-motion";
import { MapPin } from "lucide-react";

interface ProfileCardProps {
  profile: Profile;
  style?: MotionStyle;
  drag?: boolean;
  x?: MotionValue<number>;
  y?: MotionValue<number>;
}

export function ProfileCard({ profile, style, drag, x, y }: ProfileCardProps) {
  // Like/Pass/SuperLike Opacity Transforms
  const likeOpacity = useTransform(x || new MotionValue(0), [50, 150], [0, 1]);
  const passOpacity = useTransform(x || new MotionValue(0), [-150, -50], [1, 0]);
  const superLikeOpacity = useTransform(y || new MotionValue(0), [-150, -50], [1, 0]);

  return (
    <motion.div
      style={style}
      whileTap={{ scale: 1.02 }}
      className={cn(
        "relative h-[66vh] w-full max-w-[380px] overflow-hidden rounded-[20px] border border-zinc-800 bg-zinc-900 shadow-2xl cursor-grab active:cursor-grabbing lg:h-[70vh] lg:max-w-[460px] xl:max-w-[520px]",
        drag ? "z-50" : "z-0"
      )}
    >
      {/* Profile Image */}
      <img
        src={profile.photos[0]}
        alt={profile.name}
        className="w-full h-full object-cover pointer-events-none select-none"
        draggable={false}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 pointer-events-none" />

      {/* Compatibility Badge */}
      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-crimson/50 px-3 py-1 rounded-full flex items-center gap-1 z-20">
        <span className="text-crimson font-bold text-sm">{profile.compatibility}%</span>
        <span className="text-xs text-white/80 font-mono">MATCH</span>
      </div>

      {/* Swipe Indicators */}
      {drag && x && y && (
        <>
          {/* LIKE Stamp (Right Swipe) */}
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-10 left-8 border-4 border-crimson rounded-lg px-4 py-2 transform -rotate-12 z-50 pointer-events-none bg-black/20 backdrop-blur-sm"
          >
            <span className="text-crimson font-bold text-4xl tracking-widest font-serif whitespace-nowrap">LIKE ❤️</span>
          </motion.div>

          {/* NOPE Stamp (Left Swipe) */}
          <motion.div
            style={{ opacity: passOpacity }}
            className="absolute top-10 right-8 border-4 border-zinc-200 rounded-lg px-4 py-2 transform rotate-12 z-50 pointer-events-none bg-black/20 backdrop-blur-sm"
          >
            <span className="text-zinc-200 font-bold text-4xl tracking-widest font-serif whitespace-nowrap">NOPE ✕</span>
          </motion.div>

          {/* SUPER LIKE Stamp (Up Swipe) */}
          <motion.div
            style={{ opacity: superLikeOpacity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-blue-400 rounded-lg px-6 py-3 transform -rotate-6 z-50 pointer-events-none bg-black/20 backdrop-blur-sm shadow-[0_0_30px_rgba(96,165,250,0.5)]"
          >
            <span className="text-blue-400 font-bold text-4xl tracking-widest font-serif whitespace-nowrap shadow-black drop-shadow-md">SUPER ★</span>
          </motion.div>
        </>
      )}

      {/* Card Info Overlay */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex flex-col gap-3 p-6 lg:p-7">
        <div>
          <h2 className="font-serif text-4xl font-bold text-white drop-shadow-lg lg:text-5xl">
            {profile.name}, {profile.age}
          </h2>
          <div className="flex items-center gap-2 text-zinc-300 font-mono text-sm mt-1">
            <MapPin size={14} className="text-crimson" />
            <span>{profile.distance} km away</span>
          </div>
        </div>

        {/* Interests Pills */}
        <div className="flex flex-wrap gap-2">
          {profile.interests.slice(0, 3).map((interest) => (
            <span
              key={interest}
              className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/10"
            >
              {interest}
            </span>
          ))}
          {profile.interests.length > 3 && (
            <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/10">
              +{profile.interests.length - 3}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
