"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { AuthLayout } from "@/components/shared/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout quote="Love recognizes no barriers." author="Maya Angelou">
      <div className="rounded-3xl border border-white/10 bg-[#0e0e0e]/90 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:p-8">
        <div className="mb-6 space-y-2 text-center">
          <h1 className="font-display text-3xl text-white">Reset your password</h1>
          <p className="text-sm text-white/70">
            Enter your email and we&apos;ll help you get back into your account.
          </p>
        </div>
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/90">
              Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-10"
              />
            </div>
          </div>
          <Button type="button" className="h-11 w-full bg-crimson text-white hover:bg-crimson-dark">
            Continue
          </Button>
        </form>
        <p className="mt-5 text-center text-sm text-white/65">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-crimson transition-colors hover:text-crimson-dark">
            Back to login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
