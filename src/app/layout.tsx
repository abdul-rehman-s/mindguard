import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/auth-provider";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: "MindGuard AI — Protect Your Attention",
  description: "MindGuard AI is your premium Attention Operating System. Stay focused, track progress, and build better habits with AI-powered coaching.",
  keywords: ["MindGuard", "focus", "productivity", "deep work", "attention", "timer", "pomodoro", "AI coach"],
  icons: {
    icon: [
      { url: "/icons/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
  },
  openGraph: {
    title: "MindGuard AI — Protect Your Attention",
    description: "Your AI-powered Attention Operating System. Stay focused, build habits, achieve more.",
    images: [{ url: "/logo.png", width: 512, height: 512 }],
    type: "website",
    siteName: "MindGuard AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "MindGuard AI — Protect Your Attention",
    description: "Your AI-powered Attention Operating System. Stay focused, build habits, achieve more.",
    images: [{ url: "/logo.png" }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AppProviders>
          {children}
          <Toaster theme="dark" richColors position="bottom-right" />
        </AppProviders>
      </body>
    </html>
  );
}
