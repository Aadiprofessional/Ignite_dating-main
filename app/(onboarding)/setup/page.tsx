'use client';

import React from 'react';
import { OnboardingProvider, useOnboarding } from '@/context/OnboardingContext';
import { motion, AnimatePresence } from 'framer-motion';
import Step1Photos from '@/components/onboarding/Step1Photos';
import Step2BasicInfo from '@/components/onboarding/Step2BasicInfo';
import Step3About from '@/components/onboarding/Step3About';
import Step4Interests from '@/components/onboarding/Step4Interests';
import Step5Goals from '@/components/onboarding/Step5Goals';
import Step6Preferences from '@/components/onboarding/Step6Preferences';
import StepFinalPreview from '@/components/onboarding/StepFinalPreview';
import { Flame } from 'lucide-react';

function SetupWizard() {
  const { currentStep, totalSteps } = useOnboarding();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Photos />;
      case 2:
        return <Step2BasicInfo />;
      case 3:
        return <Step3About />;
      case 4:
        return <Step4Interests />;
      case 5:
        return <Step5Goals />;
      case 6:
        return <Step6Preferences />;
      case 7:
        return <StepFinalPreview />;
      default:
        return <Step1Photos />;
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-[#080808] text-offwhite flex flex-col font-sans selection:bg-crimson/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#080808]/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-crimson">
            <Flame size={24} fill="currentColor" />
            <span className="font-serif font-bold text-xl tracking-wide text-white">IGNITE</span>
          </div>
          <div className="font-mono text-sm text-zinc-500">
            {currentStep <= totalSteps ? `Step ${currentStep} of ${totalSteps}` : 'Preview'}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-zinc-900 w-full">
          <motion.div
            className="h-full bg-crimson shadow-[0_0_10px_#E8192C]"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-12 px-6 flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-1 flex flex-col"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function SetupPage() {
  return (
    <OnboardingProvider>
      <SetupWizard />
    </OnboardingProvider>
  );
}
