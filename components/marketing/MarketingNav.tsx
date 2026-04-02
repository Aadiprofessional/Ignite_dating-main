"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/flame-logo";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Stories", href: "#stories" },
];

export default function MarketingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setScrolled(latest > 80);
    });
    return () => unsubscribe();
  }, [scrollY]);

  return (
    <>
      <motion.nav
        className={cn(
          "sticky top-0 z-50 border-b transition-all duration-300",
          scrolled
            ? "border-white/10 bg-[#080808CC] backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex h-20 w-full max-w-[1400px] items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <BrandLogo className="h-8 w-8" />
            <span className="font-display text-3xl font-semibold tracking-[0.14em] text-offwhite">
              HKMEETUP
            </span>
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="group relative font-body text-sm font-medium text-offwhite/75 transition hover:text-offwhite"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-[2px] w-full origin-left scale-x-0 bg-crimson transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="hkmeetup-btn rounded-full border border-white/20 px-5 py-2.5 text-sm text-offwhite/85 transition hover:border-crimson/70 hover:text-offwhite"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="hkmeetup-btn rounded-full bg-crimson px-6 py-2.5 text-sm font-semibold text-offwhite shadow-[0_0_25px_rgba(232,25,44,0.45)] transition hover:bg-crimson-dark"
            >
              Get Started Free
            </Link>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-offwhite md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-[#080808F0] backdrop-blur-xl"
          >
            <div className="flex h-full flex-col px-6 py-7">
              <div className="flex items-center justify-between">
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={() => setOpen(false)}
                >
                  <BrandLogo className="h-8 w-8" />
                  <span className="font-display text-3xl font-semibold tracking-[0.14em] text-offwhite">
                    HKMEETUP
                  </span>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-offwhite"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-16 flex flex-1 flex-col items-center justify-center gap-8">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * index }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="font-display text-5xl italic text-offwhite transition hover:text-crimson"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mb-6 grid gap-3">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="hkmeetup-btn rounded-full border border-white/20 py-3 text-center text-offwhite"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="hkmeetup-btn rounded-full bg-crimson py-3 text-center font-semibold text-offwhite"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
