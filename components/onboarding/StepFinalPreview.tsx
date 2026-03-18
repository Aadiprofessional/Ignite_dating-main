'use client';

import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Badge } from 'lucide-react'; // Wait, Badge is not an icon usually. I'll use a div.
import { ArrowLeft, Check } from 'lucide-react';

export default function StepFinalPreview() {
  const { data, prevStep } = useOnboarding();

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const birthday = new Date(dob);
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleGoLive = () => {
    // Logic to save profile and redirect
    console.log('Profile saved:', data);
    alert('Welcome to Ignite! 🔥');
    // router.push('/home');
  };

  const mainPhoto = data.photos[0]?.url || 'https://via.placeholder.com/400x600?text=No+Photo';

  return (
    <div className="flex flex-col h-full items-center justify-center max-w-sm mx-auto w-full py-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-serif font-bold text-offwhite mb-1">Preview Profile</h2>
        <p className="text-zinc-400 font-mono text-xs">This is how you'll appear to others.</p>
      </div>

      {/* Profile Card */}
      <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-zinc-900 border border-zinc-800">
        <img
          src={mainPhoto}
          alt="Profile Main"
          className="w-full h-full object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <div className="flex items-end justify-between mb-2">
            <h3 className="text-3xl font-serif font-bold">
              {data.firstName}, {calculateAge(data.birthday)}
            </h3>
            <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-xs font-mono flex items-center gap-1">
              <span>{data.relationshipGoal === 'Casual' ? '🔥' : 
                     data.relationshipGoal === 'Serious' ? '💍' : 
                     data.relationshipGoal === 'Friends' ? '🤝' : '✨'}</span>
              <span>{data.relationshipGoal}</span>
            </div>
          </div>

          <p className="text-sm text-zinc-300 line-clamp-2 mb-4 font-sans">
            {data.bio}
          </p>

          <div className="flex flex-wrap gap-2">
            {data.interests.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 bg-crimson/80 rounded-md text-white"
              >
                {interest}
              </span>
            ))}
            {data.interests.length > 3 && (
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 bg-zinc-800/80 rounded-md text-zinc-300">
                +{data.interests.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="w-full mt-8 space-y-3">
        <Button
          onClick={handleGoLive}
          className="w-full bg-crimson hover:bg-crimson/90 text-white font-mono h-12 text-lg shadow-[0_0_20px_rgba(232,25,44,0.4)]"
        >
          Looks good! Go Live 🔥
        </Button>
        <Button
          variant="ghost"
          onClick={prevStep}
          className="w-full text-zinc-400 hover:text-white font-mono flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Edit Profile
        </Button>
      </div>
    </div>
  );
}
