'use client';

import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function Step6Preferences() {
  const { data, updateData, nextStep, prevStep } = useOnboarding();

  const genders = ['Man', 'Woman', 'Non-binary'];

  const toggleInterestedIn = (gender: string) => {
    if (data.interestedIn.includes(gender)) {
      updateData({ interestedIn: data.interestedIn.filter((g) => g !== gender) });
    } else {
      updateData({ interestedIn: [...data.interestedIn, gender] });
    }
  };

  const handleAgeChange = (value: number[]) => {
    updateData({ ageRange: [value[0], value[1]] });
  };

  const handleDistanceChange = (value: number[]) => {
    updateData({ distance: value[0] });
  };

  const toggleDistanceUnit = () => {
    updateData({ distanceUnit: data.distanceUnit === 'km' ? 'mi' : 'km' });
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full">
      <div className="mb-8">
        <h2 className="text-4xl font-serif font-bold text-offwhite mb-2">Preferences</h2>
        <p className="text-zinc-400 font-mono text-sm">Who do you want to meet?</p>
      </div>

      <div className="space-y-8">
        {/* Gender Preference */}
        <div className="space-y-3">
          <Label className="text-zinc-400 font-mono text-xs uppercase">I'm interested in</Label>
          <div className="flex flex-wrap gap-2">
            {genders.map((g) => (
              <button
                key={g}
                onClick={() => toggleInterestedIn(g)}
                className={cn(
                  "px-4 py-2 rounded-full border transition-all duration-200 text-sm font-medium",
                  data.interestedIn.includes(g)
                    ? "bg-crimson border-crimson text-white shadow-[0_0_15px_rgba(232,25,44,0.4)]"
                    : "bg-transparent border-zinc-700 text-zinc-300 hover:border-zinc-500"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Age Range */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-zinc-400 font-mono text-xs uppercase">Age Range</Label>
            <span className="text-white font-mono text-sm">
              {data.ageRange[0]} - {data.ageRange[1]}
            </span>
          </div>
          <Slider
            defaultValue={[18, 35]}
            value={data.ageRange}
            min={18}
            max={99}
            step={1}
            onValueChange={handleAgeChange}
            className="cursor-pointer"
          />
        </div>

        {/* Distance */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-zinc-400 font-mono text-xs uppercase">Maximum Distance</Label>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono text-sm">
                {data.distance} {data.distanceUnit}
              </span>
              <button
                onClick={toggleDistanceUnit}
                className="text-xs text-zinc-500 hover:text-white transition-colors"
              >
                Switch to {data.distanceUnit === 'km' ? 'mi' : 'km'}
              </button>
            </div>
          </div>
          <Slider
            defaultValue={[50]}
            value={[data.distance]}
            min={1}
            max={100}
            step={1}
            onValueChange={handleDistanceChange}
            className="cursor-pointer"
          />
        </div>

        {/* Show me on Hkmeetup */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-900">
          <div className="space-y-1">
            <Label className="text-white font-medium block">Show me on Hkmeetup</Label>
            <p className="text-xs text-zinc-500">Turn off to hide your profile card stack.</p>
          </div>
          <Switch
            checked={data.showOnHkmeetup}
            onCheckedChange={(checked) => updateData({ showOnHkmeetup: checked })}
          />
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
          disabled={data.interestedIn.length === 0}
          className="bg-crimson hover:bg-crimson/90 text-white font-mono px-8"
        >
          Preview Profile
        </Button>
      </div>
    </div>
  );
}
