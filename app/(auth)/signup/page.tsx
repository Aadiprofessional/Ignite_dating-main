"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/shared/AuthLayout";

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  dob: z.string().refine((date) => new Date(date) < new Date(), "Date of birth must be in the past"),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log(data);
    }, 2000);
  };

  return (
    <AuthLayout quote="To love is to burn, to be on fire." author="Jane Austen">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground font-mono text-white/60">
          Enter your details below to find your spark
        </p>
      </div>
      
      <div className="grid gap-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                type="text"
                autoCapitalize="none"
                autoCorrect="off"
                disabled={isLoading}
                {...register("fullName")}
                className={errors.fullName ? "border-crimson focus-visible:ring-crimson" : ""}
              />
              {errors.fullName && (
                <p className="text-xs text-crimson">{errors.fullName.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                {...register("email")}
                className={errors.email ? "border-crimson focus-visible:ring-crimson" : ""}
              />
              {errors.email && (
                <p className="text-xs text-crimson">{errors.email.message}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={isLoading}
                {...register("password")}
                className={errors.password ? "border-crimson focus-visible:ring-crimson" : ""}
              />
              {errors.password && (
                <p className="text-xs text-crimson">{errors.password.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                disabled={isLoading}
                {...register("dob")}
                className={errors.dob ? "border-crimson focus-visible:ring-crimson" : ""}
              />
              {errors.dob && (
                <p className="text-xs text-crimson">{errors.dob.message}</p>
              )}
            </div>

            <Button disabled={isLoading} className="mt-2 bg-crimson hover:bg-crimson-dark text-white shadow-[0_0_15px_rgba(232,25,44,0.4)] transition-all duration-300">
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign Up with Email
            </Button>
          </div>
        </form>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-white/40 font-mono">
              Or continue with
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" type="button" disabled={isLoading} className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white">
            <svg className="mr-2 h-4 w-4" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
            Google
          </Button>
          <Button variant="outline" type="button" disabled={isLoading} className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white">
            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.1 1.88-2.5 5.75.1 6.84-.24.78-.51 1.57-.82 2.37zm-3.3-15.55c.31-1.68 1.52-2.9 3-3 0 1.54-.94 2.86-2.6 3.03-.2.01-.4 0-.4-.03z" />
            </svg>
            Apple
          </Button>
        </div>
        
        <p className="px-8 text-center text-sm text-white/60">
          Already have an account?{" "}
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-crimson transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
