"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
      className="bg-[#0D0D0D] py-32"
    >
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
        <p className="text-center font-mono text-[11px] tracking-[0.35em] text-crimson">
          PRICING
        </p>
        <h2 className="mx-auto mt-5 max-w-3xl text-center font-display text-[38px] leading-[0.95] text-offwhite md:text-[56px]">
          Start free. Upgrade when you&apos;re ready.
        </h2>

        <div className="mx-auto mt-14 grid w-full max-w-3xl gap-6 md:grid-cols-2">
          <article className="glass-card p-8">
            <p className="font-display text-5xl text-offwhite">$0</p>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-offwhite/65">
              / forever
            </p>

            <ul className="mt-7 space-y-3">
              {freeIncluded.map((feature) => (
                <li key={feature} className="font-body text-sm text-offwhite/80">
                  ✓ <span className="ml-2">{feature}</span>
                </li>
              ))}
              {freeExcluded.map((feature) => (
                <li key={feature} className="font-body text-sm text-offwhite/30 line-through">
                  — <span className="ml-2">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="ignite-btn mt-8 inline-flex w-full items-center justify-center rounded-full border border-white/20 px-6 py-3 font-body text-sm text-offwhite"
            >
              Get Started Free
            </Link>
          </article>

          <article className="glass-card relative overflow-hidden border-crimson/45 bg-gradient-to-br from-crimson/10 via-crimson/4 to-transparent p-8 shadow-[0_0_45px_rgba(232,25,44,0.15)]">
            <span className="absolute right-5 top-5 rounded-full bg-crimson px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-offwhite">
              MOST POPULAR
            </span>
            <p className="font-display text-5xl text-offwhite">$14.99/month</p>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-offwhite/70">
              or $89.99/year (save 40%)
            </p>

            <ul className="mt-7 space-y-3">
              {proIncluded.map((feature) => (
                <li key={feature} className="font-body text-sm text-offwhite/90">
                  <span className="text-crimson">✓</span> <span className="ml-2">{feature}</span>
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
            className="font-body text-sm text-offwhite/80 transition hover:text-crimson"
          >
            See full feature comparison →
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
