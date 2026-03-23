'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Photo = {
  id: string;
  url: string;
  file?: File;
};

export type OnboardingData = {
  photos: Photo[];
  firstName: string;
  lastName: string;
  nickName: string;
  birthday: string;
  passingYear: string;
  gender: string;
  pronouns: string;
  height: number;
  heightUnit: 'cm' | 'ft';
  bio: string;
  occupation: string;
  education: string;
  universityQuery: string;
  universityId: string;
  universityName: string;
  phoneNumber: string;
  instagramLink: string;
  wechatLink: string;
  xiaohongshuLink: string;
  verificationDocumentUrl: string;
  verificationDocumentName: string;
  interests: string[];
  relationshipGoal: 'Casual' | 'Serious' | 'Friends' | 'Open' | '';
  interestedIn: string[];
  ageRange: [number, number];
  distance: number;
  distanceUnit: 'km' | 'mi';
  showOnIgnite: boolean;
};

interface OnboardingContextType {
  currentStep: number;
  totalSteps: number;
  data: OnboardingData;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (data: Partial<OnboardingData>) => void;
}

const defaultData: OnboardingData = {
  photos: [],
  firstName: '',
  lastName: '',
  nickName: '',
  birthday: '',
  passingYear: '',
  gender: '',
  pronouns: '',
  height: 170,
  heightUnit: 'cm',
  bio: '',
  occupation: '',
  education: '',
  universityQuery: 'Hong Kong',
  universityId: '',
  universityName: '',
  phoneNumber: '',
  instagramLink: '',
  wechatLink: '',
  xiaohongshuLink: '',
  verificationDocumentUrl: '',
  verificationDocumentName: '',
  interests: [],
  relationshipGoal: '',
  interestedIn: [],
  ageRange: [18, 35],
  distance: 50,
  distanceUnit: 'km',
  showOnIgnite: true,
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(defaultData);
  const totalSteps = 6;

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps + 1));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        totalSteps,
        data,
        setStep,
        nextStep,
        prevStep,
        updateData,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
