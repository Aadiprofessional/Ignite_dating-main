"use client";

import { Profile } from "@/lib/mockProfiles";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ProfileGridProps {
  profiles: Profile[];
  onLoadMore: () => void;
  onLike: (profileId: string) => Promise<void>;
}

export function ProfileGrid({ profiles, onLoadMore, onLike }: ProfileGridProps) {
  const observerTarget = useRef<HTMLDivElement>(null);
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set());
  const [loadingLikeId, setLoadingLikeId] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [onLoadMore]);

  const toggleLike = async (id: string) => {
    if (loadingLikeId) return;
    setLoadingLikeId(id);
    const newLiked = new Set(likedProfiles);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedProfiles(newLiked);
    try {
      await onLike(id);
    } finally {
      setLoadingLikeId(null);
    }
  };

  return (
    <div className="pb-20 lg:pb-8">
      <div className="columns-2 gap-4 space-y-4 lg:columns-3 xl:columns-4">
        {profiles.map((profile, index) => {
          // Randomize aspect ratio for masonry feel
          const aspectRatios = ["aspect-[3/4]", "aspect-[4/5]", "aspect-[1/1]"];
          const aspectRatio = aspectRatios[index % 3];
          const isOnline = index % 3 === 0; // Mock online status

          return (
            <motion.div
              key={`${profile.id}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-zinc-900 shadow-lg ${aspectRatio}`}
            >
              <img
                src={profile.photos[0]}
                alt={profile.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80" />

              {/* Online Indicator */}
              {isOnline && (
                <div className="absolute top-3 left-3 w-3 h-3 bg-green-500 rounded-full border-2 border-zinc-900 shadow-lg z-10" />
              )}

              {/* Heart Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  void toggleLike(profile.id);
                }}
                disabled={loadingLikeId === profile.id}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/20 backdrop-blur-md hover:bg-black/40 transition-colors z-20"
              >
                <Heart
                  size={20}
                  className={`transition-all duration-300 ${
                    likedProfiles.has(profile.id)
                      ? "fill-crimson text-crimson scale-110"
                      : "text-white scale-100"
                  }`}
                />
              </button>

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-serif font-bold text-lg text-white leading-tight">
                  {profile.name}, {profile.age}
                </h3>
                <div className="flex flex-wrap gap-1 mt-2">
                  {profile.interests.slice(0, 1).map((interest) => (
                    <span
                      key={interest}
                      className="text-[10px] font-mono text-zinc-300 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm"
                    >
                      {interest}
                    </span>
                  ))}
                  {profile.interests.length > 1 && (
                    <span className="text-[10px] font-mono text-zinc-300 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      +{profile.interests.length - 1}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Loading Trigger */}
      <div ref={observerTarget} className="h-10 flex items-center justify-center mt-8">
        <div className="w-6 h-6 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
