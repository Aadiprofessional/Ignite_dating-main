"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Timer, Gift, Check, ArrowRight, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OffersPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const offers = [
    {
      id: "starter-bundle",
      title: "Starter Bundle",
      description: "Perfect for getting started",
      price: 19.99,
      originalPrice: 39.99,
      features: ["1 Month Hkmeetup Pro", "5 Boosts", "5 Super Likes"],
      color: "from-blue-500 to-purple-600",
      popular: false,
    },
    {
      id: "ultimate-bundle",
      title: "Ultimate Dating Kit",
      description: "Maximum visibility & features",
      price: 49.99,
      originalPrice: 99.99,
      features: ["3 Months Hkmeetup Pro", "15 Boosts", "20 Super Likes", "Profile Review"],
      color: "from-rose-500 to-orange-500",
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#080808] pb-24 pt-6 px-4">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-orange-500/30 px-4 py-2 rounded-full"
          >
            <Sparkles size={16} className="text-orange-400" />
            <span className="text-orange-400 font-bold uppercase tracking-wider text-sm">Limited Time Offer</span>
          </motion.div>
          
          <h1 className="text-4xl font-bold font-display text-white">Flash Sale</h1>
          
          {/* Countdown */}
          <div className="flex justify-center gap-4">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="text-center">
                <div className="w-16 h-16 bg-[#121212] border border-white/10 rounded-xl flex items-center justify-center text-2xl font-mono font-bold text-white mb-1">
                  {value.toString().padStart(2, "0")}
                </div>
                <div className="text-xs text-white/40 uppercase tracking-wider">{unit}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Offers */}
        <div className="space-y-6">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${offer.color} rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`} />
              
              <div className="relative bg-[#121212] border border-white/10 rounded-3xl overflow-hidden">
                {offer.popular && (
                  <div className="bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold text-center py-1">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{offer.title}</h3>
                      <p className="text-white/60 text-sm">{offer.description}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                      <Gift size={20} className="text-white/80" />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">${offer.price}</span>
                    <span className="text-lg text-white/40 line-through">${offer.originalPrice}</span>
                    <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-md ml-2">
                      SAVE {Math.round((1 - offer.price / offer.originalPrice) * 100)}%
                    </span>
                  </div>

                  <div className="space-y-3">
                    {offer.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-gradient-to-br ${offer.color}`}>
                          <Check size={12} className="text-white" />
                        </div>
                        <span className="text-white/80 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Link href={`/premium/checkout?plan=${offer.id}&price=${offer.price}`} className="block">
                    <button className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all bg-gradient-to-r ${offer.color} text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`}>
                      Claim Offer
                      <ArrowRight size={20} />
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-white/40 max-w-xs mx-auto">
          Offer valid for new purchases only. Terms and conditions apply. Recurring billing may apply for subscription items.
        </p>
      </div>
    </div>
  );
}
