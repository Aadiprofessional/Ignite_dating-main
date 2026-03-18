"use client";

import { motion } from "framer-motion";
import { Heart, MessageCircle, UserRound } from "lucide-react";
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
    <section id="how-it-works" className="bg-[#0D0D0D] py-32">
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
        <p className="text-center font-mono text-[11px] tracking-[0.35em] text-crimson">
          HOW IT WORKS
        </p>
        <h2 className="mt-5 text-center font-display text-[44px] leading-[0.95] text-offwhite md:text-[72px]">
          Three steps to your spark
        </h2>

        <div ref={ref} className="relative mt-16 grid gap-6 md:grid-cols-3">
          <div className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-[62px] hidden border-t border-dashed border-crimson/50 md:block" />
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.article
                key={step.id}
                initial={{ opacity: 0, y: 22 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 22 }}
                transition={{ duration: 0.55, delay: index * 0.15 }}
                className="glass-card relative p-8 transition duration-300 hover:-translate-y-1 hover:border-crimson/30 hover:shadow-[0_0_30px_rgba(232,25,44,0.22)]"
              >
                <span className="pointer-events-none absolute right-6 top-3 font-display text-[92px] leading-none text-crimson/10">
                  {step.id}
                </span>
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-crimson/15 text-crimson">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 font-display text-[32px] leading-tight text-offwhite">
                  {step.title}
                </h3>
                <p className="mt-3 font-body text-base leading-relaxed text-offwhite/55">
                  {step.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
