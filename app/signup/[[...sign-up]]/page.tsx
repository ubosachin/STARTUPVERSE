"use client";

import { SignUp } from "@clerk/nextjs";
import { useState } from "react";
import Link from "next/link";
import { Sparkles, Users, Handshake, BadgeDollarSign, Rocket, Award } from "lucide-react";

const roles = [
  { icon: Rocket, label: "Founder", desc: "Building a startup", value: "founder" },
  { icon: BadgeDollarSign, label: "Investor", desc: "Deploying capital", value: "investor" },
  { icon: Handshake, label: "Co-Founder", desc: "Looking to join a team", value: "founder" },
  { icon: Users, label: "Builder", desc: "Technical contributor", value: "builder" },
  { icon: Award, label: "Advisor", desc: "Strategic guidance", value: "advisor" }
];

export default function SignupPage() {
  const [selectedLabel, setSelectedLabel] = useState(roles[0].label);
  const selectedRoleValue = roles.find(r => r.label === selectedLabel)?.value || "builder";

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left role picker panel */}
      <div className="relative hidden lg:flex flex-col justify-between bg-surface border-r border-border p-12 overflow-hidden">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-white">
              <Sparkles size={18} />
            </span>
            <span className="font-bold text-ink text-lg">StartupVerse</span>
          </Link>

          <div className="mt-12">
            <h2 className="text-2xl font-bold tracking-tight text-ink">Join as...</h2>
            <p className="mt-2 text-muted text-sm">Your role shapes your experience on StartupVerse.</p>
            <div className="mt-8 space-y-3">
              {roles.map((role) => {
                const isSelected = selectedLabel === role.label;
                return (
                <div
                  key={role.label}
                  onClick={() => setSelectedLabel(role.label)}
                  className={`flex items-center gap-4 rounded-2xl border p-4 transition cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-white hover:border-primary/30 hover:bg-primary/5"
                  }`}
                >
                  <div className={`grid size-10 place-items-center rounded-xl ${isSelected ? "bg-primary text-white" : "bg-surface text-muted"}`}>
                    <role.icon size={18} />
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${isSelected ? "text-primary" : "text-ink"}`}>{role.label}</p>
                    <p className="text-xs text-muted">{role.desc}</p>
                  </div>
                  {isSelected && (
                    <span className="ml-auto text-xs font-bold text-primary bg-primary/10 rounded-lg px-2 py-1">Selected</span>
                  )}
                </div>
              )})}
            </div>
          </div>
        </div>

        <p className="text-xs text-muted">You can change your role anytime in Settings → Profile.</p>
      </div>

      {/* Right auth panel */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 lg:p-12">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-white">
            <Sparkles size={18} />
          </span>
          <span className="font-bold text-ink text-lg">StartupVerse</span>
        </Link>

        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-ink">Create your account</h1>
            <p className="mt-2 text-muted">Join 12,400+ founders, investors, and builders.</p>
          </div>

          <SignUp
            fallbackRedirectUrl="/feed"
            signInUrl="/login"
            unsafeMetadata={{ role: selectedRoleValue }}
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border border-border rounded-3xl bg-surface p-8 w-full max-w-full",
                socialButtonsBlockButton: "rounded-2xl border border-border bg-white hover:bg-surface text-ink font-semibold h-11",
                formButtonPrimary: "rounded-2xl bg-primary hover:bg-primary-700 text-white font-semibold h-11",
                formFieldInput: "rounded-xl border border-border h-11 text-sm focus:ring-primary focus:border-primary",
                footerActionLink: "text-primary font-semibold"
              }
            }}
          />

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
