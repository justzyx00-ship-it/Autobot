import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { getThemeCookie } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://satikey.store"),
  title: {
    default: "SatiKey - Digital Services Store",
    template: "%s | SatiKey",
  },
  description:
    "Website ban dich vu so cao cap: Discord Nitro, ChatGPT Plus, Spotify, Netflix va nhieu dich vu mo rong cho creator.",
  keywords: [
    "SatiKey",
    "digital services",
    "discord nitro",
    "chatgpt plus",
    "spotify premium",
    "capcut pro",
  ],
  openGraph: {
    title: "SatiKey - Digital Services Store",
    description: "Dich vu so nhanh, gon, uy tin cho creator va nguoi dung Discord.",
    url: "https://satikey.store",
    siteName: "SatiKey",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieTheme = await getThemeCookie();
  const defaultTheme = cookieTheme === "light" ? "light" : "dark";

  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <ThemeProvider defaultTheme={defaultTheme}>
          <div className="min-h-screen bg-background text-foreground">
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
