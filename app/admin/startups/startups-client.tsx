"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, ShieldCheck, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeading } from "@/components/layout/page-heading";
import { toast } from "@/components/ui/toast";
import { adminToggleVerifyStartupAction } from "@/lib/actions/admin";

interface Startup {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  website: string;
  stage: string;
  is_verified: boolean;
  founderName: string;
}

interface StartupsClientProps {
  initialStartups: Startup[];
}

export function StartupsClient({ initialStartups }: StartupsClientProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState<string | null>(null);

  const handleToggleVerify = async (id: string, name: string) => {
    setIsPending(id);
    try {
      const res = await adminToggleVerifyStartupAction(id);
      if (res.success) {
        toast.success(`Verification status updated for ${name}`);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update verification status.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsPending(null);
    }
  };

  return (
    <main className="py-5 space-y-6 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="icon" onClick={() => router.push("/admin")} className="size-9 rounded-xl">
          <ArrowLeft size={16} />
        </Button>
        <div>
          <Badge>Startup Auditing</Badge>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-ink">Verify Startups</h1>
        </div>
      </div>

      <PageHeading
        eyebrow="Admin Tool"
        title="Verify and manage startup profiles."
        description="Verify team members lists, review traction validation, and allocate official check-mark badges to companies."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {initialStartups.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-sm text-muted">
            No startups listed yet.
          </div>
        ) : (
          initialStartups.map((s) => (
            <Card key={s.id} className="border border-border bg-white shadow-soft transition-all">
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-5">
                <div>
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="font-bold text-ink leading-snug flex items-center gap-1">
                        {s.name}
                        {s.is_verified && <CheckCircle2 size={14} className="text-success fill-success/10" />}
                      </h3>
                      <p className="text-[10px] text-muted font-bold mt-1">Founder: {s.founderName}</p>
                    </div>
                    <Badge className="bg-surface text-ink border font-semibold text-[9px] capitalize">{s.stage}</Badge>
                  </div>
                  <p className="text-xs text-muted leading-relaxed mt-3">{s.tagline}</p>
                  {s.website && (
                    <p className="text-[10px] text-primary font-bold mt-2 flex items-center gap-1">
                      <Globe size={11} /> {s.website}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-border/40 flex justify-between items-center gap-2">
                  <Button
                    variant={s.is_verified ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => handleToggleVerify(s.id, s.name)}
                    disabled={isPending === s.id}
                    className="h-8 text-[10px] font-semibold gap-1"
                  >
                    <ShieldCheck size={12} />
                    {s.is_verified ? "Revoke Verification" : "Approve & Verify"}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => router.push(`/startups/${s.slug}`)} className="h-8 text-[10px] font-semibold">
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
