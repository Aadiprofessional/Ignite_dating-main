"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from "framer-motion";
import { Profile } from "@/lib/mockProfiles";
import { ProfileCard } from "./ProfileCard";
import { ActionButtons } from "@/components/swipe/ActionButtons";
import { MatchModal } from "@/components/swipe/MatchModal";
import { ProfileDetailDrawer } from "@/components/swipe/ProfileDetailDrawer";
import { useStore } from "@/lib/store";

export function CardStack() {
  const { discoverProfiles, refreshDiscover, sendSwipe } = useStore();
  const [cards, setCards] = useState<Profile[]>(discoverProfiles);
  const [swipedCards, setSwipedCards] = useState<Profile[]>([]); // To support rewind
  const [matchProfile, setMatchProfile] = useState<Profile | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | "up" | null>(null);

  useEffect(() => {
    if (discoverProfiles.length > 0) {
      setCards(discoverProfiles);
      return;
    }
    void refreshDiscover({ limit: 24 });
  }, [discoverProfiles, refreshDiscover]);

  // Motion Values for the top card
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Transforms
  const rotate = useTransform(x, [-300, 300], [-30, 30]);
  
  // Background Flash Opacity
  const crimsonFlashOpacity = useTransform(x, [50, 150], [0, 0.3]);
  const whiteFlashOpacity = useTransform(x, [-150, -50], [0.15, 0]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const horizontalThreshold = 140;
    const verticalThreshold = 150;
    const absX = Math.abs(info.offset.x);
    const absY = Math.abs(info.offset.y);
    if (absY > absX && info.offset.y < -verticalThreshold) {
      void triggerSuperLike();
    } else if (info.offset.x > horizontalThreshold) {
      void triggerLike();
    } else if (info.offset.x < -horizontalThreshold) {
      void triggerPass();
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const triggerLike = async () => {
    const currentCard = cards[0];
    if (!currentCard) return;

    // Check for match (40% chance)
    if (Math.random() < 0.4) {
      setMatchProfile(currentCard);
    }

    setExitDirection("right");
    setTimeout(() => removeCard(currentCard), 50); // Small delay to ensure state update
    await sendSwipe(currentCard.id, "like");
  };

  const triggerPass = async () => {
    const currentCard = cards[0];
    if (!currentCard) return;
    setExitDirection("left");
    setTimeout(() => removeCard(currentCard), 50);
    await sendSwipe(currentCard.id, "pass");
  };

  const triggerSuperLike = async () => {
    const currentCard = cards[0];
    if (!currentCard) return;
    setExitDirection("up");
    setTimeout(() => removeCard(currentCard), 50);
    await sendSwipe(currentCard.id, "superlike");
  };

  const removeCard = (card: Profile) => {
    setSwipedCards((previous) => [...previous, card]);
    setCards((previous) => previous.slice(1));
    x.set(0);
    y.set(0);
  };

  const handleRewind = () => {
    setSwipedCards((previous) => {
      if (!previous.length) return previous;
      const lastSwiped = previous[previous.length - 1];
      setCards((current) => [lastSwiped, ...current]);
      setExitDirection(null);
      return previous.slice(0, -1);
    });
  };

  // Action Button Handlers
  const onSwipeLeft = () => void triggerPass();
  const onSwipeRight = () => void triggerLike();
  const onSuperLike = () => void triggerSuperLike();

  // Animation Variants
  const cardVariants = {
    initial: (index: number) => ({
      scale: 0.9 - index * 0.05,
      y: index * 20,
      opacity: index === 0 ? 1 : 0.5
    }),
    animate: (index: number) => ({
      scale: 1 - index * 0.05,
      y: index * 10,
      opacity: index === 0 ? 1 : (index > 2 ? 0 : 0.5),
      transition: { duration: 0.3 }
    }),
    exit: (direction: string | null) => {
      if (direction === "left") return { x: -1000, rotate: -30, opacity: 0, transition: { duration: 0.3 } };
      if (direction === "right") return { x: 1000, rotate: 30, opacity: 0, transition: { duration: 0.3 } };
      if (direction === "up") return { y: -1000, opacity: 0, transition: { duration: 0.3 } };
      return { opacity: 0, scale: 0.8, transition: { duration: 0.2 } };
    }
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6">
        <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
             className="text-4xl"
          >
            🔥
          </motion.div>
        </div>
        <h2 className="font-serif text-2xl text-white mb-2">No more profiles</h2>
        <p className="font-mono text-zinc-500 text-sm">Check back later for more matches.</p>
        <button 
          onClick={() => {
            void refreshDiscover({ limit: 24 });
          }} 
          className="mt-6 px-6 py-2 bg-crimson text-white font-bold rounded-full hover:bg-crimson/80 transition-colors"
        >
          Refresh Profiles
        </button>
      </div>
    );
  }

  // Visible cards (max 3)
  const visibleCards = cards.slice(0, 3);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Background Flashes */}
      <motion.div 
        style={{ opacity: crimsonFlashOpacity }}
        className="fixed inset-0 bg-crimson pointer-events-none z-0 mix-blend-overlay"
      />
      <motion.div 
        style={{ opacity: whiteFlashOpacity }}
        className="fixed inset-0 bg-white pointer-events-none z-0 mix-blend-overlay"
      />

      {/* Card Stack */}
      <div className="relative z-10 h-[66vh] w-full max-w-[380px] md:max-w-[420px] lg:h-[70vh] lg:max-w-[460px] xl:max-w-[520px]">
        <AnimatePresence custom={exitDirection}>
          {visibleCards.map((profile, index) => {
            const isTop = index === 0;
            return (
              <motion.div
                key={profile.id}
                custom={exitDirection}
                style={isTop ? { x, y, rotate, zIndex: 50 } : { zIndex: 50 - index * 10 }}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                drag={isTop ? true : false}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.6}
                dragMomentum={false}
                onDragEnd={isTop ? handleDragEnd : undefined}
                className="absolute inset-0"
                onClick={() => {
                   if(isTop) {
                     setActiveProfile(profile);
                     setIsDetailOpen(true);
                   }
                }}
              >
                <ProfileCard 
                  profile={profile} 
                  drag={isTop} 
                  x={isTop ? x : undefined}
                  y={isTop ? y : undefined}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="z-20 mt-8 lg:mt-10">
        <ActionButtons 
          onRewind={handleRewind}
          onPass={onSwipeLeft}
          onLike={onSwipeRight}
          onSuperLike={onSuperLike}
          canRewind={swipedCards.length > 0}
        />
      </div>

      {/* Match Modal */}
      <AnimatePresence>
        {matchProfile && (
          <MatchModal 
            profile={matchProfile} 
            onClose={() => setMatchProfile(null)} 
            onChat={() => {
              // Navigate to chat
              console.log("Chat with", matchProfile.name);
              setMatchProfile(null);
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Profile Detail Drawer */}
      <AnimatePresence>
        {isDetailOpen && activeProfile && (
           <ProfileDetailDrawer 
             profile={activeProfile} 
             onClose={() => setIsDetailOpen(false)}
             onLike={() => {
               void triggerLike();
               setIsDetailOpen(false);
             }}
             onPass={() => {
               void triggerPass();
               setIsDetailOpen(false);
             }}
           />
        )}
      </AnimatePresence>
    </div>
  );
}
