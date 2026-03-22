"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Lock, ShieldCheck, CreditCard, Star } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

// Placeholder key as requested
const stripePromise = loadStripe("pk_test_TYooMQauvdEDq54NiTphI7jx");

function CheckoutForm({ plan, billing, amount }: { plan: string; billing: string; amount: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing for demo
    // In real app: const {error} = await stripe.confirmPayment(...)
    setTimeout(() => {
      setIsProcessing(false);
      router.push("/premium/success");
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm">
          {errorMessage}
        </div>
      )}
      
      <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <CreditCard size={20} className="text-crimson" />
          Payment Details
        </h3>
        {/* Note: PaymentElement requires clientSecret or mode usually. 
            For pure UI demo with test key, it might not render perfectly without backend intent. 
            We'll use a CardElement fallback if PaymentElement fails or just assume mock context.
            However, PaymentElement is the modern way. Let's try to wrap in error boundary if needed.
        */}
        <div className="min-h-[200px]">
             <PaymentElement 
                options={{
                    layout: "tabs",
                }}
            />
        </div>
      </div>

      <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="text-lg font-bold text-white mb-2">Billing Address</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-zinc-400 mb-2 uppercase tracking-wider">Name on Card</label>
            <input 
              type="text" 
              placeholder="JOHN DOE"
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-crimson/50 focus:ring-1 focus:ring-crimson/50 transition-all font-mono"
            />
          </div>
          <div>
             <label className="block text-xs font-mono text-zinc-400 mb-2 uppercase tracking-wider">Country</label>
             <div className="relative">
                 <select className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-crimson/50 focus:ring-1 focus:ring-crimson/50 transition-all appearance-none font-mono cursor-pointer">
                    <option>United States</option>
                    <option>United Kingdom</option>
                    <option>Canada</option>
                    <option>Australia</option>
                    <option>Germany</option>
                    <option>France</option>
                 </select>
                 <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                 </div>
             </div>
          </div>
        </div>
      </div>
      
      {/* Coupon Code */}
      <div className="pt-2">
         <button type="button" className="text-sm text-zinc-400 hover:text-crimson transition-colors font-mono border-b border-dashed border-zinc-600 hover:border-crimson pb-0.5">
            + Add coupon code
         </button>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-crimson text-white font-bold text-lg py-4 rounded-full shadow-[0_4px_20px_rgba(232,25,44,0.4)] hover:bg-red-600 hover:shadow-[0_6px_25px_rgba(232,25,44,0.5)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-8"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          `Subscribe • ${amount}`
        )}
      </button>

      <p className="text-[10px] text-zinc-500 text-center leading-relaxed max-w-sm mx-auto">
        By confirming your subscription, you allow Ignite to charge your card for this payment and future payments in accordance with our terms. You can cancel your subscription at any time.
      </p>

      <div className="flex justify-center gap-6 pt-6 border-t border-zinc-900/50">
         <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase tracking-wider font-medium">
            <Lock size={12} className="text-zinc-400" />
            <span>256-bit SSL</span>
         </div>
         <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase tracking-wider font-medium">
            <ShieldCheck size={12} className="text-zinc-400" />
            <span>Secure Payment</span>
         </div>
         <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase tracking-wider font-medium">
            <CreditCard size={12} className="text-zinc-400" />
            <span>Cancel Anytime</span>
         </div>
      </div>
    </form>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") || "Pro";
  const billing = searchParams.get("billing") || "monthly";
  
  // Calculate price based on params
  let price = "$14.99";
  let period = "/mo";
  let total = "$14.99";
  let amountVal = 1499;

  if (plan === "Platinum") {
    if (billing === "yearly") {
        price = "$179.99";
        total = "$179.99";
        period = "/yr";
        amountVal = 17999;
    } else {
        price = "$24.99";
        total = "$24.99";
        period = "/mo";
        amountVal = 2499;
    }
  } else {
    if (billing === "yearly") {
        price = "$89.99";
        total = "$89.99";
        period = "/yr";
        amountVal = 8999;
    } else {
        price = "$14.99";
        total = "$14.99";
        period = "/mo";
        amountVal = 1499;
    }
  }

  const options = {
    mode: 'payment' as const,
    amount: amountVal,
    currency: 'usd',
    appearance: {
        theme: 'night' as const,
        variables: {
            colorPrimary: '#E8192C',
            colorBackground: '#0A0A0A',
            colorText: '#F5F0EB',
            colorDanger: '#E8192C',
            fontFamily: 'DM Mono, monospace',
            spacingUnit: '4px',
            borderRadius: '12px',
        },
    },
  };

  return (
    <div className="max-w-xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/premium" className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="font-serif font-bold text-3xl">Checkout</h1>
        </div>

        {/* Order Summary */}
        <div className="bg-gradient-to-br from-zinc-900 to-[#0A0A0A] border border-zinc-800 rounded-3xl p-6 mb-8 flex justify-between items-center shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-crimson/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
                <h2 className="font-bold text-2xl mb-1 text-white">Ignite {plan}</h2>
                <p className="text-zinc-400 text-sm font-mono capitalize mb-3">{billing} billing</p>
                <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    <Star size={10} className="fill-current text-yellow-500" />
                    7-DAY FREE TRIAL
                </div>
            </div>
            <div className="text-right relative z-10">
                <span className="block text-3xl font-bold text-crimson tracking-tight">{price}</span>
                <span className="text-zinc-500 text-xs font-mono uppercase tracking-wider">{period}</span>
            </div>
        </div>

        {/* Payment Form */}
        <Elements stripe={stripePromise} options={options}>
           <CheckoutForm plan={plan} billing={billing} amount={total} />
        </Elements>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#080808] text-white pb-20">
      <Suspense fallback={<div className="text-center pt-20">Loading checkout...</div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
