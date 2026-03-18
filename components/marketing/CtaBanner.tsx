"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const dots = Array.from({ length: 50 }).map((_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  delay: `${(index * 0.17) % 6}s`,
  duration: `${6 + (index % 3)}s`,
}));

export default function CtaBanner() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 34 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 34 }}
      transition={{ duration: 0.75 }}
      className="relative overflow-hidden bg-[linear-gradient(135deg,#E8192C,#A8111E,#7A0A15)] py-40"
    >
      <div className="pointer-events-none absolute inset-0">
        {dots.map((dot) => (
          <span
            key={dot.id}
            className="absolute bottom-[-24px] h-2 w-2 rounded-full bg-white/55"
            style={{
              left: dot.left,
              animationName: "floatUp",
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
              animationDuration: dot.duration,
              animationDelay: dot.delay,
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:url('data:image/svg+xml,%3Csvg viewBox=%270 0 200 200%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.9%27 numOctaves=%273%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E')]" />

      <div className="relative z-10 mx-auto w-full max-w-[1200px] px-5 text-center md:px-8">
        <p className="font-mono text-[11px] tracking-[0.35em] text-white/60">✦ DON&apos;T WAIT ✦</p>
        <h2 className="mx-auto mt-6 max-w-4xl font-display text-[52px] leading-[0.92] text-white md:text-[80px]">
          Your person is already on here.
        </h2>
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-white/70">
          What are you waiting for?
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="ignite-btn rounded-full bg-white px-8 py-3 font-body text-sm font-semibold text-[#0D0D0D]"
          >
            Create Free Account
          </Link>
          <Link
            href="/login"
            className="ignite-btn rounded-full border border-white/70 px-8 py-3 font-body text-sm font-semibold text-white"
          >
            Sign In
          </Link>
        </div>

        <p className="mt-7 font-mono text-[11px] uppercase tracking-[0.15em] text-white/40">
          No credit card required. Free forever.
        </p>
      </div>
    </motion.section>
  );
}
