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
import { Flame, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useRouter, useSearchParams } from 'next/navigation';

function SetupWizard() {
  const { currentStep, totalSteps, data, updateData } = useOnboarding();
  const { currentUser } = useStore();

  React.useEffect(() => {
    if (!currentUser) return;
    if (data.firstName.trim() || data.lastName.trim()) return;
    const [firstName = '', ...rest] = currentUser.name.split(' ');
    updateData({
      firstName,
      lastName: rest.join(' '),
    });
  }, [currentUser, data.firstName, data.lastName, updateData]);

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, accountState, onboardingStatus, hydrateFromApi, refreshOnboardingStatus, logout } = useStore();
  const [isLoading, setIsLoading] = React.useState(true);
  const [showWizardAfterRejection, setShowWizardAfterRejection] = React.useState(false);

  React.useEffect(() => {
    if (!session?.accessToken) {
      router.replace('/login');
      return;
    }
    let active = true;
    const run = async () => {
      try {
        await hydrateFromApi();
        await refreshOnboardingStatus();
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [session?.accessToken, hydrateFromApi, refreshOnboardingStatus, router]);

  const verificationStatus =
    onboardingStatus?.verification?.status || accountState?.verification_status || 'pending_submission';
  const reviewRequested = searchParams.get('review') === '1';
  const rejectionReason = onboardingStatus?.verification?.rejection_reason || null;
  const canUseApp = Boolean(accountState?.can_use_app || verificationStatus === 'approved');

  React.useEffect(() => {
    if (canUseApp) {
      router.replace('/home');
    }
  }, [canUseApp, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading onboarding status...</span>
        </div>
      </div>
    );
  }

  if (!showWizardAfterRejection && (verificationStatus === 'pending' || (reviewRequested && verificationStatus !== 'rejected'))) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center px-6">
        <div className="max-w-lg w-full border border-zinc-800 rounded-2xl p-8 bg-zinc-900/40 text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-crimson/20 flex items-center justify-center">
            <Flame className="text-crimson" />
          </div>
          <h1 className="text-2xl font-serif font-bold mb-2">Verification in review</h1>
          <p className="text-zinc-400 mb-6">Your request is submitted. Please wait until admin approval to access the app.</p>
          <button
            onClick={() => void refreshOnboardingStatus()}
            className="w-full rounded-xl bg-crimson px-5 py-3 text-white font-medium hover:bg-crimson/90 transition-colors"
          >
            Refresh Status
          </button>
          <button
            onClick={() => {
              logout();
              router.replace('/login');
            }}
            className="w-full mt-3 rounded-xl border border-zinc-700 px-5 py-3 text-zinc-200 font-medium hover:border-zinc-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'rejected' && !showWizardAfterRejection) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center px-6">
        <div className="max-w-lg w-full border border-zinc-800 rounded-2xl p-8 bg-zinc-900/40 text-center">
          <h1 className="text-2xl font-serif font-bold mb-2">Verification rejected</h1>
          <p className="text-zinc-400 mb-2">Please resubmit your details to continue.</p>
          {rejectionReason ? <p className="text-sm text-crimson mb-6">{rejectionReason}</p> : null}
          <button
            onClick={() => setShowWizardAfterRejection(true)}
            className="w-full rounded-xl bg-crimson px-5 py-3 text-white font-medium hover:bg-crimson/90 transition-colors"
          >
            Resubmit Verification
          </button>
          <button
            onClick={() => {
              logout();
              router.replace('/login');
            }}
            className="w-full mt-3 rounded-xl border border-zinc-700 px-5 py-3 text-zinc-200 font-medium hover:border-zinc-500 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <OnboardingProvider>
      <SetupWizard />
    </OnboardingProvider>
  );
}
