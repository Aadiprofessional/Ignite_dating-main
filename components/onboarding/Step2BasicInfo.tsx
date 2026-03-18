'use client';

import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function Step2BasicInfo() {
  const { data, updateData, nextStep, prevStep } = useOnboarding();

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const birthday = new Date(dob);
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const genders = ['Man', 'Woman', 'Non-binary', 'More options...'];

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({ height: parseInt(e.target.value) || 0 });
  };

  const toggleHeightUnit = () => {
    updateData({ heightUnit: data.heightUnit === 'cm' ? 'ft' : 'cm' });
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-4xl font-serif font-bold text-offwhite mb-2">The Basics</h2>
        <p className="text-zinc-400 font-mono text-sm">Let's get to know the real you.</p>
      </div>

      <div className="space-y-6">
        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-zinc-400 font-mono text-xs uppercase">First Name</Label>
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed">
              {data.firstName}
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400 font-mono text-xs uppercase">Last Name</Label>
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed">
              {data.lastName}
            </div>
          </div>
        </div>

        {/* Birthday & Age */}
        <div className="space-y-2">
          <Label className="text-zinc-400 font-mono text-xs uppercase">Birthday</Label>
          <div className="flex gap-4">
            <div className="flex-1 p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed">
              {data.birthday}
            </div>
            <div className="w-20 flex items-center justify-center p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono">
              {calculateAge(data.birthday)}
            </div>
          </div>
        </div>

        {/* Gender */}
        <div className="space-y-3">
          <Label className="text-zinc-400 font-mono text-xs uppercase">I identify as</Label>
          <div className="flex flex-wrap gap-2">
            {genders.map((g) => (
              <button
                key={g}
                onClick={() => updateData({ gender: g })}
                className={cn(
                  "px-4 py-2 rounded-full border transition-all duration-200 text-sm font-medium",
                  data.gender === g
                    ? "bg-crimson border-crimson text-white shadow-[0_0_15px_rgba(232,25,44,0.4)]"
                    : "bg-transparent border-zinc-700 text-zinc-300 hover:border-zinc-500"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Pronouns */}
        <div className="space-y-2">
          <Label className="text-zinc-400 font-mono text-xs uppercase">Pronouns (Optional)</Label>
          <Input
            value={data.pronouns}
            onChange={(e) => updateData({ pronouns: e.target.value })}
            className="bg-transparent border-zinc-700 focus:border-crimson text-white"
            placeholder="e.g. he/him"
          />
        </div>

        {/* Height */}
        <div className="space-y-2">
          <Label className="text-zinc-400 font-mono text-xs uppercase">Height</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={data.height || ''}
              onChange={handleHeightChange}
              className="bg-transparent border-zinc-700 focus:border-crimson text-white"
              placeholder="170"
            />
            <button
              onClick={toggleHeightUnit}
              className="w-16 flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 transition-colors font-mono text-sm"
            >
              {data.heightUnit}
            </button>
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
          disabled={!data.gender || !data.height}
          className="bg-crimson hover:bg-crimson/90 text-white font-mono px-8"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
