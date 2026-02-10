"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme: "light" | "dark";
};

export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={false}
      storageKey="satikey_theme"
    >
      {children}
    </NextThemesProvider>
  );
}
