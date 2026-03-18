"use client";

import { motion } from "framer-motion";

export function FlameLogo({ className }: { className?: string }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      animate={{
        filter: [
          "drop-shadow(0 0 10px rgba(232, 25, 44, 0.4))",
          "drop-shadow(0 0 20px rgba(232, 25, 44, 0.6))",
          "drop-shadow(0 0 10px rgba(232, 25, 44, 0.4))",
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <path
        d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.38 0 2.5-1.12 2.5-2.5 0-1.38-1.12-2.5-2.5-2.5a2.5 2.5 0 0 0-2.5 2.5z"
        fill="#E8192C"
        className="opacity-80"
      />
      <path
        d="M12 2c0 0-3 3-3 8 0 .8.2 1.5.5 2.1.3.6.8 1.1 1.4 1.4.6.3 1.3.5 2.1.5 2.8 0 5-2.2 5-5 0-3.9-3-6-6-7z"
        stroke="#E8192C"
        fill="none"
      />
      <motion.path
        d="M12 2c0 0-3 3-3 8 0 .8.2 1.5.5 2.1.3.6.8 1.1 1.4 1.4.6.3 1.3.5 2.1.5 2.8 0 5-2.2 5-5 0-3.9-3-6-6-7z"
        fill="#E8192C"
        initial={{ opacity: 0.2 }}
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z" className="hidden" />
    </motion.svg>
  );
}
