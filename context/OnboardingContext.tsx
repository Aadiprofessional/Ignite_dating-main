'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Photo = {
  id: string;
  url: string;
};

export type OnboardingData = {
  // Step 1
  photos: Photo[];
  // Step 2
  firstName: string; // Read-only from signup
  lastName: string;  // Read-only from signup
  birthday: string;  // Read-only from signup
  gender: string;
  pronouns: string;
  height: number; // in cm
  heightUnit: 'cm' | 'ft';
  // Step 3
  bio: string;
  occupation: string;
  education: string;
  // Step 4
  interests: string[];
  // Step 5
  relationshipGoal: 'Casual' | 'Serious' | 'Friends' | 'Open' | '';
  // Step 6
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
  firstName: 'Alex', // Mock data for now
  lastName: 'Doe',
  birthday: '1998-05-15',
  gender: '',
  pronouns: '',
  height: 170,
  heightUnit: 'cm',
  bio: '',
  occupation: '',
  education: '',
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
  const totalSteps = 6; // Plus preview step effectively

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
