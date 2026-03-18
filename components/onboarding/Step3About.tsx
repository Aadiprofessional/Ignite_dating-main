'use client';

import React, { useState } from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Step3About() {
  const { data, updateData, nextStep, prevStep } = useOnboarding();
  const [showTips, setShowTips] = useState(false);

  const maxLength = 300;
  const currentLength = data.bio.length;
  const isNearLimit = currentLength >= maxLength * 0.8;

  const tips = [
    "What's a non-negotiable for you?",
    "Your ideal Sunday morning?",
    "A skill you're currently learning?",
    "The most spontaneous thing you've done?",
  ];

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full">
      <div className="mb-6">
        <h2 className="text-4xl font-serif font-bold text-offwhite mb-2">About You</h2>
        <p className="text-zinc-400 font-mono text-sm">Tell us what makes you tick.</p>
      </div>

      <div className="space-y-6">
        {/* Bio Section */}
        <div className="space-y-2">
          <Label className="text-zinc-400 font-mono text-xs uppercase flex justify-between">
            <span>Bio</span>
            <button
              onClick={() => setShowTips(!showTips)}
              className="flex items-center gap-1 text-crimson hover:text-crimson/80 transition-colors"
            >
              <Lightbulb size={14} />
              <span className="text-[10px]">Writing Tips</span>
              {showTips ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </Label>

          <AnimatePresence>
            {showTips && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-2"
              >
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-400 italic">
                  <p className="mb-1 font-semibold text-zinc-300">Try answering:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <textarea
              value={data.bio}
              onChange={(e) => updateData({ bio: e.target.value.slice(0, maxLength) })}
              className="w-full h-32 bg-black/40 backdrop-blur-md border border-zinc-700 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-crimson transition-colors resize-none"
              placeholder="I'm a designer who loves coffee and..."
            />
            <div className={cn(
              "absolute bottom-3 right-3 text-xs font-mono transition-colors",
              isNearLimit ? "text-crimson" : "text-zinc-500"
            )}>
              {currentLength}/{maxLength}
            </div>
          </div>
        </div>

        {/* Work & Education */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-400 font-mono text-xs uppercase">Occupation</Label>
            <Input
              value={data.occupation}
              onChange={(e) => updateData({ occupation: e.target.value })}
              className="bg-transparent border-zinc-700 focus:border-crimson text-white"
              placeholder="Product Designer"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-400 font-mono text-xs uppercase">Education</Label>
            <Input
              value={data.education}
              onChange={(e) => updateData({ education: e.target.value })}
              className="bg-transparent border-zinc-700 focus:border-crimson text-white"
              placeholder="University of Design"
            />
          </div>
        </div>
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
          disabled={!data.bio || !data.occupation}
          className="bg-crimson hover:bg-crimson/90 text-white font-mono px-8"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
