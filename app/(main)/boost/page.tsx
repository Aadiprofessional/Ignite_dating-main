"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock, TrendingUp, History, ChevronRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";

const boostPackages = [
  {
    id: "boost-1",
    amount: 1,
    price: 6.99,
    label: "1 Boost",
    save: null,
  },
  {
    id: "boost-5",
    amount: 5,
    price: 4.99,
    label: "5 Boosts",
    save: "Save 28%",
    isPopular: true,
  },
  {
    id: "boost-10",
    amount: 10,
    price: 3.99,
    label: "10 Boosts",
    save: "Save 42%",
  },
];

export default function BoostPage() {
  const { currentUser, addBoosts, consumeBoost } = useStore();
  const [activePackage, setActivePackage] = useState(boostPackages[1].id);
  const [isActivating, setIsActivating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handlePurchase = () => {
    const pkg = boostPackages.find((p) => p.id === activePackage);
    if (pkg) {
      addBoosts(pkg.amount);
      // In a real app, this would trigger a payment flow
    }
  };

  const handleActivate = () => {
    if (currentUser?.boosts && currentUser.boosts > 0) {
      setIsActivating(true);
      setTimeout(() => {
        consumeBoost();
        setIsActivating(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] pb-24 pt-6 px-4">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap size={32} className="text-purple-400 fill-purple-400" />
          </div>
          <h1 className="text-3xl font-bold font-display text-white">Boost Profile</h1>
          <p className="text-white/60">
            Be the top profile in your area for 30 minutes to get more matches.
          </p>
        </div>

        {/* Current Status */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mb-10" />
          
          <div className="relative z-10">
            <div className="text-4xl font-bold text-white mb-1">{currentUser?.boosts || 0}</div>
            <div className="text-sm text-white/60 uppercase tracking-wider font-medium">Boosts Remaining</div>
            
            <button
              onClick={handleActivate}
              disabled={!currentUser?.boosts || currentUser.boosts <= 0 || isActivating}
              className={`mt-6 w-full py-3 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                !currentUser?.boosts || currentUser.boosts <= 0
                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_4px_20px_rgba(147,51,234,0.4)]"
              }`}
            >
              {isActivating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap size={20} />
                  </motion.div>
                  Activating...
                </>
              ) : (
                <>
                  <Zap size={20} className="fill-current" />
                  Activate Boost
                </>
              )}
            </button>
          </div>
        </div>

        {/* Packages */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Get More Boosts</h3>
          <div className="grid gap-3">
            {boostPackages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => setActivePackage(pkg.id)}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  activePackage === pkg.id
                    ? "border-purple-500 bg-purple-500/10"
                    : "border-white/10 bg-[#121212] hover:border-white/20"
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                       activePackage === pkg.id ? "bg-purple-500 text-white" : "bg-white/10 text-white"
                    }`}>
                      {pkg.amount}
                    </div>
                    <div>
                      <div className="font-bold text-white">{pkg.label}</div>
                      {pkg.save && <div className="text-xs text-purple-400 font-medium">{pkg.save}</div>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">${(pkg.price * pkg.amount).toFixed(2)}</div>
                    <div className="text-xs text-white/40">${pkg.price}/ea</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={handlePurchase}
            className="w-full bg-white text-black font-bold py-4 rounded-full mt-4 hover:bg-gray-200 transition-colors"
          >
            Get Boosts
          </button>
        </div>

        {/* History Mock */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">History</h3>
            <button className="text-xs text-white/40 hover:text-white transition-colors">View All</button>
          </div>
          
          <div className="bg-[#121212] rounded-2xl overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border-b border-white/5 flex items-center justify-between last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40">
                    <History size={18} />
                  </div>
                  <div>
                    <div className="font-medium text-white">Boost Session</div>
                    <div className="text-xs text-white/40">
                      {new Date(Date.now() - 1000 * 60 * 60 * 24 * i * 2).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-green-500">
                  <TrendingUp size={16} />
                  <span className="text-sm font-bold">+{10 * i} matches</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-[#121212] border border-purple-500/50 rounded-3xl p-8 text-center max-w-sm w-full relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-purple-500/10 blur-xl" />
              <div className="relative z-10">
                <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(147,51,234,0.5)]">
                  <Zap size={40} className="text-white fill-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">You're Boosted!</h2>
                <p className="text-white/60 mb-6">
                  Your profile will be seen by up to 10x more people for the next 30 minutes.
                </p>
                <div className="bg-white/5 rounded-xl p-4 flex items-center justify-center gap-2">
                  <Clock size={20} className="text-purple-400" />
                  <span className="font-mono text-xl font-bold text-white">29:59</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
