import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your StartupVerse account."
};

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left visual panel */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-dark p-12 overflow-hidden">
        <div className="gradient-mesh absolute inset-0 pointer-events-none opacity-40" />
        <div className="relative">
          <Link href="/">
            <Logo size="lg" />
          </Link>
        </div>

        <div className="relative space-y-8">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-white/50">Match Score</p>
            <p className="mt-2 text-6xl font-bold text-white">92%</p>
            <p className="mt-1 text-sm text-white/60">with your ideal co-founder</p>
            <div className="mt-4 space-y-2">
              {[{ l: "Skill synergy", v: 95 }, { l: "Vision alignment", v: 92 }, { l: "Investor relevance", v: 88 }].map((item) => (
                <div key={item.l}>
                  <div className="mb-1 flex justify-between text-[10px] font-bold text-white/50">
                    <span>{item.l}</span><span>{item.v}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10">
                    <div className="h-1.5 rounded-full bg-primary" style={{ width: `${item.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <blockquote className="text-white/80 text-sm leading-relaxed">
            "StartupVerse connected me with my co-founder in 3 weeks. The compatibility score was eerily accurate."
            <footer className="mt-3 text-white/50 text-xs font-semibold">— Maya Chen, Founder at LatticePay</footer>
          </blockquote>
        </div>

        <p className="relative text-xs text-white/30">© {new Date().getFullYear()} StartupVerse</p>
      </div>

      {/* Right auth panel */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface p-6 lg:p-12">
        {/* Mobile logo */}
        <Link href="/" className="mb-10 lg:hidden">
          <Logo size="lg" />
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-ink">Welcome back</h1>
            <p className="mt-2 text-muted">Sign in to continue building your startup future.</p>
          </div>

          <SignIn
            fallbackRedirectUrl="/feed"
            signUpUrl="/signup"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border border-border rounded-3xl bg-white p-8 w-full max-w-full",
                socialButtonsBlockButton: "rounded-2xl border border-border bg-white hover:bg-surface text-ink font-semibold h-11",
                formButtonPrimary: "rounded-2xl bg-primary hover:bg-primary-700 text-white font-semibold h-11",
                formFieldInput: "rounded-xl border border-border h-11 text-base md:text-sm focus:ring-primary focus:border-primary",
                footerActionLink: "text-primary font-semibold"
              }
            }}
          />

          <p className="mt-6 text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
