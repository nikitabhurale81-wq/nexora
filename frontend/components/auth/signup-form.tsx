"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { authInputClass } from "./auth-shell";
import { SocialAuth } from "./social-auth";
import { supabase } from "@/lib/supabase/client";
import { getMe, setToken } from "@/lib/api/services";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters.").regex(/[A-Z]/, "Add one uppercase letter.").regex(/[0-9]/, "Add one number."),
  terms: z.boolean().refine(value => value, "Accept the terms to continue."),
});
type SignupValues = z.infer<typeof schema>;

export function SignupForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<SignupValues>({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", password: "", terms: false } });
  const password = useWatch({ control, name: "password" }) || "";
  const strength = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password)].filter(Boolean).length;

  const onSubmit = async (values: SignupValues) => {
    if (!supabase) {
      toast.error("Signup is not configured yet. Set the Supabase key to enable it.");
      return;
    }
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { name: values.name } },
    });
    if (error) {
      // Rate limit hit — give a friendly message
      if (error.status === 429) {
        toast.error("Too many signup attempts. Please wait a few minutes and try again.");
        return;
      }
      toast.error(error.message);
      return;
    }

    // Check if user already exists (Supabase returns identities:[])
    if (data.user && data.user.identities && data.user.identities.length === 0) {
      toast.error("An account with this email already exists. Please sign in instead.");
      router.push("/login");
      return;
    }

    const token = data.session?.access_token;
    if (token) {
      setToken(token);
      try {
        await getMe();
      } catch {
        /* non-fatal */
      }
      toast.success(`Welcome to NEXORA, ${values.name.split(" ")[0]}!`);
      router.push("/dashboard");
    } else {
      toast.success("Account created! Check your email to confirm, then sign in.");
      router.push("/login");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-3.5">
        <AuthField label="Full name" error={errors.name?.message} icon={<UserRound className="h-4 w-4" />}><input {...register("name")} autoComplete="name" placeholder="Alex Johnson" className={`${authInputClass} pl-10 ${errors.name ? "border-rose-400/60" : ""}`} /></AuthField>
        <AuthField label="Email address" error={errors.email?.message} icon={<Mail className="h-4 w-4" />}><input {...register("email")} type="email" autoComplete="email" placeholder="you@example.com" className={`${authInputClass} pl-10 ${errors.email ? "border-rose-400/60" : ""}`} /></AuthField>
        <AuthField label="Create password" error={errors.password?.message} icon={<LockKeyhole className="h-4 w-4" />}><input {...register("password")} type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="8+ characters" className={`${authInputClass} px-10 ${errors.password ? "border-rose-400/60" : ""}`} /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-cyan-300">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></AuthField>
        {password && <div className="flex items-center gap-2"><div className="flex flex-1 gap-1">{[1,2,3].map(level => <span key={level} className={`h-1 flex-1 rounded-full ${strength >= level ? level === 1 ? "bg-rose-400" : level === 2 ? "bg-amber-400" : "bg-emerald-400" : "bg-white/10"}`} />)}</div><span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">{["Weak","Fair","Strong"][Math.max(0, strength - 1)]}</span></div>}
      </div>
      <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-xs leading-5 text-slate-500"><input {...register("terms")} type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 rounded border-blue-400/30 bg-blue-950 accent-blue-500" /><span>I agree to the <a href="#" className="text-slate-300 hover:text-cyan-300">Terms</a> and <a href="#" className="text-slate-300 hover:text-cyan-300">Privacy Policy</a>.</span></label>{errors.terms && <span className="mt-1 block text-xs text-rose-400">{errors.terms.message}</span>}
      <button type="submit" disabled={isSubmitting} className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-violet-600 text-sm font-black text-white shadow-[0_0_26px_rgba(37,99,235,.32)] disabled:cursor-wait disabled:opacity-60">{isSubmitting ? "Creating workspace..." : "Create free account"}<ArrowRight className="h-4 w-4" /></button>
      <div className="my-5"><SocialAuth /></div>
      <p className="text-center text-xs text-slate-500">Already have an account? <Link href="/login" className="font-black text-cyan-300">Sign in</Link></p>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-700"><Check className="h-3 w-3 text-emerald-400" />No credit card required</p>
    </form>
  );
}

function AuthField({ label, error, icon, children }: { label: string; error?: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-300">{label}</span><div className="relative"><span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">{icon}</span>{children}</div>{error && <span className="mt-1 block text-xs text-rose-400">{error}</span>}</label>;
}
