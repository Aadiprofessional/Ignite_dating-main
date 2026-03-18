"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthLayout } from "@/components/shared/AuthLayout";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setAuthError(null);
    
    // Simulate API call with error
    setTimeout(() => {
      setIsLoading(false);
      // Randomly fail to demonstrate error shake
      if (Math.random() > 0.5) {
        setAuthError("Invalid email or password");
      } else {
        console.log("Logged in:", data);
      }
    }, 1500);
  };

  return (
    <AuthLayout quote="We loved with a love that was more than love." author="Edgar Allan Poe">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground font-mono text-white/60">
          Enter your email to sign in to your account
        </p>
      </div>
      
      <div className="grid gap-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <motion.div 
            className="grid gap-4"
            animate={authError ? { x: [0, -10, 10, -10, 10, 0] } : {}}
            transition={{ duration: 0.5 }}
          >
            {authError && (
              <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md text-center">
                {authError}
              </div>
            )}
            
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-crimson hover:text-crimson-dark underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                disabled={isLoading}
                {...register("password")}
                className={errors.password ? "border-crimson focus-visible:ring-crimson" : ""}
              />
              {errors.password && (
                <p className="text-xs text-crimson">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white/80"
              >
                Remember me
              </label>
            </div>

            <Button disabled={isLoading} className="mt-2 bg-crimson hover:bg-crimson-dark text-white shadow-[0_0_15px_rgba(232,25,44,0.4)] transition-all duration-300">
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Sign In with Email
            </Button>
          </motion.div>
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
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="underline underline-offset-4 hover:text-crimson transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
