import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "StartupVerse | Founder Network & Startup Ecosystem",
    template: "%s | StartupVerse"
  },
  description:
    "The premium startup ecosystem where founders, investors, co-founders, advisors, and builders connect, match, fundraise, hire, and grow together.",
  keywords: ["startup", "founder", "investor", "co-founder", "fundraising", "networking", "startup jobs"],
  authors: [{ name: "StartupVerse" }],
  creator: "StartupVerse",
  openGraph: {
    title: "StartupVerse — Where Startups Meet Capital & Talent",
    description: "Join the most premium startup ecosystem for founders, investors, advisors, and builders.",
    type: "website",
    siteName: "StartupVerse"
  },
  twitter: {
    card: "summary_large_image",
    title: "StartupVerse",
    description: "The premium startup ecosystem for founders and investors."
  },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} font-sans antialiased`}>
          {children}
          <ToastProvider />
        </body>
      </html>
    </ClerkProvider>
  );
}
