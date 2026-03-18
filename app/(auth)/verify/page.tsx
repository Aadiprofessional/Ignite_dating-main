"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FlameLogo } from "@/components/ui/flame-logo";

export default function VerifyPage() {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    // Take the last character if user types fast or something
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.every((char) => !isNaN(Number(char)))) {
      const newOtp = [...otp];
      pastedData.forEach((char, index) => {
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate verification
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 2000);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-900/50 p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <FlameLogo className="mb-6 h-12 w-12 text-crimson" />
          <h1 className="text-2xl font-serif font-bold text-white">Verify your email</h1>
          <p className="mt-2 text-sm text-white/60">
            We sent a code to <span className="text-white">user@example.com</span>
          </p>
        </div>

        {isSuccess ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-8"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-green-500">
              <Check className="h-10 w-10" />
            </div>
            <p className="mt-4 text-lg font-medium text-white">Verified Successfully!</p>
            <Link href="/setup">
              <Button className="mt-6 bg-crimson hover:bg-crimson-dark">
                Continue to Setup
              </Button>
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-6">
            <div className="flex justify-center gap-2 sm:gap-4">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  value={data}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  className="h-12 w-10 rounded-md border border-white/10 bg-white/5 text-center text-lg font-bold text-white transition-all focus:border-crimson focus:outline-none focus:ring-1 focus:ring-crimson sm:h-14 sm:w-12"
                />
              ))}
            </div>

            <Button
              type="submit"
              disabled={isLoading || otp.some((val) => !val)}
              className="w-full bg-crimson py-6 text-lg hover:bg-crimson-dark shadow-[0_0_15px_rgba(232,25,44,0.3)]"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Verify Code"
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-white/40">Didn't receive code? </span>
              {countdown > 0 ? (
                <span className="text-white/60">Resend in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setCountdown(60)}
                  className="text-crimson hover:underline"
                >
                  Resend Code
                </button>
              )}
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
