"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Bell, CircleHelp, Menu, Search, Settings2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/shared/theme-toggle";

interface HeaderProps {
  onMenuClick?: () => void;
}

const actionClass =
  "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#1b3470]/80 bg-[#07122f]/90 text-slate-300 shadow-[inset_0_0_12px_rgba(59,130,246,0.05)] transition-all hover:border-cyan-400/45 hover:text-cyan-300 hover:shadow-[0_0_16px_rgba(34,211,238,0.14)]";

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    router.push(`/chat?prompt=${encodeURIComponent(value)}`);
  }

  return (
    <header className="relative z-30 flex h-[72px] shrink-0 items-center border-b border-[#13275a]/65 bg-[#03091b]/88 px-3 backdrop-blur-xl sm:px-5 lg:px-6">
      <div className="flex w-full min-w-0 items-center gap-3 lg:gap-5">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className={`${actionClass} md:hidden`}
        >
          <Menu className="h-4 w-4" />
        </button>

        <form onSubmit={handleSearch} className="relative min-w-0 flex-1 sm:max-w-[500px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            placeholder="Search anything..."
            aria-label="Search workspace"
            className="h-10 w-full rounded-full border border-[#1b3472]/80 bg-[#0b1738]/90 pl-11 pr-4 text-[13px] text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/55 focus:ring-2 focus:ring-cyan-400/10"
          />
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            aria-label="Show notifications"
            className={`${actionClass} relative`}
            onClick={() => toast("You have 3 new notifications")}
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-pink-500 shadow-[0_0_7px_#ec4899]" />
          </button>

          <ThemeToggle className={actionClass} />

          <Link href="/help" aria-label="Open help center" className={`${actionClass} hidden xs:grid sm:grid`}>
            <CircleHelp className="h-4 w-4" />
          </Link>

          <Link href="/settings" aria-label="Open settings" className={`${actionClass} hidden sm:grid`}>
            <Settings2 className="h-4 w-4" />
          </Link>

          <Link
            href="/profile"
            aria-label="Open profile"
            className={`${actionClass} border-violet-400/35 bg-[linear-gradient(145deg,#2563eb,#7c3aed)] text-white shadow-[0_0_16px_rgba(124,58,237,0.22)]`}
          >
            <UserRound className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
