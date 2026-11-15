"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * NEXORA Theme Provider
 *
 * Wraps next-themes to give the whole app Dark / Light / System modes.
 * `attribute="class"` toggles the `.dark` class on <html>, which our
 * design tokens in globals.css respond to.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
