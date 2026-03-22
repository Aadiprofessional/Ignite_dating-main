'use client';

import React from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useStore } from '@/lib/store';
import { ApiError } from '@/lib/api';
import { useRouter } from 'next/navigation';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PHONE_NUMBER_REGEX = /^\+[1-9]\d{7,14}$/;

export default function StepFinalPreview() {
  const router = useRouter();
  const { submitOnboardingAndVerification, onboardingStatus, accountState, searchUniversities } = useStore();
  const { data, updateData, prevStep } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const verificationStatus =
    onboardingStatus?.verification?.status || accountState?.verification_status || 'pending_submission';

  const normalizeErrorMessage = (message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return 'Failed to submit onboarding';
    if (trimmed.toLowerCase().includes('please select your university')) {
      return 'Failed to submit onboarding';
    }
    if (trimmed.length % 2 === 0) {
      const mid = trimmed.length / 2;
      const firstHalf = trimmed.slice(0, mid);
      const secondHalf = trimmed.slice(mid);
      if (firstHalf === secondHalf) return firstHalf;
    }
    return trimmed;
  };

  const calculateAge = (dob: string) => {
    if (!dob) return '';
    const birthday = new Date(dob);
    const ageDifMs = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleGoLive = async () => {
    if (verificationStatus === 'pending') {
      router.replace('/setup/review');
      return;
    }
    let resolvedUniversityId = UUID_REGEX.test(data.universityId.trim()) ? data.universityId.trim() : '';
    const selectedUniversityName = (data.universityName || data.universityQuery).trim();
    if (!resolvedUniversityId && selectedUniversityName) {
      const [directMatches, hkMatches] = await Promise.all([
        searchUniversities(selectedUniversityName),
        searchUniversities('hong kong'),
      ]);
      const merged = [...directMatches, ...hkMatches];
      const selectedLower = selectedUniversityName.toLowerCase();
      const matchedUniversity =
        merged.find((university) => university.name.trim().toLowerCase() === selectedLower && university.id) ||
        merged.find((university) => university.name.trim().toLowerCase().includes(selectedLower) && university.id);
      if (matchedUniversity?.id && UUID_REGEX.test(matchedUniversity.id)) {
        resolvedUniversityId = matchedUniversity.id;
        updateData({
          universityId: matchedUniversity.id,
          universityName: matchedUniversity.name,
          universityQuery: matchedUniversity.name,
        });
      }
    }
    if (!/^https?:\/\//.test(data.verificationDocumentUrl)) {
      setErrorMessage('Please upload your verification document.');
      return;
    }
    if (!PHONE_NUMBER_REGEX.test(data.phoneNumber.trim())) {
      setErrorMessage('Please enter a valid phone number (e.g. +85291234567).');
      return;
    }
    if (!resolvedUniversityId && !selectedUniversityName) {
      setErrorMessage('Please enter your university name.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await submitOnboardingAndVerification({
        first_name: data.firstName,
        last_name: data.lastName,
        birth_date: data.birthday,
        gender: data.gender,
        pronouns: data.pronouns,
        height_cm: data.height,
        bio: data.bio,
        occupation: data.occupation,
        education: data.education,
        interests: data.interests,
        relationship_goals: [data.relationshipGoal || 'Serious'],
        interested_in: data.interestedIn,
        min_age: data.ageRange[0],
        max_age: data.ageRange[1],
        max_distance_km: data.distance,
        show_me_on_ignite: data.showOnIgnite,
        university_id: resolvedUniversityId,
        custom_university_name: resolvedUniversityId ? '' : selectedUniversityName,
        document_url: data.verificationDocumentUrl,
        phone_number: data.phoneNumber.trim(),
        photo_urls: data.photos.map((photo) => photo.url).filter(Boolean),
      });
      router.replace('/setup/review');
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('Onboarding submit failed', {
          status: error.status,
          payload: error.payload,
          message: error.message,
        });
      } else {
        console.error('Onboarding submit failed', error);
      }
      const rawMessage = error instanceof Error ? error.message : 'Failed to submit onboarding';
      setErrorMessage(normalizeErrorMessage(rawMessage));
    } finally {
      setIsSubmitting(false);
    }
  };

  const mainPhoto = data.photos[0]?.url || 'https://picsum.photos/seed/ignite-onboarding/400/600';

  return (
    <div className="flex flex-col h-full items-center justify-center max-w-sm mx-auto w-full py-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-serif font-bold text-offwhite mb-1">Preview Profile</h2>
        <p className="text-zinc-400 font-mono text-xs">This is how you will appear to others.</p>
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
        <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-200">
          <p className="text-xs text-zinc-400 mb-1">University</p>
          <p className="text-sm">{data.universityName || 'Not selected'}</p>
        </div>
        <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-200">
          <p className="text-xs text-zinc-400 mb-1">Verification Document</p>
          <p className="text-sm">{data.verificationDocumentName || 'No file uploaded'}</p>
        </div>
        <div className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-zinc-200">
          <p className="text-xs text-zinc-400 mb-1">Phone Number</p>
          <p className="text-sm">{data.phoneNumber || 'Not provided'}</p>
        </div>
        {errorMessage ? <p className="text-sm text-crimson">{errorMessage}</p> : null}
        <Button
          onClick={() => void handleGoLive()}
          disabled={isSubmitting || !data.phoneNumber.trim()}
          className="w-full bg-crimson hover:bg-crimson/90 text-white font-mono h-12 text-lg shadow-[0_0_20px_rgba(232,25,44,0.4)]"
        >
          {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
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
