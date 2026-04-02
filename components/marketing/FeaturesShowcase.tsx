"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Crown, MessageCircle, ShieldCheck, Sparkles, Zap } from "lucide-react";
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
    tag: "HKMEETUP PRO",
    title: "See who's already obsessed with you.",
    body: "Unlock advanced visibility, priority boosts, and premium filters with HKMEETUP Pro.",
    id: "",
  },
];

function SmartMatchingVisual() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/12 p-6 sm:p-8">
      <div className="mx-auto max-w-[380px] rounded-3xl border border-white/10 bg-transparent p-5">
        <div className="flex items-center justify-between">
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-white/15">
            <Image
              src="https://randomuser.me/api/portraits/women/65.jpg"
              alt="Profile"
              fill
              sizes="80px"
            />
          </div>
          <div className="rounded-full border border-crimson/40 bg-crimson/15 p-2.5">
            <Zap className="h-5 w-5 text-crimson" />
          </div>
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-white/15">
            <Image
              src="https://randomuser.me/api/portraits/men/52.jpg"
              alt="Profile"
              fill
              sizes="80px"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-offwhite/65">
          <span>Compatibility signal</span>
          <span className="font-mono text-crimson">High intent</span>
        </div>
        <div className="mt-2 h-2.5 rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "94%" }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-crimson to-[#ff7a8a]"
          />
        </div>
        <p className="mt-3 text-center font-mono text-xs text-crimson">94% compatibility</p>
      </div>
      <div className="mx-auto mt-4 flex max-w-[380px] items-center justify-between gap-2">
        {["Shared interests", "Aligned goals", "Active today"].map((entry) => (
          <span
            key={entry}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-white/12 bg-transparent px-2.5 py-1.5 text-[10px] text-offwhite/75"
          >
            {entry}
          </span>
        ))}
      </div>
    </div>
  );
}

function ChatVisual() {
  return (
    <div className="rounded-3xl border border-white/12 p-5 sm:p-6">
      <div className="rounded-2xl border border-white/10 bg-transparent p-4">
        <div className="mb-3 flex items-center justify-between rounded-xl border border-white/10 bg-transparent px-3 py-2">
          <span className="inline-flex items-center gap-2 text-xs text-offwhite/70">
            <MessageCircle className="h-4 w-4 text-crimson" />
            Prompted chat
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-crimson">
            Icebreaker
          </span>
        </div>
        <div className="space-y-3 rounded-2xl border border-white/10 bg-transparent p-4">
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
        <div className="mt-3 rounded-xl border border-white/10 bg-transparent px-3 py-2.5 text-xs text-offwhite/55">
          Suggested reply: Friday works. 7 PM?
        </div>
      </div>
    </div>
  );
}

function SafetyVisual() {
  return (
    <div className="flex min-h-[300px] items-center rounded-3xl border border-white/12 p-6 sm:p-8">
      <div className="w-full rounded-3xl border border-white/10 bg-transparent p-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-crimson">
            Protection Layer
          </span>
          <ShieldCheck className="h-5 w-5 text-crimson" />
        </div>
        <div className="mt-4 space-y-2.5">
          {["Photo verification", "Report & block tools", "Secure chat controls"].map((entry) => (
            <div
              key={entry}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-transparent px-3.5 py-2.5"
            >
              <span className="text-sm text-offwhite/85">{entry}</span>
              <span className="h-2.5 w-2.5 rounded-full bg-crimson" />
            </div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-4 rounded-2xl border border-crimson/30 bg-crimson/10 px-4 py-3 text-sm text-offwhite/85"
        >
          Safety checks run before every new conversation.
        </motion.div>
      </div>
    </div>
  );
}

function ProVisual() {
  return (
    <div id="stories" className="group relative overflow-hidden rounded-3xl border border-white/12 p-6">
      <div className="rounded-3xl border border-white/10 bg-transparent p-5">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-crimson/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-crimson">
            <Crown className="h-3.5 w-3.5" />
            Hkmeetup Pro
          </span>
          <Sparkles className="h-4 w-4 text-crimson" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {["Priority boost", "Who liked you", "Advanced filters", "Read receipts"].map((entry) => (
            <div
              key={entry}
              className="rounded-xl border border-white/10 bg-transparent px-3 py-3"
            >
              <p className="text-xs text-offwhite/80">{entry}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-crimson/30 bg-crimson/10 px-3 py-2.5 text-xs text-offwhite/85">
          Unlock higher visibility and faster quality matches.
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-crimson/0 transition duration-300 group-hover:bg-crimson/5" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(232,25,44,0.25),0_0_32px_rgba(232,25,44,0.2)] opacity-0 transition duration-300 group-hover:opacity-100" />
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
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-8">
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
                  className="hkmeetup-btn mt-6 inline-flex font-body text-sm text-offwhite transition hover:text-crimson"
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
