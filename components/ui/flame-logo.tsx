"use client";

import { motion } from "framer-motion";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      animate={{
        filter: [
          "drop-shadow(0 0 10px rgba(232, 25, 44, 0.35))",
          "drop-shadow(0 0 24px rgba(232, 25, 44, 0.55))",
          "drop-shadow(0 0 10px rgba(232, 25, 44, 0.35))",
        ],
      }}
      transition={{
        duration: 2.4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <defs>
        <linearGradient id="hkmeetupLogoGradient" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF3E6C" />
          <stop offset="0.5" stopColor="#E8192C" />
          <stop offset="1" stopColor="#A90F2D" />
        </linearGradient>
      </defs>
      <path
        d="M4 20C4 11.1634 11.1634 4 20 4H44C52.8366 4 60 11.1634 60 20V44C60 52.8366 52.8366 60 44 60H20C11.1634 60 4 52.8366 4 44V20Z"
        fill="url(#hkmeetupLogoGradient)"
      />
      <path
        d="M4 20C4 11.1634 11.1634 4 20 4H44C52.8366 4 60 11.1634 60 20V44C60 52.8366 52.8366 60 44 60H20C11.1634 60 4 52.8366 4 44V20Z"
        stroke="#FFFFFF"
        strokeOpacity="0.18"
        strokeWidth="1.2"
      />
      <path
        d="M18 18V46M28 18V46M18 32H28M38 18V46M38 32L49 18M38 32L49 46"
        stroke="#F8FAFC"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="14" r="3" fill="#FFD0D8" />
    </motion.svg>
  );
}

export const FlameLogo = BrandLogo;
