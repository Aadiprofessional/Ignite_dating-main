import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080808",
        crimson: "#E8192C",
        "crimson-dark": "#A8111E",
        offwhite: "#F5F0EB",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        mono: ["var(--font-dm-mono)", "monospace"],
        body: ["var(--font-plus-jakarta)", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        floatReverse: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(20px)" },
        },
        pulseGlow: {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 20px rgba(232, 25, 44, 0.5)",
          },
          "50%": {
            opacity: "0.7",
            boxShadow: "0 0 10px rgba(232, 25, 44, 0.2)",
          },
        },
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        scrollLeft: {
          to: { transform: "translateX(-50%)" },
        },
        flameFicker: {
          "0%, 100%": {
            transform: "scale(1)",
            opacity: "1",
            filter: "brightness(1)",
          },
          "25%": {
            transform: "scale(1.05) rotate(1deg)",
            opacity: "0.9",
            filter: "brightness(1.1)",
          },
          "50%": {
            transform: "scale(0.98) rotate(-1deg)",
            opacity: "0.95",
            filter: "brightness(0.9)",
          },
          "75%": {
            transform: "scale(1.02) rotate(0.5deg)",
            opacity: "1",
            filter: "brightness(1.2)",
          },
        },
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-5%, -10%)" },
          "20%": { transform: "translate(-15%, 5%)" },
          "30%": { transform: "translate(7%, -25%)" },
          "40%": { transform: "translate(-5%, 25%)" },
          "50%": { transform: "translate(-15%, 10%)" },
          "60%": { transform: "translate(15%, 0%)" },
          "70%": { transform: "translate(0%, 15%)" },
          "80%": { transform: "translate(3%, 35%)" },
          "90%": { transform: "translate(-10%, 10%)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        floatReverse: "floatReverse 7s ease-in-out infinite",
        pulseGlow: "pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2s linear infinite",
        scrollLeft: "scrollLeft 30s linear infinite",
        flameFicker: "flameFicker 3s ease-in-out infinite",
        grain: "grain 8s steps(10) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
