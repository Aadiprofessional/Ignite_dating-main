"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

type Stat = {
  value: number;
  suffix: string;
  label: string;
};

const stats: Stat[] = [
  { value: 2.8, suffix: "M+", label: "Active Users" },
  { value: 847, suffix: "K", label: "Matches Made" },
  { value: 4.9, suffix: "★", label: "App Rating" },
];

function CountUp({ value, suffix }: { value: number; suffix: string }) {
  const [display, setDisplay] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.35 });

  useEffect(() => {
    if (!inView) {
      return;
    }

    const duration = 2000;
    const start = performance.now();
    let frame = 0;

    const tick = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      setDisplay(value * progress);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  const formatted =
    value % 1 === 0
      ? Math.round(display).toLocaleString()
      : display.toFixed(1).replace(/\.0$/, "");

  return (
    <span ref={ref} className="font-display text-[28px] leading-none text-offwhite sm:text-[32px]">
      {formatted}
      {suffix}
    </span>
  );
}

export default function StatsBar() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 34 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 34 }}
      transition={{ duration: 0.7 }}
      className="border-y border-white/6 bg-white/[0.03] py-6"
    >
      <div className="mx-auto grid w-full max-w-[1400px] gap-4 px-5 text-center md:grid-cols-3 md:gap-0 md:px-8">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`rounded-xl py-2 ${index < stats.length - 1 ? "md:border-r md:border-white/10" : ""}`}
          >
            <CountUp value={stat.value} suffix={stat.suffix} />
            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-crimson/90">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
