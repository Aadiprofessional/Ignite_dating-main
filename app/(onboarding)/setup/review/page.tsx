'use client';

import React from 'react';
import { Flame, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function ReviewPendingPage() {
  const router = useRouter();
  const { session, accountState, onboardingStatus, hydrateFromApi, refreshOnboardingStatus, logout } = useStore();
  const [isLoading, setIsLoading] = React.useState(true);

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
  const canUseApp = Boolean(accountState?.can_use_app || verificationStatus === 'approved');

  React.useEffect(() => {
    if (canUseApp) {
      router.replace('/home');
      return;
    }
    if (verificationStatus === 'rejected') {
      router.replace('/setup');
    }
  }, [canUseApp, verificationStatus, router]);

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
