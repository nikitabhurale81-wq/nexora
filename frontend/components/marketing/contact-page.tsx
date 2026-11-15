"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Building2, CheckCircle2, Headphones, Mail, MessageSquareText, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { GlowCard, PageHero } from "./section-heading";

const schema = z.object({
  name: z.string().trim().min(2, "Tell us your name."),
  email: z.string().trim().email("Enter a valid work email."),
  topic: z.string().min(1, "Choose a topic."),
  company: z.string().trim().max(80, "Company name is too long.").optional(),
  message: z.string().trim().min(20, "Add a little more detail (at least 20 characters).").max(1000, "Keep your message under 1,000 characters."),
});

type ContactValues = z.infer<typeof schema>;

export function ContactPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", topic: "", company: "", message: "" },
  });

  const onSubmit = async (values: ContactValues) => {
    await new Promise(resolve => setTimeout(resolve, 650));
    toast.success(`Thanks, ${values.name.split(" ")[0]}. Your message is in our inbox.`);
    reset();
  };

  return (
    <>
      <PageHero eyebrow="Contact NEXORA" title="Let’s build something" accent="clearer." description="Talk with our team about a workflow, a team rollout, or anything you want to understand before getting started." />
      <section className="px-5 pb-24 sm:px-8 lg:px-10 lg:pb-32">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[.72fr_1.28fr]">
          <div className="space-y-4">
            <GlowCard className="p-6"><span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/10 text-cyan-300"><MessageSquareText className="h-5 w-5" /></span><h2 className="mt-5 text-lg font-black text-white">Product questions</h2><p className="mt-2 text-sm leading-6 text-slate-400">Get a clear answer about features, models, privacy, or how NEXORA fits your workflow.</p><a href="mailto:hello@nexora.ai" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-cyan-300">hello@nexora.ai <ArrowRight className="h-4 w-4" /></a></GlowCard>
            <GlowCard className="p-6"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-400/10 text-violet-300"><Building2 className="h-5 w-5" /></span><h2 className="mt-5 text-lg font-black text-white">Teams & enterprise</h2><p className="mt-2 text-sm leading-6 text-slate-400">Discuss security, rollout planning, capacity, and commercial terms with a product specialist.</p><a href="mailto:sales@nexora.ai" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-violet-300">sales@nexora.ai <ArrowRight className="h-4 w-4" /></a></GlowCard>
            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[.045] p-6"><div className="flex items-start gap-3"><Headphones className="mt-0.5 h-5 w-5 text-emerald-300" /><div><p className="text-sm font-black text-white">Already a customer?</p><p className="mt-1 text-xs leading-5 text-slate-500">For account help, email <a className="text-emerald-300" href="mailto:support@nexora.ai">support@nexora.ai</a>. We usually reply within one business day.</p></div></div></div>
          </div>

          <GlowCard className="p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white"><Mail className="h-5 w-5" /></span><div><h2 className="text-xl font-black text-white">Send us a message</h2><p className="text-sm text-slate-500">We usually reply within one business day.</p></div></div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2"><Field label="Your name" error={errors.name?.message}><input {...register("name")} autoComplete="name" placeholder="Alex Johnson" className={inputClass(Boolean(errors.name))} /></Field><Field label="Work email" error={errors.email?.message}><input {...register("email")} type="email" autoComplete="email" placeholder="alex@company.com" className={inputClass(Boolean(errors.email))} /></Field></div>
              <div className="grid gap-5 sm:grid-cols-2"><Field label="What can we help with?" error={errors.topic?.message}><select {...register("topic")} className={inputClass(Boolean(errors.topic))}><option value="">Choose a topic</option><option value="product">Product question</option><option value="sales">Team or enterprise</option><option value="partnership">Partnership</option><option value="press">Press and media</option><option value="other">Something else</option></select></Field><Field label="Company (optional)" error={errors.company?.message}><input {...register("company")} autoComplete="organization" placeholder="Acme, Inc." className={inputClass(Boolean(errors.company))} /></Field></div>
              <Field label="How can we help?" error={errors.message?.message}><textarea {...register("message")} rows={6} placeholder="Tell us about your team, workflow, or question..." className={`${inputClass(Boolean(errors.message))} min-h-36 resize-y py-3`} /></Field>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><p className="flex items-center gap-2 text-xs text-slate-600"><CheckCircle2 className="h-4 w-4 text-emerald-400" />Your details stay private.</p><button type="submit" disabled={isSubmitting} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 text-sm font-black text-white shadow-[0_0_24px_rgba(37,99,235,.28)] disabled:cursor-wait disabled:opacity-60">{isSubmitting ? "Sending..." : "Send message"}<Send className="h-4 w-4" /></button></div>
            </form>
          </GlowCard>
        </div>
      </section>
    </>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-xs font-bold text-slate-300">{label}</span>{children}{error && <span className="mt-1.5 block text-xs text-rose-400">{error}</span>}</label>;
}

function inputClass(hasError: boolean) {
  return `w-full rounded-xl border bg-[#050e29] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-slate-700 focus:ring-2 ${hasError ? "border-rose-400/60 focus:border-rose-400 focus:ring-rose-400/15" : "border-blue-400/15 focus:border-cyan-300/50 focus:ring-cyan-300/10"}`;
}
