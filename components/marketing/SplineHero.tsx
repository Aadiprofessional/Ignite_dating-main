"use client";

import dynamic from "next/dynamic";

const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 hidden items-center justify-center lg:flex">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-crimson/30" />
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-crimson border-r-crimson" />
        <span className="font-display text-3xl text-offwhite">🔥</span>
      </div>
    </div>
  ),
});

export default function SplineHero() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-y-0 right-0 hidden w-[55%] lg:block">
        <Spline
          scene="https://prod.spline.design/9951u9cumiw2Ehj8/scene.splinecode"
          className="h-full w-full"
        />
      </div>

      <div className="absolute inset-y-0 left-0 hidden w-[68%] bg-gradient-to-r from-[#080808] from-40% via-[#080808]/80 to-transparent lg:block" />
      <div className="absolute inset-x-0 bottom-0 hidden h-48 bg-gradient-to-t from-[#080808] to-transparent lg:block" />

      <div className="absolute inset-0 block lg:hidden">
        <div className="absolute left-[-25%] top-10 h-72 w-72 rounded-full bg-crimson/35 blur-[100px] animate-float" />
        <div className="absolute right-[-30%] top-44 h-80 w-80 rounded-full bg-crimson-dark/35 blur-[120px] animate-floatReverse" />
        <div className="absolute bottom-[-20%] left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-crimson/20 blur-[100px] animate-pulseGlow" />
      </div>
    </div>
  );
}
