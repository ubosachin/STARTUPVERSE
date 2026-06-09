import Link from "next/link";
import { Twitter, Linkedin, Github, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const footerLinks = {
  Platform: [
    { label: "Feed", href: "/feed" },
    { label: "Network", href: "/network" },
    { label: "Matches", href: "/matches" },
    { label: "Fundraising", href: "/fundraising" },
    { label: "Jobs", href: "/jobs" },
    { label: "Events", href: "/events" }
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" }
  ],
  Developers: [
    { label: "API", href: "#" },
    { label: "Documentation", href: "#" },
    { label: "Status", href: "#" }
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" }
  ]
};

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              The professional ecosystem for founders, investors, and startup builders.
            </p>
            <div className="mt-6 flex gap-3">
              {[Twitter, Linkedin, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid size-9 place-items-center rounded-xl border border-border bg-white text-muted transition hover:border-primary hover:text-primary"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-ink">{category}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted transition hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} StartupVerse. Built for builders.
          </p>
          <p className="text-sm text-muted">
            Powered by Next.js 15 · Supabase · Clerk · Stripe
          </p>
        </div>
      </div>
    </footer>
  );
}
