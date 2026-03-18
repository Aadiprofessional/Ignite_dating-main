"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SplineHero from "@/components/marketing/SplineHero";

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

const headlineWords = ["Find", "Someone"];
const avatars = [
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/41.jpg",
  "https://randomuser.me/api/portraits/women/24.jpg",
  "https://randomuser.me/api/portraits/men/12.jpg",
  "https://randomuser.me/api/portraits/women/9.jpg",
];

export default function HeroSection() {
  const { scrollY } = useScroll();
  const scrollHintOpacity = useTransform(scrollY, [0, 100], [1, 0]);

  return (
    <section className="relative min-h-[100dvh] overflow-hidden bg-background">
      <SplineHero />

      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="absolute -left-32 top-[22%] h-[420px] w-[420px] rounded-full bg-crimson/24 blur-[140px] animate-float" />
        <div className="absolute -right-40 top-[8%] h-[460px] w-[460px] rounded-full bg-crimson-dark/30 blur-[160px] animate-floatReverse" />
      </div>

      <div className="relative z-20 mx-auto flex min-h-[100dvh] w-full max-w-[1200px] px-5 pb-14 pt-24 md:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto w-full max-w-[620px] text-center md:mx-0 md:text-left"
        >
          <motion.p
            variants={item}
            className="font-mono text-[11px] tracking-[0.35em] text-crimson"
          >
            ✦ THE DATING APP FOR THIS GENERATION ✦
          </motion.p>

          <div className="mt-6 space-y-2">
            <h1 className="font-display text-[52px] font-bold leading-[0.9] text-offwhite md:text-[88px]">
              {headlineWords.map((word, index) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.08, duration: 0.5 }}
                  className="mr-5 inline-block"
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <h2 className="font-display text-[52px] font-bold italic leading-[0.9] text-crimson md:text-[88px]">
              <motion.span
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36, duration: 0.5 }}
                className="inline-block"
              >
                Worth Burning
              </motion.span>
              <svg
                viewBox="0 0 410 36"
                className="mt-2 h-4 w-[250px] md:h-6 md:w-[390px]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <motion.path
                  d="M4 24C40 8 120 6 180 15C230 23 290 35 406 6"
                  stroke="#E8192C"
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: [0.37, 0, 0.63, 1] }}
                />
              </svg>
            </h2>

            <h3 className="font-display text-[52px] font-bold leading-[0.9] text-offwhite md:text-[88px]">
              <motion.span
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.44, duration: 0.5 }}
                className="inline-block"
              >
                For. 🔥
              </motion.span>
            </h3>
          </div>

          <motion.p
            variants={item}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mx-auto mt-8 max-w-[460px] font-body text-lg leading-relaxed text-offwhite/60 md:mx-0 md:text-[20px]"
          >
            Stop swiping endlessly. Start igniting real chemistry with people
            who match your energy, not just your filters.
          </motion.p>

          <motion.div
            variants={item}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-5 md:justify-start"
          >
            <Link
              href="/signup"
              className="ignite-btn group inline-flex items-center rounded-full bg-crimson px-10 py-4 font-body text-sm font-semibold text-offwhite shadow-[0_0_35px_rgba(232,25,44,0.25)] transition hover:bg-crimson-dark hover:shadow-[0_0_40px_rgba(232,25,44,0.5)]"
            >
              Create Your Free Profile
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href="#how-it-works"
              className="ignite-btn font-body text-sm text-offwhite/80 transition hover:text-offwhite"
            >
              See How It Works ↓
            </a>
          </motion.div>

          <motion.div
            variants={item}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-10 flex flex-col items-center gap-3 md:items-start"
          >
            <div className="flex items-center">
              {avatars.map((avatar, index) => (
                <span
                  key={avatar}
                  className={`relative inline-flex h-10 w-10 overflow-hidden rounded-full border border-white/20 ${index === 0 ? "" : "-ml-3"}`}
                >
                  <Image src={avatar} alt="IGNITE member" fill sizes="40px" />
                </span>
              ))}
            </div>
            <p className="font-mono text-xs text-offwhite/65">
              Join 2,847,291 singles already on IGNITE
            </p>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        style={{ opacity: scrollHintOpacity }}
        className="pointer-events-none absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 text-offwhite/65"
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
        <motion.span
          className="text-lg"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.3, repeat: Infinity }}
        >
          ↓
        </motion.span>
      </motion.div>
    </section>
  );
}
