"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * ThemeToggle cycles through Dark -> Light -> System.
 * Avoids hydration mismatch by only rendering the icon after mount.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const cycle = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  const activeTheme = mounted ? theme : "dark";
  const Icon = activeTheme === "light" ? Sun : activeTheme === "system" ? Monitor : Moon;
  const label =
    activeTheme === "light"
      ? "Light mode"
      : activeTheme === "system"
      ? "System mode"
      : "Dark mode";

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Switch theme (current: ${label})`}
      title={label}
      className={cn(
        "inline-flex h-10 w-10 items-center justify-center rounded-full",
        "text-muted-foreground hover:text-foreground hover:bg-muted transition-all",
        className
      )}
    >
      {mounted ? <Icon className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
