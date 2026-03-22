"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Crown, Sparkles, X } from "lucide-react";
import { useInView } from "react-intersection-observer";

const freeIncluded = [
  "20 daily swipes",
  "Basic matching",
  "Text messaging",
  "Profile creation",
];

const freeExcluded = ["Unlimited likes", "See who liked you", "Rewind"];

const proIncluded = [
  "Unlimited likes",
  "See who liked you",
  "Rewind",
  "5 boosts/month",
  "Incognito",
  "Priority discovery",
  "Read receipts",
];

export default function PricingPreview() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <motion.section
      id="pricing"
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.7 }}
      className="bg-[#0D0D0D] py-24 md:py-28"
    >
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-8">
        <p className="text-center font-mono text-[11px] tracking-[0.28em] text-crimson">
          PRICING
        </p>
        <h2 className="mx-auto mt-4 max-w-3xl text-center font-display text-[40px] leading-[0.95] text-offwhite md:text-[62px]">
          Choose your pace. Start free, unlock more when ready.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-offwhite/60 md:text-base">
          Clear plans built for real dating progress, from first match to premium visibility.
        </p>

        <div className="mx-auto mt-12 grid w-full max-w-5xl gap-6 lg:grid-cols-2">
          <article className="rounded-[28px] border border-white/12 bg-white/[0.02] p-6 md:p-7">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-offwhite/75">
                <Sparkles className="h-3.5 w-3.5 text-crimson" />
                Free
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-offwhite/45">
                Best for starting
              </span>
            </div>
            <p className="mt-5 font-display text-[52px] leading-none text-offwhite">$0</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-offwhite/60">
              forever
            </p>

            <ul className="mt-6 space-y-2.5">
              {freeIncluded.map((feature) => (
                <li key={feature} className="inline-flex items-center gap-2 text-sm text-offwhite/80">
                  <Check className="h-4 w-4 text-crimson" />
                  <span>{feature}</span>
                </li>
              ))}
              {freeExcluded.map((feature) => (
                <li key={feature} className="inline-flex items-center gap-2 text-sm text-offwhite/35">
                  <X className="h-4 w-4 text-offwhite/30" />
                  <span className="line-through">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="ignite-btn mt-7 inline-flex w-full items-center justify-center rounded-full border border-white/20 px-6 py-3 font-body text-sm font-semibold text-offwhite transition hover:border-crimson/55"
            >
              Get Started Free
            </Link>
          </article>

          <article className="relative overflow-hidden rounded-[28px] border border-crimson/45 bg-gradient-to-br from-crimson/16 via-crimson/6 to-transparent p-6 shadow-[0_0_45px_rgba(232,25,44,0.18)] md:p-7">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full bg-crimson px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-offwhite">
                <Crown className="h-3.5 w-3.5" />
                Most Popular
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-offwhite/75">
                Save 40%
              </span>
            </div>
            <p className="mt-5 font-display text-[52px] leading-none text-offwhite">$14.99</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-offwhite/75">
              monthly · or $89.99 yearly
            </p>

            <ul className="mt-6 space-y-2.5">
              {proIncluded.map((feature) => (
                <li key={feature} className="inline-flex items-center gap-2 text-sm text-offwhite/92">
                  <Check className="h-4 w-4 text-offwhite" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/premium"
              className="ignite-btn mt-8 inline-flex w-full items-center justify-center rounded-full bg-crimson px-6 py-3 font-body text-sm font-semibold text-offwhite shadow-[0_0_30px_rgba(232,25,44,0.35)] hover:bg-crimson-dark"
            >
              Try Pro Free for 7 Days
            </Link>
          </article>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/premium"
            className="font-body text-sm text-offwhite/75 transition hover:text-crimson"
          >
            See full feature comparison →
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
