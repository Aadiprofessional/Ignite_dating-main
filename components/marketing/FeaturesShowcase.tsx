"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ShieldCheck, Zap } from "lucide-react";
import { useInView } from "react-intersection-observer";

const features = [
  {
    tag: "SMART MATCHING",
    title: "We match energy, not just looks.",
    body: "A compatibility engine learns your vibe and surfaces people who feel right, fast.",
    id: "features",
  },
  {
    tag: "REAL CONVERSATIONS",
    title: "Ice is meant to be broken.",
    body: "Prompts, reactions, and flow-first chat tools make every first message less awkward.",
    id: "",
  },
  {
    tag: "YOUR SAFETY FIRST",
    title: "Verified. Protected. Safe.",
    body: "Layered moderation, profile verification, and in-chat controls keep your experience secure.",
    id: "",
  },
  {
    tag: "IGNITE PRO",
    title: "See who's already obsessed with you.",
    body: "Unlock advanced visibility, priority boosts, and premium filters with IGNITE Pro.",
    id: "",
  },
];

function SmartMatchingVisual() {
  return (
    <div className="glass-card relative overflow-hidden p-8">
      <div className="mx-auto flex max-w-[360px] items-center justify-between">
        <div className="relative h-20 w-20 overflow-hidden rounded-full border border-white/15">
          <Image
            src="https://randomuser.me/api/portraits/women/65.jpg"
            alt="Profile"
            fill
            sizes="80px"
          />
        </div>
        <Zap className="h-6 w-6 text-crimson" />
        <div className="relative h-20 w-20 overflow-hidden rounded-full border border-white/15">
          <Image
            src="https://randomuser.me/api/portraits/men/52.jpg"
            alt="Profile"
            fill
            sizes="80px"
          />
        </div>
      </div>
      <div className="mx-auto mt-8 h-3 max-w-[360px] rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: "94%" }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full bg-crimson"
        />
      </div>
      <p className="mt-3 text-center font-mono text-xs text-crimson">94% compatibility</p>
    </div>
  );
}

function ChatVisual() {
  return (
    <div className="glass-card p-6">
      <div className="space-y-3 rounded-2xl border border-white/10 bg-black/35 p-5">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="max-w-[80%] rounded-2xl bg-white/10 px-4 py-3 text-sm text-offwhite/80"
        >
          You had me at ramen. Best place in town?
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.28 }}
          className="ml-auto max-w-[80%] rounded-2xl bg-crimson px-4 py-3 text-sm text-offwhite"
        >
          Tiny Tokyo on 8th. First date challenge accepted.
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.42 }}
          className="max-w-[64%] rounded-2xl bg-white/10 px-4 py-3 text-sm text-offwhite/80"
        >
          Perfect. Friday?
        </motion.div>
      </div>
    </div>
  );
}

function SafetyVisual() {
  return (
    <div className="glass-card flex min-h-[280px] items-center justify-center p-8">
      <div className="relative">
        <ShieldCheck className="h-28 w-28 text-crimson/35" />
        <svg
          className="absolute inset-0 h-28 w-28 text-crimson"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d="M7 12.5L10.2 15.7L17.6 8.3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
        </svg>
      </div>
    </div>
  );
}

function ProVisual() {
  return (
    <div id="stories" className="group glass-card relative overflow-hidden p-6">
      <div className="grid grid-cols-3 gap-3 blur-[4px] transition duration-300 group-hover:blur-0">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="h-20 rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02]"
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-crimson/0 transition duration-300 group-hover:bg-crimson/8" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(232,25,44,0.35),0_0_40px_rgba(232,25,44,0.25)] opacity-0 transition duration-300 group-hover:opacity-100" />
    </div>
  );
}

const visuals = [SmartMatchingVisual, ChatVisual, SafetyVisual, ProVisual];

export default function FeaturesShowcase() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.7 }}
      className="pb-16"
    >
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
        {features.map((feature, index) => {
          const isTextLeft = index % 2 === 0;
          const Visual = visuals[index];
          return (
            <div
              key={feature.tag}
              id={feature.id || undefined}
              className="grid items-center gap-12 py-24 md:grid-cols-2"
            >
              <motion.div
                initial={{ opacity: 0, x: isTextLeft ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.65 }}
                className={isTextLeft ? "md:order-1" : "md:order-2"}
              >
                <p className="font-mono text-[11px] tracking-[0.3em] text-crimson">{feature.tag}</p>
                <h3 className="mt-4 font-display text-[42px] leading-[0.95] text-offwhite md:text-[58px]">
                  {feature.title}
                </h3>
                <p className="mt-5 max-w-xl font-body text-lg text-offwhite/55">
                  {feature.body}
                </p>
                <a
                  href="#"
                  className="ignite-btn mt-6 inline-flex font-body text-sm text-offwhite transition hover:text-crimson"
                >
                  Learn more →
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: isTextLeft ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.65, delay: 0.08 }}
                className={isTextLeft ? "md:order-2" : "md:order-1"}
              >
                <Visual />
              </motion.div>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
