"use client";

import { motion } from "framer-motion";
import { Heart, MessageCircle, UserRound } from "lucide-react";
import Link from "next/link";
import { useInView } from "react-intersection-observer";

const steps = [
  {
    id: "01",
    title: "Build Your Profile",
    description:
      "Show your real self with photos, prompts, and passions that make people stop scrolling.",
    icon: UserRound,
  },
  {
    id: "02",
    title: "Swipe & Match",
    description:
      "Discover people with your energy and spark mutual matches in seconds.",
    icon: Heart,
  },
  {
    id: "03",
    title: "Start Talking",
    description:
      "Unlock chats, break the ice fast, and turn chemistry into real connection.",
    icon: MessageCircle,
  },
];

export default function HowItWorks() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section id="how-it-works" className="bg-[#0D0D0D] py-24 md:py-28">
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-8">
        <p className="text-center font-mono text-[11px] tracking-[0.28em] text-crimson">
          HOW IT WORKS
        </p>
        <h2 className="mx-auto mt-4 max-w-4xl text-center font-display text-[40px] leading-[0.95] text-offwhite md:text-[64px]">
          A clearer path from profile setup to real conversation
        </h2>

        <div ref={ref} className="mt-14 grid gap-6 lg:grid-cols-[370px_minmax(0,1fr)] lg:items-start">
          <motion.aside
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
            transition={{ duration: 0.55 }}
            className="rounded-[28px] border border-white/12 bg-white/[0.03] p-6 lg:sticky lg:top-24"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-crimson/90">
              What you get
            </p>
            <h3 className="mt-3 font-display text-4xl leading-[0.95] text-offwhite">
              Simple flow, better matches
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-offwhite/65">
              Each step is designed to reduce friction and help you reach quality matches faster,
              with safer conversations from the first hello.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <p className="font-display text-2xl leading-none text-offwhite">3</p>
                <p className="mt-1 text-[11px] text-offwhite/60">simple steps</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <p className="font-display text-2xl leading-none text-offwhite">2 min</p>
                <p className="mt-1 text-[11px] text-offwhite/60">to start swiping</p>
              </div>
            </div>
            <Link
              href="/signup"
              className="hkmeetup-btn mt-6 inline-flex w-full items-center justify-center rounded-full bg-crimson px-5 py-3 text-sm font-semibold text-offwhite shadow-[0_0_24px_rgba(232,25,44,0.28)] transition hover:bg-crimson-dark"
            >
              Start Free
            </Link>
          </motion.aside>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.article
                  key={step.id}
                  initial={{ opacity: 0, y: 26 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 26 }}
                  transition={{ duration: 0.55, delay: index * 0.15 }}
                  className="rounded-[28px] border border-white/12 bg-white/[0.02] p-6 transition duration-300 hover:-translate-y-1 hover:border-crimson/35 hover:bg-white/[0.04] md:p-7"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-11 min-w-11 items-center justify-center rounded-xl border border-crimson/30 bg-crimson/15 font-mono text-[12px] text-crimson">
                        {step.id}
                      </span>
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-offwhite">
                        <Icon className="h-5 w-5" />
                      </span>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-offwhite/45">
                      Step {index + 1} of {steps.length}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-[30px] leading-tight text-offwhite md:text-[36px]">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 max-w-2xl font-body text-base leading-relaxed text-offwhite/60">
                    {step.description}
                  </p>
                  <div className="mt-5 h-1.5 w-full rounded-full bg-white/10">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-crimson to-[#ff7a8a]"
                      style={{ width: `${((index + 1) / steps.length) * 100}%` }}
                    />
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
