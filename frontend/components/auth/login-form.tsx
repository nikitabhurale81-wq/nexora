"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authInputClass } from "./auth-shell";
import { SocialAuth } from "./social-auth";
import { supabase } from "@/lib/supabase/client";
import { getMe, setToken } from "@/lib/api/services";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must contain at least 8 characters."),
  remember: z.boolean(),
});
type LoginValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "", remember: true } });

  const onSubmit = async (values: LoginValues) => {
    if (!supabase) {
      toast.error("Login is not configured yet. Set the Supabase key to enable sign-in.");
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    const token = data.session?.access_token;
    if (!token) {
      toast.error("Sign-in succeeded but no session was returned.");
      return;
    }
    setToken(token);
    try {
      await getMe(); // provision/sync the user row in the backend
    } catch {
      /* non-fatal: profile sync can happen on next request */
    }
    toast.success("Welcome back. Opening your workspace...");
    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-4">
        <label className="block"><span className="mb-2 block text-xs font-bold text-slate-300">Email address</span><div className="relative"><Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" /><input {...register("email")} type="email" autoComplete="email" placeholder="you@example.com" className={`${authInputClass} pl-10 ${errors.email ? "border-rose-400/60" : ""}`} /></div>{errors.email && <span className="mt-1.5 block text-xs text-rose-400">{errors.email.message}</span>}</label>
        <label className="block"><span className="mb-2 block text-xs font-bold text-slate-300">Password</span><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" /><input {...register("password")} type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" className={`${authInputClass} px-10 ${errors.password ? "border-rose-400/60" : ""}`} /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-cyan-300">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>{errors.password && <span className="mt-1.5 block text-xs text-rose-400">{errors.password.message}</span>}</label>
      </div>
      <div className="mt-4 flex items-center justify-between"><label className="flex cursor-pointer items-center gap-2 text-xs text-slate-500"><input {...register("remember")} type="checkbox" className="h-4 w-4 rounded border-blue-400/30 bg-blue-950 accent-blue-500" />Remember me</label><Link href="/forgot-password" className="text-xs font-bold text-cyan-300 hover:text-cyan-200">Forgot password?</Link></div>
      <button type="submit" disabled={isSubmitting} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 text-sm font-black text-white shadow-[0_0_26px_rgba(37,99,235,.32)] disabled:cursor-wait disabled:opacity-60">{isSubmitting ? "Opening workspace..." : "Sign in"}<ArrowRight className="h-4 w-4" /></button>
      <div className="my-6"><SocialAuth /></div>
      <p className="text-center text-xs text-slate-500">New to NEXORA? <Link href="/signup" className="font-black text-cyan-300 hover:text-cyan-200">Create an account</Link></p>
      <p className="mt-3 text-center text-xs text-slate-600">or <Link href="/guest" className="font-bold text-violet-300 hover:text-violet-200">try it as a guest</Link></p>
    </form>
  );
}
