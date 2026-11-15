"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Camera, Check, Mail, MapPin, Save, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { toast } from "sonner";
import { MetricTile, NeonSurface, PageIntro, Pill, SurfaceHeader, WorkspacePage, primaryButton, secondaryButton } from "@/components/shared/workspace-ui";

export function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "Alex Johnson", email: "alex@nexora.ai", role: "Product Designer", company: "NEXORA Labs", location: "San Francisco, CA", bio: "AI enthusiast, product builder, and lifelong learner focused on useful human-centered tools." });
  const fileRef = useRef<HTMLInputElement>(null);

  function update(field: keyof typeof form, value: string) { setForm((current) => ({ ...current, [field]: value })); }
  function save() { if (!form.name.trim() || !form.email.includes("@")) { toast.error("Enter a valid name and email"); return; } setEditing(false); toast.success("Profile saved locally"); }
  function chooseAvatar(file?: File) { if (!file) return; if (avatar) URL.revokeObjectURL(avatar); setAvatar(URL.createObjectURL(file)); toast.success("Profile photo updated"); }

  return (
    <WorkspacePage>
      <PageIntro eyebrow="Account identity" title="My Profile" description="Manage your personal details and see your NEXORA workspace activity." actions={editing ? <><button onClick={() => setEditing(false)} className={secondaryButton}>Cancel</button><button onClick={save} className={primaryButton}><Save className="h-4 w-4" /> Save Profile</button></> : <button onClick={() => setEditing(true)} className={primaryButton}><UserRound className="h-4 w-4" /> Edit Profile</button>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><MetricTile label="AI Conversations" value="248" detail="+12% this month" icon={Sparkles} tone="blue" /><MetricTile label="Documents" value="24" detail="18 ready for chat" icon={Check} tone="emerald" /><MetricTile label="Member Since" value="Jan 2026" detail="4 months with NEXORA" icon={ShieldCheck} tone="violet" /><MetricTile label="Current Plan" value="Pro" detail="Renews Jun 01" icon={Mail} tone="cyan" /></div>

      <div className="grid gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
        <NeonSurface className="p-5 text-center"><div className="relative mx-auto h-28 w-28"><div className="h-full w-full overflow-hidden rounded-full border-2 border-cyan-300/50 bg-[linear-gradient(145deg,#2563eb,#7c3aed)] shadow-[0_0_34px_rgba(34,211,238,.22)]">{avatar ? <Image src={avatar} alt="Profile preview" fill unoptimized className="object-cover" /> : <div className="grid h-full place-items-center text-3xl font-black text-white">AJ</div>}</div><input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(event) => chooseAvatar(event.target.files?.[0])} /><button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full border-2 border-[#07152f] bg-blue-600 text-white" aria-label="Change profile photo"><Camera className="h-4 w-4" /></button></div><h2 className="mt-4 text-lg font-bold text-white">{form.name}</h2><p className="text-[11px] text-slate-400">{form.email}</p><div className="mt-3 flex justify-center gap-2"><Pill tone="violet">Pro member</Pill><Pill tone="green">Verified</Pill></div><div className="mt-5 space-y-2 border-t border-[#1b3674]/55 pt-4 text-left"><div className="flex items-center gap-2 text-[10px] text-slate-400"><MapPin className="h-3.5 w-3.5 text-cyan-300" />{form.location}</div><div className="flex items-center gap-2 text-[10px] text-slate-400"><ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />Account protected by 2FA</div></div></NeonSurface>

        <NeonSurface className="overflow-hidden"><SurfaceHeader title="Personal Information" description={editing ? "Fields are editable" : "Choose Edit Profile to make changes"} /><div className="grid gap-4 p-5 md:grid-cols-2"><ProfileField label="Full name" value={form.name} onChange={(value) => update("name", value)} disabled={!editing} /><ProfileField label="Email address" value={form.email} onChange={(value) => update("email", value)} disabled={!editing} type="email" /><ProfileField label="Role" value={form.role} onChange={(value) => update("role", value)} disabled={!editing} /><ProfileField label="Company" value={form.company} onChange={(value) => update("company", value)} disabled={!editing} /><ProfileField label="Location" value={form.location} onChange={(value) => update("location", value)} disabled={!editing} /><div className="md:col-span-2"><label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Bio<textarea value={form.bio} onChange={(event) => update("bio", event.target.value)} disabled={!editing} rows={4} className="mt-2 w-full resize-none rounded-xl border border-[#244484]/65 bg-[#07152f] p-3 text-[12px] leading-5 text-slate-200 outline-none disabled:cursor-default disabled:opacity-70" /></label></div></div></NeonSurface>
      </div>
    </WorkspacePage>
  );
}

function ProfileField({ label, value, onChange, disabled, type = "text" }: { label: string; value: string; onChange: (value: string) => void; disabled: boolean; type?: string }) {
  return <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className="mt-2 h-11 w-full rounded-xl border border-[#244484]/65 bg-[#07152f] px-3 text-[12px] font-medium text-slate-200 outline-none focus:border-cyan-400/50 disabled:cursor-default disabled:opacity-70" /></label>;
}
