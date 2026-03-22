"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const session = useStore((state) => state.session);
  const [isHydrated, setIsHydrated] = useState(useStore.persist.hasHydrated());

  useEffect(() => {
    const unsubscribeHydrate = useStore.persist.onHydrate(() => setIsHydrated(false));
    const unsubscribeFinishHydration = useStore.persist.onFinishHydration(() => setIsHydrated(true));
    setIsHydrated(useStore.persist.hasHydrated());
    return () => {
      unsubscribeHydrate();
      unsubscribeFinishHydration();
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!session?.accessToken) {
      router.replace("/login");
    }
  }, [isHydrated, session?.accessToken, router]);

  if (!isHydrated || !session?.accessToken) {
    return (
      <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
