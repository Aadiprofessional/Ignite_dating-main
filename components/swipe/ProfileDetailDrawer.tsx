"use client";

import { Profile } from "@/lib/mockProfiles";
import { motion } from "framer-motion";
import { ChevronDown, MapPin, Briefcase, GraduationCap, X, Heart } from "lucide-react";
import { useState } from "react";

interface ProfileDetailDrawerProps {
  profile: Profile;
  onClose: () => void;
  onLike: () => void;
  onPass: () => void;
}

export function ProfileDetailDrawer({ profile, onClose, onLike, onPass }: ProfileDetailDrawerProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

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

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-40 bg-black text-white flex flex-col h-full overflow-y-auto pb-24"
    >
      {/* Header Image Carousel */}
      <div className="relative w-full h-[60vh] shrink-0">
        <img
          src={profile.photos[currentPhotoIndex]}
          alt={profile.name}
          className="w-full h-full object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors z-50"
        >
          <ChevronDown size={32} />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute top-4 left-4 right-16 flex gap-1 z-50">
          {profile.photos.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1 flex-1 rounded-full transition-colors ${idx === currentPhotoIndex ? "bg-white" : "bg-white/30"}`}
            />
          ))}
        </div>

        {/* Tap areas for carousel */}
        <div className="absolute inset-0 flex">
          <div className="w-1/2 h-full" onClick={prevPhoto} />
          <div className="w-1/2 h-full" onClick={nextPhoto} />
        </div>

        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-end justify-between mb-2">
            <div>
              <h1 className="font-serif font-bold text-5xl flex items-baseline gap-2">
                {profile.name} <span className="text-2xl font-normal text-zinc-300">{profile.age}</span>
              </h1>
            </div>
            <div className="bg-black/40 backdrop-blur-md border border-crimson/50 px-3 py-1 rounded-full flex items-center gap-1">
               <span className="text-crimson font-bold text-sm">{profile.compatibility}%</span>
               <span className="text-xs text-white/80 font-mono">MATCH</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-zinc-300 font-mono text-sm">
            <MapPin size={16} className="text-crimson" />
            <span>{profile.distance} km away</span>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="px-6 py-8 space-y-8">
        {/* Bio */}
        <div>
          <h3 className="font-serif font-bold text-2xl mb-3 text-crimson">About Me</h3>
          <p className="text-zinc-300 leading-relaxed text-lg">{profile.bio}</p>
        </div>

        {/* Basics */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-zinc-400 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
            <Briefcase size={18} />
            <span>{profile.job}</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
            <GraduationCap size={18} />
            <span>{profile.education}</span>
          </div>
        </div>

        {/* Interests */}
        <div>
          <h3 className="font-serif font-bold text-2xl mb-3 text-crimson">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <span
                key={interest}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300 hover:border-crimson/50 hover:text-crimson transition-colors"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* More Photos */}
        <div className="grid grid-cols-2 gap-2">
          {profile.photos.slice(1).map((photo, idx) => (
            <img 
              key={idx}
              src={photo} 
              alt="Gallery" 
              className="w-full h-64 object-cover rounded-xl"
            />
          ))}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-center gap-8 z-50">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onPass}
          className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-red-500 shadow-xl"
        >
          <X size={32} strokeWidth={3} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onLike}
          className="w-20 h-20 rounded-full bg-crimson flex items-center justify-center text-white shadow-xl shadow-crimson/20"
        >
          <Heart size={40} fill="currentColor" strokeWidth={0} />
        </motion.button>
      </div>
    </motion.div>
  );
}
