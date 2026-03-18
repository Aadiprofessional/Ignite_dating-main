'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { OnboardingData, useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Goal = {
  id: OnboardingData['relationshipGoal'];
  emoji: string;
  label: string;
  desc: string;
};

const goals: Goal[] = [
  { id: 'Casual', emoji: '🔥', label: 'Casual', desc: 'Keep it fun' },
  { id: 'Serious', emoji: '💍', label: 'Serious', desc: 'Looking for the one' },
  { id: 'Friends', emoji: '🤝', label: 'Friends', desc: "Let's vibe first" },
  { id: 'Open', emoji: '✨', label: 'Open', desc: 'No labels' },
];

export default function Step5Goals() {
  const { data, updateData, nextStep, prevStep } = useOnboarding();

  return (
    <div className="flex flex-col h-full max-w-xl mx-auto w-full">
      <div className="mb-8 text-center">
        <h2 className="text-4xl font-serif font-bold text-offwhite mb-2">Relationship Goals</h2>
        <p className="text-zinc-400 font-mono text-sm">What are you looking for right now?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {goals.map((goal) => {
          const isSelected = data.relationshipGoal === goal.id;
          return (
            <motion.div
              key={goal.id}
              onClick={() => updateData({ relationshipGoal: goal.id })}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              animate={{
                scale: isSelected ? 1.05 : 1,
                borderColor: isSelected ? '#E8192C' : '#27272a',
                boxShadow: isSelected ? '0 0 20px rgba(232, 25, 44, 0.4)' : 'none',
              }}
              className={cn(
                "cursor-pointer rounded-2xl border bg-zinc-900/40 p-6 flex flex-col items-center justify-center text-center gap-3 transition-colors aspect-square",
                isSelected ? "bg-zinc-900/80" : "hover:bg-zinc-900/60"
              )}
            >
              <span className="text-4xl mb-2">{goal.emoji}</span>
              <h3 className={cn(
                "text-xl font-bold font-serif",
                isSelected ? "text-crimson" : "text-white"
              )}>
                {goal.label}
              </h3>
              <p className="text-zinc-400 text-sm font-mono">{goal.desc}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-auto flex justify-between pt-8">
        <Button
          variant="ghost"
          onClick={prevStep}
          className="text-zinc-400 hover:text-white font-mono"
        >
          Back
        </Button>
        <Button
          onClick={nextStep}
          disabled={!data.relationshipGoal}
          className="bg-crimson hover:bg-crimson/90 text-white font-mono px-8"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
