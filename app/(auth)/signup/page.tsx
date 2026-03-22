"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2, User, Mail, Lock, CalendarDays, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/shared/AuthLayout";
import { useStore } from "@/lib/store";

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  dob: z.string().refine((date) => new Date(date) < new Date(), "Date of birth must be in the past"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    setSignupError(null);
    const [firstName, ...rest] = data.fullName.trim().split(" ");
    try {
      await signup({
        email: data.email,
        password: data.password,
        first_name: firstName,
        last_name: rest.join(" "),
        birthdate: data.dob,
      });
      router.push(`/login?email=${encodeURIComponent(data.email)}&emailConfirmRequired=1`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Signup failed";
      setSignupError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout quote="To love is to burn, to be on fire." author="Jane Austen">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="mb-6 space-y-3 text-left">
          <p className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white/70">
            Start free
          </p>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-white">
            Create your account
          </h1>
          <p className="text-sm text-white/60">
            Build your profile and start meeting people with shared interests.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <motion.div className="grid gap-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {signupError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-400">
                {signupError}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="fullName" className="text-white/90">
                Full name
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  type="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={isLoading}
                  {...register("fullName")}
                  className={`pl-10 ${errors.fullName ? "border-crimson focus-visible:ring-crimson" : ""}`}
                />
              </div>
              {errors.fullName && <p className="text-xs text-crimson">{errors.fullName.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email" className="text-white/90">
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  {...register("email")}
                  className={`pl-10 ${errors.email ? "border-crimson focus-visible:ring-crimson" : ""}`}
                />
              </div>
              {errors.email && <p className="text-xs text-crimson">{errors.email.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password" className="text-white/90">
                Password
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  disabled={isLoading}
                  {...register("password")}
                  className={`pl-10 ${errors.password ? "border-crimson focus-visible:ring-crimson" : ""}`}
                />
              </div>
              {errors.password && <p className="text-xs text-crimson">{errors.password.message}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dob" className="text-white/90">
                Date of birth
              </Label>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <Input
                  id="dob"
                  type="date"
                  disabled={isLoading}
                  {...register("dob")}
                  className={`pl-10 ${errors.dob ? "border-crimson focus-visible:ring-crimson" : ""}`}
                />
              </div>
              {errors.dob && <p className="text-xs text-crimson">{errors.dob.message}</p>}
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-white/60">
              By signing up, you agree to build a respectful and genuine community experience.
            </div>

            <Button disabled={isLoading} className="mt-1 h-11 w-full bg-crimson text-white shadow-[0_0_18px_rgba(232,25,44,0.4)] transition-all duration-300 hover:bg-crimson-dark">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Sparkles className="mr-2 h-4 w-4" />
              Create account
            </Button>
          </motion.div>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-[0.16em] text-white/35">or continue with</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" type="button" disabled={isLoading} className="h-11 border-white/15 bg-transparent text-white hover:bg-white/5 hover:text-white">
            <svg className="mr-2 h-4 w-4" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
            Google
          </Button>
          <Button variant="outline" type="button" disabled={isLoading} className="h-11 border-white/15 bg-transparent text-white hover:bg-white/5 hover:text-white">
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.1 1.88-2.5 5.75.1 6.84-.24.78-.51 1.57-.82 2.37zm-3.3-15.55c.31-1.68 1.52-2.9 3-3 0 1.54-.94 2.86-2.6 3.03-.2.01-.4 0-.4-.03z" />
            </svg>
            Apple
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-white/60">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-crimson transition-colors hover:text-crimson-dark">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
