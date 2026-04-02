"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { ArrowRight, Check, ShieldCheck, Sparkles, Users } from "lucide-react";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const avatars = [
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/41.jpg",
  "https://randomuser.me/api/portraits/women/24.jpg",
  "https://randomuser.me/api/portraits/men/12.jpg",
  "https://randomuser.me/api/portraits/women/9.jpg",
];
const trustStats = [
  { label: "Live Matches Daily", value: "150K+" },
  { label: "Verified Profiles", value: "98%" },
  { label: "Meaningful Chats", value: "2.8M+" },
];
const valuePoints = [
  "Personalized compatibility suggestions",
  "Verified profiles and safety-first design",
  "Events and sparks tailored to your city",
];

export default function HeroSection() {
  const { scrollY } = useScroll();
  const scrollHintOpacity = useTransform(scrollY, [0, 100], [1, 0]);

  return (
    <section className="relative min-h-[calc(100dvh-5rem)] overflow-hidden bg-[#080808]">
      <div className="relative z-20 mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-[1400px] items-center px-5 pb-8 pt-14 md:px-8 lg:pt-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-14"
        >
          <div className="text-center lg:text-left">
            <motion.p
              variants={item}
              className="inline-flex items-center rounded-full border border-crimson/40 bg-crimson/10 px-4 py-2 font-mono text-[11px] tracking-[0.25em] text-crimson"
            >
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              MADE FOR REAL CONNECTIONS
            </motion.p>

            <div className="mt-6 space-y-3">
              <h1 className="font-display text-[44px] font-bold leading-[0.92] text-offwhite sm:text-[56px] md:text-[68px] lg:text-[78px]">
                <motion.span
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24, duration: 0.55 }}
                  className="inline-block"
                >
                  Meet people
                </motion.span>
                <br />
                <motion.span
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.34, duration: 0.55 }}
                  className="inline-block bg-gradient-to-r from-crimson to-[#ff7a8a] bg-clip-text text-transparent"
                >
                  worth your energy
                </motion.span>
              </h1>

              <motion.p
                variants={item}
                transition={{ delay: 0.46, duration: 0.6 }}
                className="mx-auto max-w-[600px] font-body text-base leading-relaxed text-offwhite/75 sm:text-lg lg:mx-0 lg:text-[19px]"
              >
                Hkmeetup helps you move from endless scrolling to intentional
                dating with profile quality checks, smarter compatibility, and
                safer first conversations.
              </motion.p>
            </div>

            <motion.div
              variants={item}
              transition={{ delay: 0.6, duration: 0.55 }}
              className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link
                href="/signup"
                className="hkmeetup-btn group inline-flex items-center justify-center rounded-full bg-crimson px-7 py-3.5 font-body text-sm font-semibold text-offwhite shadow-[0_0_32px_rgba(232,25,44,0.28)] transition hover:bg-crimson-dark hover:shadow-[0_0_42px_rgba(232,25,44,0.5)] sm:px-10 sm:py-4"
              >
                Start Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href="#how-it-works"
                className="hkmeetup-btn inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3.5 font-body text-sm font-medium text-offwhite/90 transition hover:border-white/35 hover:bg-white/5 sm:px-10 sm:py-4"
              >
                Explore How It Works
              </a>
            </motion.div>

            <motion.div
              variants={item}
              transition={{ delay: 0.72, duration: 0.55 }}
              className="mt-7 flex flex-col items-center gap-4 lg:items-start"
            >
              <div className="flex items-center">
                {avatars.map((avatar, index) => (
                  <span
                    key={avatar}
                    className={`relative inline-flex h-10 w-10 overflow-hidden rounded-full border border-white/25 sm:h-11 sm:w-11 ${index === 0 ? "" : "-ml-3"}`}
                  >
                    <Image src={avatar} alt="HKMEETUP member" fill sizes="44px" />
                  </span>
                ))}
                <span className="ml-3 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-offwhite/80">
                  2,847,291+ active singles
                </span>
              </div>

              <div className="grid w-full max-w-[640px] grid-cols-1 gap-2.5 sm:grid-cols-3">
                {trustStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left"
                  >
                    <p className="font-display text-[22px] leading-none text-offwhite">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-xs text-offwhite/60">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={item}
            transition={{ delay: 0.34, duration: 0.7 }}
            className="mx-auto w-full max-w-[420px] lg:mx-0"
          >
            <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-gradient-to-b from-white/10 to-white/[0.02] p-4 backdrop-blur-xl sm:p-5">
              <div className="absolute -top-10 right-6 h-24 w-24 rounded-full bg-crimson/30 blur-2xl" />
              <div className="absolute -bottom-10 -left-5 h-24 w-24 rounded-full bg-crimson-dark/30 blur-2xl" />

              <div className="relative rounded-3xl border border-white/10 bg-[#0f0f10]/95 p-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-crimson/20 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-crimson">
                    Today&apos;s Best Match
                  </span>
                  <span className="flex items-center gap-1 text-xs text-offwhite/70">
                    <Users className="h-3.5 w-3.5" />
                    12 online now
                  </span>
                </div>

                <div className="relative mt-4 h-[280px] overflow-hidden rounded-2xl sm:h-[300px]">
                  <Image
                    src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80"
                    alt="Match preview"
                    fill
                    sizes="(max-width: 1024px) 90vw, 380px"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-4">
                    <p className="font-display text-2xl leading-none text-offwhite">
                      Maya, 27
                    </p>
                    <p className="mt-1 text-sm text-offwhite/75">
                      Coffee walks, live gigs, and spontaneous road trips
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5">
                  {valuePoints.map((point) => (
                    <div
                      key={point}
                      className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                    >
                      <Check className="h-4 w-4 text-crimson" />
                      <span className="text-sm text-offwhite/85">{point}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
                  <span className="flex items-center gap-2 text-xs font-medium text-offwhite/80">
                    <ShieldCheck className="h-4 w-4 text-crimson" />
                    Safety-first conversations
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-crimson">
                    Trusted
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        style={{ opacity: scrollHintOpacity }}
        className="pointer-events-none absolute bottom-6 left-1/2 z-30 hidden -translate-x-1/2 items-center gap-2 text-offwhite/65 md:flex"
      >
        <svg
          width="20"
          height="34"
          viewBox="0 0 20 34"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="1" y="1" width="18" height="32" rx="9" stroke="currentColor" />
          <motion.rect
            x="8"
            y="7"
            width="4"
            height="7"
            rx="2"
            fill="currentColor"
            animate={{ y: [7, 14, 7] }}
            transition={{ duration: 1.3, repeat: Infinity }}
          />
        </svg>
        <span className="font-mono text-[11px] uppercase tracking-[0.3em]">scroll</span>
      </motion.div>
    </section>
  );
}
