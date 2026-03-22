"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check, ShieldCheck, Users } from "lucide-react";

function FlameMark() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-8 w-8 text-crimson animate-flameFicker"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M33.68 4C37.79 14.03 48 17.4 48 30.63C48 41.36 40.08 50 31.5 50C22.93 50 16 42.49 16 33.39C16 25.14 20.95 19.05 26.95 14.15C26.24 19.18 28.4 22.68 31.92 24.89C33.5 19.47 34.31 13.51 33.68 4Z"
        fill="currentColor"
      />
      <path
        d="M31.89 26.29C36.84 29.08 40 34.29 40 39.88C40 47.05 34.4 52 29.03 52C23.66 52 20 47.52 20 41.72C20 36.83 22.18 33.12 26.1 29.84C26.04 33.5 27.97 36.6 31.89 39.01V26.29Z"
        fill="#F5F0EB"
        fillOpacity="0.6"
      />
    </svg>
  );
}

interface AuthLayoutProps {
  children: React.ReactNode;
  quote?: string;
  author?: string;
}

export function AuthLayout({ children, quote, author }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#090909] text-foreground">
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-[1400px] lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden flex-col justify-between border-r border-white/10 px-10 py-12 lg:flex xl:px-16"
        >
          <Link href="/" className="flex w-fit items-center gap-2">
            <FlameMark />
            <span className="font-display text-3xl font-semibold tracking-[0.14em] text-offwhite">
              IGNITE
            </span>
          </Link>
          <div className="mx-auto w-full max-w-[420px]">
            <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.03] p-4 backdrop-blur-xl sm:p-5">
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
                  <div className="absolute inset-x-0 bottom-0 flex h-full flex-col justify-end bg-gradient-to-t from-black/75 via-black/35 to-transparent p-4">
                    <span className="mb-3 w-fit rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-offwhite/80">
                      Match preview
                    </span>
                    <p className="font-display text-2xl leading-none text-offwhite">
                      Maya, 27
                    </p>
                    <p className="mt-1 text-sm text-offwhite/75">
                      Coffee walks, live gigs, and spontaneous road trips
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <Check className="h-4 w-4 text-crimson" />
                    <span className="text-sm text-offwhite/85">Personalized compatibility suggestions</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <Check className="h-4 w-4 text-crimson" />
                    <span className="text-sm text-offwhite/85">Verified profiles and safety-first design</span>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <Check className="h-4 w-4 text-crimson" />
                    <span className="text-sm text-offwhite/85">Events and sparks tailored to your city</span>
                  </div>
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
          </div>
          <blockquote className="max-w-xl space-y-2 border-l-2 border-crimson/70 pl-4">
            <p className="text-lg font-serif text-white/85">
              &ldquo;{quote || "Love is not about finding the right person, but creating a right relationship. It's not about how much love you have in the beginning but how much love you build till the end."}&rdquo;
            </p>
            <footer className="text-xs uppercase tracking-[0.14em] text-crimson">
              {author || "The Ignite Team"}
            </footer>
          </blockquote>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="flex items-center justify-center px-4 py-8 sm:px-8 lg:px-10 xl:px-16"
        >
          <div className="w-full max-w-[480px]">
            <Link href="/" className="mb-8 flex items-center justify-center gap-2 text-white lg:hidden">
              <FlameMark />
              <span className="font-display text-3xl font-semibold tracking-[0.14em] text-offwhite">
                IGNITE
              </span>
            </Link>
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
