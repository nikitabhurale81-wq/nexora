"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, ChevronDown, Sparkles, Zap } from "lucide-react";
import { PageHero } from "./section-heading";

const plans = [
  { name: "Free", copy: "For exploring ideas and lighter everyday work.", monthly: 0, yearly: 0, cta: "Start free", href: "/signup", features: ["10 AI conversations per day", "3 document uploads", "Core AI models", "Basic data analysis", "7-day chat history"] },
  { name: "Pro", copy: "For people who use AI as part of their real workflow.", monthly: 12, yearly: 9, cta: "Start 14-day trial", href: "/signup", popular: true, features: ["Unlimited AI conversations", "100 GB document library", "Advanced AI models", "Full Data Lab and Code Studio", "Voice Room and private memory", "Priority processing"] },
  { name: "Team", copy: "For teams building a shared knowledge advantage.", monthly: 29, yearly: 23, cta: "Start team trial", href: "/signup", features: ["Everything in Pro", "Up to 10 workspace members", "Shared projects and assistants", "Admin controls and analytics", "Central billing", "Priority support"] },
];

const faqs = [
  ["Can I try Pro before paying?", "Yes. Every new Pro workspace includes a 14-day trial with no credit card required. If you do not choose a plan, your workspace moves to Free."],
  ["What happens when I reach a Free limit?", "Your existing work stays available. Daily conversation limits reset the next day, or you can upgrade whenever you are ready."],
  ["Can I switch or cancel at any time?", "Yes. You can change plans or cancel from workspace billing. Your paid features remain active until the end of the current billing period."],
  ["Is my content used to train public models?", "No. Your workspace content is private and is not used to train public AI models. Team plans add more access and retention controls."],
  ["Do you offer education or nonprofit pricing?", "Yes. Eligible schools, students, and nonprofit organizations can contact us for reduced pricing."],
];

export function PricingPage() {
  const [yearly, setYearly] = useState(true);
  return (
    <>
      <PageHero eyebrow="Simple, transparent pricing" title="Invest in better" accent="momentum." description="Start free, upgrade when NEXORA becomes part of your flow, and change plans whenever your work changes.">
        <div className="mt-8 inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/[.035] p-1">
          <button type="button" onClick={() => setYearly(false)} className={`rounded-lg px-5 py-2.5 text-sm font-bold ${!yearly ? "bg-blue-600 text-white shadow-lg" : "text-slate-500"}`}>Monthly</button>
          <button type="button" onClick={() => setYearly(true)} className={`rounded-lg px-5 py-2.5 text-sm font-bold ${yearly ? "bg-blue-600 text-white shadow-lg" : "text-slate-500"}`}>Yearly <span className={yearly ? "text-cyan-200" : "text-emerald-400"}>−20%</span></button>
        </div>
      </PageHero>

      <section className="px-5 pb-24 sm:px-8 lg:px-10 lg:pb-32">
        <div className="mx-auto grid max-w-7xl items-stretch gap-5 lg:grid-cols-3">
          {plans.map(plan => {
            const price = yearly ? plan.yearly : plan.monthly;
            return <div key={plan.name} className={`relative flex flex-col rounded-2xl border p-7 sm:p-8 ${plan.popular ? "border-cyan-300/45 bg-[linear-gradient(155deg,rgba(13,45,99,.96),rgba(27,13,70,.95))] shadow-[0_0_45px_rgba(37,99,235,.18)] lg:-translate-y-3" : "border-blue-400/15 bg-[linear-gradient(145deg,rgba(8,25,63,.82),rgba(5,13,37,.9))]"}`}>
              {plan.popular && <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#041126]"><Sparkles className="h-3 w-3" />Most popular</span>}
              <h2 className="text-xl font-black text-white">{plan.name}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">{plan.copy}</p>
              <div className="mt-6 flex items-end gap-1"><span className="text-5xl font-black tracking-tight text-white">${price}</span><span className="pb-1.5 text-sm text-slate-500">/ user / mo</span></div>
              {yearly && price > 0 ? <p className="mt-2 text-xs text-emerald-400">Billed ${price * 12} yearly</p> : <p className="mt-2 text-xs text-slate-600">{price === 0 ? "Free forever" : "Billed monthly"}</p>}
              <Link href={plan.href} className={`mt-7 flex h-12 items-center justify-center rounded-xl text-sm font-black ${plan.popular ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-[0_0_22px_rgba(59,130,246,.3)]" : "border border-white/15 bg-white/[.04] text-white hover:bg-white/[.08]"}`}>{plan.cta}<ArrowRight className="ml-2 h-4 w-4" /></Link>
              <div className="my-7 h-px bg-white/10" /><p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">What&apos;s included</p><ul className="mt-5 space-y-3">{plan.features.map(feature => <li key={feature} className="flex gap-3 text-sm text-slate-300"><span className="mt-.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cyan-400/10"><Check className="h-3 w-3 text-cyan-300" /></span>{feature}</li>)}</ul>
            </div>;
          })}
        </div>
        <div className="mx-auto mt-8 flex max-w-7xl flex-col items-start justify-between gap-6 rounded-2xl border border-violet-400/20 bg-violet-500/[.06] p-6 sm:flex-row sm:items-center sm:p-8"><div className="flex gap-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-500/15 text-violet-300"><Zap className="h-5 w-5" /></span><div><h3 className="font-black text-white">Enterprise</h3><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">Custom capacity, SSO, advanced security, dedicated support, and commercial terms for larger organizations.</p></div></div><Link href="/contact" className="shrink-0 rounded-xl border border-violet-300/30 px-5 py-3 text-sm font-black text-violet-200 hover:bg-violet-400/10">Contact sales</Link></div>
      </section>

      <section className="border-t border-blue-400/10 bg-[#03091c] px-5 py-24 sm:px-8 lg:px-10"><div className="mx-auto max-w-3xl"><div className="text-center"><p className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">Questions, answered</p><h2 className="mt-4 text-3xl font-black text-white sm:text-4xl">Pricing FAQ</h2></div><div className="mt-10 space-y-3">{faqs.map(([question, answer]) => <details key={question} className="group rounded-xl border border-blue-400/15 bg-blue-950/20 p-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-white">{question}<ChevronDown className="h-4 w-4 shrink-0 text-cyan-300 transition-transform group-open:rotate-180" /></summary><p className="mt-4 border-t border-white/5 pt-4 text-sm leading-6 text-slate-400">{answer}</p></details>)}</div></div></section>
    </>
  );
}
