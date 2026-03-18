'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = [
  { name: 'Music', tags: ['Rock', 'Hip-hop', 'EDM', 'Jazz', 'K-pop', 'Indie'] },
  { name: 'Food & Drink', tags: ['Foodie', 'Coffee', 'Cocktails', 'Cooking', 'Vegan', 'Street Food'] },
  { name: 'Fitness', tags: ['Gym', 'Yoga', 'Running', 'Hiking', 'Sports', 'Cycling'] },
  { name: 'Vibes', tags: ['Night Owl', 'Early Bird', 'Homebody', 'Adventurer', 'Empath', 'Creative'] },
  { name: 'Travel', tags: ['Backpacking', 'Luxury Travel', 'Road Trips', 'Beach', 'Mountains', 'City Explorer'] },
  { name: 'Gaming', tags: ['PC', 'Console', 'Mobile', 'Esports', 'Board Games', 'Retro'] },
  { name: 'Arts', tags: ['Photography', 'Film', 'Design', 'Writing', 'Theater', 'Museums'] },
  { name: 'Tech', tags: ['AI', 'Startups', 'Coding', 'Crypto', 'Gadgets', 'Science'] },
];

export default function Step4Interests() {
  const { data, updateData, nextStep, prevStep } = useOnboarding();

  const toggleInterest = (tag: string) => {
    if (data.interests.includes(tag)) {
      updateData({ interests: data.interests.filter((i) => i !== tag) });
    } else {
      if (data.interests.length < 10) {
        updateData({ interests: [...data.interests, tag] });
      }
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif font-bold text-offwhite mb-2">What are you into?</h2>
          <p className="text-zinc-400 font-mono text-sm">Pick at least 3 to help us find your vibe.</p>
        </div>
        <div className={cn(
          "text-sm font-mono px-3 py-1 rounded-full border transition-colors",
          data.interests.length >= 3 
            ? "border-crimson text-crimson bg-crimson/10" 
            : "border-zinc-700 text-zinc-500"
        )}>
          {data.interests.length}/10 selected
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-8 custom-scrollbar">
        {categories.map((category) => (
          <div key={category.name} className="space-y-3">
            <h3 className="text-zinc-500 font-mono text-xs uppercase tracking-wider pl-1">
              {category.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.tags.map((tag) => {
                const isSelected = data.interests.includes(tag);
                return (
                  <motion.button
                    key={tag}
                    onClick={() => toggleInterest(tag)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      backgroundColor: isSelected ? '#E8192C' : 'rgba(24, 24, 27, 0.5)',
                      borderColor: isSelected ? '#E8192C' : '#27272a',
                      color: isSelected ? '#ffffff' : '#d4d4d8',
                    }}
                    className={cn(
                      "px-4 py-2 rounded-full border text-sm font-medium transition-colors flex items-center gap-2",
                      isSelected && "shadow-[0_0_15px_rgba(232,25,44,0.4)]"
                    )}
                  >
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                      >
                        <Check size={14} strokeWidth={3} />
                      </motion.span>
                    )}
                    {tag}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between pt-4 border-t border-zinc-900">
        <Button
          variant="ghost"
          onClick={prevStep}
          className="text-zinc-400 hover:text-white font-mono"
        >
          Back
        </Button>
        <Button
          onClick={nextStep}
          disabled={data.interests.length < 3}
          className="bg-crimson hover:bg-crimson/90 text-white font-mono px-8"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
