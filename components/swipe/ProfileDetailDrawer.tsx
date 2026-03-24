"use client";

import { Profile } from "@/lib/mockProfiles";
import { motion } from "framer-motion";
import { MapPin, Briefcase, GraduationCap, X, Heart, Lock, LockOpen, Coins, Maximize2 } from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";

interface ProfileDetailDrawerProps {
  profile: Profile;
  onClose: () => void;
  onUnlock: () => void;
  onLike: () => void;
  onPass: () => void;
}

export function ProfileDetailDrawer({ profile, onClose, onUnlock, onLike, onPass }: ProfileDetailDrawerProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(Boolean(profile.unlockedByMe));
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);

  const nextPhoto = () => {
    if (currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const actionControls = (
    <>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={onPass}
        className="h-14 w-14 rounded-2xl border border-zinc-700 bg-zinc-900/80 text-red-500 shadow-lg shadow-black/40"
      >
        <span className="flex h-full w-full items-center justify-center">
          <X size={28} strokeWidth={3} />
        </span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        onClick={onLike}
        className="h-14 w-14 rounded-2xl bg-gradient-to-br from-crimson to-rose-500 text-white shadow-lg shadow-crimson/30"
      >
        <span className="flex h-full w-full items-center justify-center">
          <Heart size={28} fill="currentColor" strokeWidth={0} />
        </span>
      </motion.button>

      {!isUnlocked ? (
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            onUnlock();
            setIsUnlocked(true);
          }}
          className="h-14 flex-1 rounded-2xl border border-amber-300/40 bg-gradient-to-r from-amber-500/20 to-yellow-400/10 px-4 text-left text-white shadow-lg shadow-amber-500/10 transition-colors hover:border-amber-300/60"
        >
          <span className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-300" />
              <span className="text-sm font-semibold">Unlock Profile</span>
            </span>
            <span className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-xs font-mono text-amber-200">
              <Coins className="h-3.5 w-3.5" />
              - 100 coins
            </span>
          </span>
        </motion.button>
      ) : (
        <div className="h-14 flex-1 rounded-2xl border border-emerald-400/35 bg-emerald-500/10 px-4">
          <span className="flex h-full items-center justify-center gap-2 text-sm font-medium text-emerald-200">
            <LockOpen className="h-4 w-4" />
            Profile Unlocked
          </span>
        </div>
      )}
    </>
  );

  if (typeof document === "undefined") return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[130] overflow-y-auto bg-black/90 text-white backdrop-blur-sm lg:overflow-hidden"
    >
      <div className="mx-auto flex min-h-full w-full max-w-[1320px] items-stretch md:p-5 lg:h-[calc(100vh-4rem)] lg:min-h-0 lg:p-8">
        <div className="relative flex w-full flex-col overflow-hidden bg-black md:rounded-[32px] md:border md:border-white/10 md:shadow-[0_30px_120px_rgba(0,0,0,0.7)] lg:h-full">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-[90] rounded-full bg-black/50 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/70 md:right-6 md:top-6"
          >
            <X size={26} />
          </button>

          <div className="flex flex-1 flex-col lg:h-full lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
            <div className="relative h-[52vh] w-full shrink-0 overflow-hidden bg-black sm:h-[58vh] lg:h-full lg:min-h-0">
              <img
                src={profile.photos[currentPhotoIndex]}
                alt={profile.name}
                className="h-full w-full object-contain bg-black"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/5 to-black/70" />

              <button
                onClick={() => setFullscreenPhoto(profile.photos[currentPhotoIndex])}
                className="absolute right-16 top-4 z-[80] rounded-full bg-black/50 p-2 text-white backdrop-blur-md transition-colors hover:bg-black/70 md:right-20 md:top-6"
              >
                <Maximize2 size={22} />
              </button>

              <div className="absolute left-4 right-20 top-4 z-[80] flex gap-1 md:left-6 md:top-6">
                {profile.photos.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 flex-1 rounded-full transition-colors ${idx === currentPhotoIndex ? "bg-white" : "bg-white/30"}`}
                  />
                ))}
              </div>

              <div className="absolute inset-0 z-[70] flex">
                <div className="h-full w-1/2" onClick={prevPhoto} />
                <div className="h-full w-1/2" onClick={nextPhoto} />
              </div>

              <div className="absolute bottom-0 left-0 right-0 z-[80] p-6 md:p-8">
                <div className="mb-2 flex items-end justify-between">
                  <h1 className="flex items-baseline gap-2 font-serif text-5xl font-bold md:text-6xl">
                    {profile.name} <span className="text-2xl font-normal text-zinc-300">{profile.age}</span>
                  </h1>
                  <div className={`flex items-center gap-1 rounded-full border border-crimson/50 bg-black/50 px-3 py-1 backdrop-blur-md ${isUnlocked ? "" : "blur-sm"}`}>
                    <span className="text-sm font-bold text-crimson">{profile.compatibility}%</span>
                    <span className="font-mono text-xs text-white/80">MATCH</span>
                  </div>
                </div>
                <div className={`flex items-center gap-2 font-mono text-sm text-zinc-300 ${isUnlocked ? "" : "blur-sm"}`}>
                  <MapPin size={16} className="text-crimson" />
                  <span>{profile.distance} km away</span>
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col bg-zinc-950/90">
              <div className="flex-1 space-y-8 overflow-y-auto px-6 py-7 pb-28 sm:px-8 lg:px-10 lg:py-9 lg:pb-8">
                <div className={`${isUnlocked ? "" : "select-none blur-sm"}`}>
                  <h3 className="mb-3 font-serif text-2xl font-bold text-crimson">About Me</h3>
                  <p className="text-lg leading-relaxed text-zinc-300">{profile.bio}</p>
                </div>

                {isUnlocked && profile.unlockedVerification?.instagramLink && (
                  <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    Instagram: {profile.unlockedVerification.instagramLink}
                  </div>
                )}

                <div className={`flex flex-wrap gap-4 ${isUnlocked ? "" : "select-none blur-sm"}`}>
                  <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-zinc-400">
                    <Briefcase size={18} />
                    <span>{profile.job}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-zinc-400">
                    <GraduationCap size={18} />
                    <span>{profile.education}</span>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-serif text-2xl font-bold text-crimson">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest) => (
                      <span
                        key={interest}
                        className="rounded-full border border-zinc-800 bg-zinc-900 px-4 py-2 text-zinc-300 transition-colors hover:border-crimson/50 hover:text-crimson"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
                  {profile.photos.slice(1).map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFullscreenPhoto(photo)}
                      className="h-48 w-full overflow-hidden rounded-xl md:h-52"
                    >
                      <img
                        src={photo}
                        alt="Gallery"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="hidden border-t border-white/10 bg-zinc-950/80 p-5 lg:block">
                <div className="flex items-center justify-center gap-3 rounded-3xl border border-white/10 bg-black/40 p-3 backdrop-blur-xl">
                  {actionControls}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-[140] bg-gradient-to-t from-black via-black/90 to-transparent p-6 lg:hidden">
        <div className="mx-auto flex w-full max-w-xl items-center justify-center gap-3 rounded-3xl border border-white/10 bg-zinc-950/80 p-3 backdrop-blur-xl">
          {actionControls}
        </div>
      </div>

      {fullscreenPhoto && (
        <div
          onClick={() => setFullscreenPhoto(null)}
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
        >
          <button
            onClick={() => setFullscreenPhoto(null)}
            className="absolute top-5 right-5 z-[210] p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <X size={28} />
          </button>
          <img
            src={fullscreenPhoto}
            alt="Full view"
            className="max-h-[96vh] max-w-[96vw] object-contain rounded-lg"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </motion.div>,
    document.body
  );
}
