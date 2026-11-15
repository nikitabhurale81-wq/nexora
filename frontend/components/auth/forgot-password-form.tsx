"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authInputClass } from "./auth-shell";

const schema = z.object({ email: z.string().trim().email("Enter a valid email address.") });
type ForgotValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotValues>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const onSubmit = async ({ email }: ForgotValues) => {
    await new Promise(resolve => setTimeout(resolve, 700));
    setSentTo(email);
  };

  if (sentTo) {
    return <div className="text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-emerald-300/25 bg-emerald-400/10 text-emerald-300 shadow-[0_0_28px_rgba(52,211,153,.12)]"><CheckCircle2 className="h-8 w-8" /></span><h2 className="mt-5 text-xl font-black text-white">Check your inbox</h2><p className="mt-3 text-sm leading-6 text-slate-500">If an account exists for <strong className="text-slate-300">{sentTo}</strong>, a reset link is on its way. It expires in 30 minutes.</p><button type="button" onClick={() => setSentTo("")} className="mt-6 text-xs font-bold text-cyan-300">Try another email</button><div className="mt-7 border-t border-white/10 pt-6"><Link href="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-300"><ArrowLeft className="h-4 w-4" />Back to sign in</Link></div></div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label className="block"><span className="mb-2 block text-xs font-bold text-slate-300">Account email</span><div className="relative"><Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" /><input {...register("email")} type="email" autoComplete="email" placeholder="you@example.com" className={`${authInputClass} pl-10 ${errors.email ? "border-rose-400/60" : ""}`} /></div>{errors.email && <span className="mt-1.5 block text-xs text-rose-400">{errors.email.message}</span>}</label>
      <button type="submit" disabled={isSubmitting} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-sm font-black text-white shadow-[0_0_26px_rgba(37,99,235,.3)] disabled:opacity-60">{isSubmitting ? "Sending secure link..." : "Send reset link"}<ArrowRight className="h-4 w-4" /></button>
      <Link href="/login" className="mt-7 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-cyan-300"><ArrowLeft className="h-3.5 w-3.5" />Back to sign in</Link>
    </form>
  );
}
