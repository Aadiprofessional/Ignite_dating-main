"use client";

import { PlanCard } from "@/components/premium/PlanCard";
import { PricingToggle } from "@/components/premium/PricingToggle";
import { motion } from "framer-motion";
import { ChevronLeft, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PremiumPage() {
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"Pro" | "Platinum">("Pro");

  const plans = [
    {
      name: "Free",
      price: "$0/mo",
      features: [
        { text: "Unlimited Swipes", included: false },
        { text: "See Who Liked You", included: false },
        { text: "Rewind Last Swipe", included: false },
        { text: "Incognito Mode", included: false },
        { text: "5 Boosts / month", included: false },
        { text: "Priority in Discovery", included: false },
        { text: "AI Icebreakers", included: false },
        { text: "Read Receipts", included: false },
      ],
      isPopular: false,
      isPlatinum: false,
    },
    {
      name: "Pro",
      price: isYearly ? "$89.99/yr" : "$14.99/mo",
      features: [
        { text: "Unlimited Swipes", included: true },
        { text: "See Who Liked You", included: true },
        { text: "Rewind Last Swipe", included: true },
        { text: "Incognito Mode", included: true },
        { text: "5 Boosts / month", included: true },
        { text: "Priority in Discovery", included: true },
        { text: "AI Icebreakers", included: false },
        { text: "Read Receipts", included: false },
      ],
      isPopular: true,
      isPlatinum: false,
    },
    {
      name: "Platinum",
      price: isYearly ? "$179.99/yr" : "$24.99/mo",
      features: [
        { text: "Unlimited Swipes", included: true },
        { text: "See Who Liked You", included: true },
        { text: "Rewind Last Swipe", included: true },
        { text: "Incognito Mode", included: true },
        { text: "5 Boosts / month", included: true },
        { text: "Priority in Discovery", included: true },
        { text: "AI Icebreakers", included: true },
        { text: "Read Receipts", included: true },
      ],
      isPopular: false,
      isPlatinum: true,
    },
  ];

  const handlePlanSelect = (planName: string) => {
    if (planName === "Free") return;
    setSelectedPlan(planName as "Pro" | "Platinum");
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white relative overflow-hidden pb-20">
      {/* Background Mesh Gradient */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-crimson/20 rounded-full blur-[120px] opacity-30 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-8">
        {/* Nav */}
        <Link href="/home" className="inline-flex items-center text-zinc-400 hover:text-white mb-8 transition-colors group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="ml-1">Back to Swiping</span>
        </Link>

        {/* Hero */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-serif font-bold text-5xl md:text-7xl mb-4 tracking-tight"
          >
            IGNITE <span className="text-transparent bg-clip-text bg-gradient-to-r from-crimson to-yellow-500 animate-pulse">PRO 🔥</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-mono text-xl text-zinc-300 uppercase tracking-widest"
          >
            Turn up the heat
          </motion.p>
        </div>

        {/* Pricing Toggle */}
        <PricingToggle isYearly={isYearly} onToggle={setIsYearly} />

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <PlanCard
                {...plan}
                isSelected={selectedPlan === plan.name}
                onSelect={() => handlePlanSelect(plan.name)}
              />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex justify-center mb-16">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push(`/premium/checkout?plan=${selectedPlan}&billing=${isYearly ? 'yearly' : 'monthly'}`)}
            className="bg-crimson text-white font-bold text-lg px-12 py-4 rounded-full shadow-[0_0_30px_rgba(232,25,44,0.5)] hover:bg-red-600 transition-colors"
          >
            Continue with {selectedPlan}
          </motion.button>
        </div>

        {/* Social Proof */}
        <div className="flex flex-col items-center gap-4 pb-12">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-[#080808] overflow-hidden">
                <img src={`https://randomuser.me/api/portraits/women/${i + 20}.jpg`} alt="User" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-zinc-300">
            <div className="flex text-yellow-500">
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
              <Star size={16} fill="currentColor" />
            </div>
            <span className="text-sm font-medium">Join 2M+ singles on IGNITE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
