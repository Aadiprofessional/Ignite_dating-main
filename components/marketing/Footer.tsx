"use client";

import Link from "next/link";
import { Instagram, Music2, Twitter, Youtube } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Safety", href: "/safety" },
];

const companyLinks = [
  { label: "About", href: "#" },
  { label: "Blog", href: "#" },
  { label: "Careers", href: "#" },
  { label: "Press", href: "#" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms", href: "#" },
  { label: "Cookies", href: "#" },
  { label: "Guidelines", href: "#" },
];

const socialLinks = [
  { href: "#", label: "Instagram", icon: Instagram },
  { href: "#", label: "TikTok", icon: Music2 },
  { href: "#", label: "Twitter/X", icon: Twitter },
  { href: "#", label: "YouTube", icon: Youtube },
];

export default function Footer() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <motion.footer
      ref={ref}
      initial={{ opacity: 0, y: 34 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 34 }}
      transition={{ duration: 0.7 }}
      className="border-t border-white/6 bg-[#050505] pb-10 pt-20"
    >
      <div className="mx-auto w-full max-w-[1200px] px-5 md:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl text-crimson">🔥</span>
              <span className="font-display text-3xl tracking-[0.14em] text-offwhite">IGNITE</span>
            </div>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-offwhite/45">
              find your spark
            </p>
            <p className="mt-4 max-w-[260px] font-body text-sm text-offwhite/45">
              Built for this generation. Real matches, real conversations, real chemistry.
            </p>
            <div className="mt-5 flex gap-2">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    aria-label={item.label}
                    className="ignite-btn inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-offwhite/70 transition hover:border-crimson/70 hover:bg-crimson hover:text-offwhite"
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-offwhite/25">
              Product
            </h4>
            <div className="space-y-2">
              {productLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block font-body text-sm text-offwhite/40 transition hover:text-offwhite/80"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-offwhite/25">
              Company
            </h4>
            <div className="space-y-2">
              {companyLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block font-body text-sm text-offwhite/40 transition hover:text-offwhite/80"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-offwhite/25">
              Legal
            </h4>
            <div className="space-y-2">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block font-body text-sm text-offwhite/40 transition hover:text-offwhite/80"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col justify-between gap-3 border-t border-white/6 pt-8 sm:flex-row">
          <p className="font-mono text-xs text-offwhite/25">© 2025 IGNITE. Made with 🔥</p>
          <p className="font-mono text-xs text-offwhite/25">All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  );
}
