"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const stars = Array.from({ length: 44 }).map((_, index) => ({
  id: index,
  left: `${(index * 23) % 100}%`,
  top: `${(index * 19) % 100}%`,
  size: 1 + (index % 3),
  duration: 1.8 + (index % 5) * 0.35,
  delay: (index % 7) * 0.22,
}));

export default function CtaBanner() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 34 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 34 }}
      transition={{ duration: 0.75 }}
      className="relative overflow-hidden bg-[linear-gradient(135deg,#E8192C,#A8111E,#7A0A15)] py-24 md:py-28"
    >
      <div className="pointer-events-none absolute inset-0">
        {stars.map((star) => (
          <motion.span
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
            animate={{
              opacity: [0.2, 0.9, 0.25],
              scale: [0.9, 1.3, 1],
            }}
            transition={{
              duration: star.duration,
              repeat: Number.POSITIVE_INFINITY,
              delay: star.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.18),transparent_55%)]" />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 text-center md:px-8">
        <p className="font-mono text-[11px] tracking-[0.35em] text-white/60">✦ DON&apos;T WAIT ✦</p>
        <h2 className="mx-auto mt-5 max-w-4xl font-display text-[44px] leading-[0.92] text-white md:text-[68px]">
          Your person is already on here.
        </h2>
        <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-white/70">
          What are you waiting for?
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
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

        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.15em] text-white/40">
          No credit card required. Free forever.
        </p>
      </div>
    </motion.section>
  );
}
