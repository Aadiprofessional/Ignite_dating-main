"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from "framer-motion";
import { Profile, mockProfiles } from "@/lib/mockProfiles";
import { ProfileCard } from "./ProfileCard";
import { ActionButtons } from "@/components/swipe/ActionButtons";
import { MatchModal } from "@/components/swipe/MatchModal";
import { ProfileDetailDrawer } from "@/components/swipe/ProfileDetailDrawer";

export function CardStack() {
  const [cards, setCards] = useState<Profile[]>(mockProfiles);
  const [swipedCards, setSwipedCards] = useState<Profile[]>([]); // To support rewind
  const [matchProfile, setMatchProfile] = useState<Profile | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | "up" | null>(null);

  // Motion Values for the top card
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Transforms
  const rotate = useTransform(x, [-300, 300], [-30, 30]);
  const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0, 1, 1, 1, 0]);
  
  // Background Flash Opacity
  const crimsonFlashOpacity = useTransform(x, [50, 150], [0, 0.3]);
  const whiteFlashOpacity = useTransform(x, [-150, -50], [0.15, 0]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 150;
    if (info.offset.x > threshold) {
      triggerLike();
    } else if (info.offset.x < -threshold) {
      triggerPass();
    } else if (info.offset.y < -threshold) {
      triggerSuperLike();
    } else {
      // Reset position
      x.set(0);
      y.set(0);
    }
  };

  const triggerLike = () => {
    const currentCard = cards[0];
    if (!currentCard) return;

    // Check for match (40% chance)
    if (Math.random() < 0.4) {
      setMatchProfile(currentCard);
    }

    setExitDirection("right");
    setTimeout(() => removeCard(currentCard), 50); // Small delay to ensure state update
  };

  const triggerPass = () => {
    const currentCard = cards[0];
    if (!currentCard) return;
    setExitDirection("left");
    setTimeout(() => removeCard(currentCard), 50);
  };

  const triggerSuperLike = () => {
    const currentCard = cards[0];
    if (!currentCard) return;
    setExitDirection("up");
    setTimeout(() => removeCard(currentCard), 50);
  };

  const removeCard = (card: Profile) => {
    // Add to swiped history
    setSwipedCards([...swipedCards, card]);
    
    // Remove from stack
    const newCards = cards.slice(1);
    setCards(newCards);
    
    // Reset motion values for the NEW top card
    x.set(0);
    y.set(0);
  };

  const handleRewind = () => {
    if (swipedCards.length === 0) return;
    const lastSwiped = swipedCards[swipedCards.length - 1];
    setSwipedCards(swipedCards.slice(0, -1));
    setCards([lastSwiped, ...cards]);
    setExitDirection(null);
  };

  // Action Button Handlers
  const onSwipeLeft = () => triggerPass();
  const onSwipeRight = () => triggerLike();
  const onSuperLike = () => triggerSuperLike();

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
          onClick={() => setCards(mockProfiles)} 
          className="mt-6 px-6 py-2 bg-crimson text-white font-bold rounded-full hover:bg-crimson/80 transition-colors"
        >
          Reset Demo
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
      <div className="relative z-10 h-[66vh] w-full max-w-[380px] lg:h-[70vh] lg:max-w-[460px] xl:max-w-[520px]">
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
               triggerLike();
               setIsDetailOpen(false);
             }}
             onPass={() => {
               triggerPass();
               setIsDetailOpen(false);
             }}
           />
        )}
      </AnimatePresence>
    </div>
  );
}
