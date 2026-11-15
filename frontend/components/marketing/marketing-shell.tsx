"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight, AtSign, BriefcaseBusiness, Code2 } from "lucide-react";
import { useState } from "react";
import { Brand } from "./brand";

const navigation = [
  { label: "Features", href: "/features" },
  { label: "Solutions", href: "/solutions" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function MarketingShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-slate-100 selection:bg-cyan-400/25">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_-5%,rgba(37,99,235,0.24),transparent_26%),radial-gradient(circle_at_88%_12%,rgba(109,40,217,0.2),transparent_28%)]" />
      <header className="fixed inset-x-0 top-0 z-50 border-b border-blue-400/10 bg-[#020617]/75 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Brand />
          <nav aria-label="Primary navigation" className="hidden items-center gap-7 lg:flex">
            {navigation.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-2 text-sm font-medium transition-colors ${
                    active ? "text-cyan-300" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute inset-x-0 -bottom-[19px] h-px bg-cyan-300 shadow-[0_0_8px_#22d3ee]" />
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl border border-cyan-300/40 bg-[linear-gradient(100deg,#2563eb,#7c3aed)] px-4 py-2.5 text-sm font-bold text-white shadow-[0_0_24px_rgba(37,99,235,0.3)] hover:brightness-110"
            >
              Start free <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
            className="grid h-10 w-10 place-items-center rounded-xl border border-blue-300/15 bg-blue-500/10 text-slate-100 lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-blue-400/10 bg-[#040b22]/98 px-5 py-5 lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1" aria-label="Mobile navigation">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                    pathname === item.href ? "bg-blue-500/15 text-cyan-300" : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-bold text-white">Sign in</Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)} className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-center text-sm font-bold text-white">Start free</Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="relative pt-[72px]">{children}</main>

      <footer className="relative border-t border-blue-400/10 bg-[#030817]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="grid gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr]">
            <div>
              <Brand />
              <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500">
                One intelligent workspace for ideas, documents, data, code, and everything you create next.
              </p>
            </div>
            <FooterGroup title="Product" links={[["Features", "/features"], ["Solutions", "/solutions"], ["Pricing", "/pricing"], ["Guest mode", "/guest"]]} />
            <FooterGroup title="Company" links={[["About", "/about"], ["Contact", "/contact"], ["Sign in", "/login"], ["Create account", "/signup"]]} />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">Connect</p>
              <div className="mt-4 flex gap-2">
                {[
                  { Icon: AtSign, label: "X", href: "https://x.com" },
                  { Icon: BriefcaseBusiness, label: "LinkedIn", href: "https://linkedin.com" },
                  { Icon: Code2, label: "GitHub", href: "https://github.com" },
                ].map(({ Icon, label, href }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-500 hover:border-cyan-400/30 hover:text-cyan-300">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2025 NEXORA AI. Built for better thinking.</p>
            <div className="flex gap-5"><a href="#" className="hover:text-slate-300">Privacy</a><a href="#" className="hover:text-slate-300">Terms</a><a href="#" className="hover:text-slate-300">Security</a></div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterGroup({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-300">{title}</p>
      <div className="mt-4 flex flex-col gap-3">
        {links.map(([label, href]) => <Link key={href} href={href} className="text-sm text-slate-500 hover:text-cyan-300">{label}</Link>)}
      </div>
    </div>
  );
}
