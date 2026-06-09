"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeading } from "@/components/layout/page-heading";
import { toast } from "@/components/ui/toast";
import { adminResolveReportAction, adminDeletePostAction } from "@/lib/actions/admin";

interface Report {
  id: string;
  reason: string;
  reporter: string;
  targetType: string;
  targetId: string;
  postAuthor: string;
  postContent: string;
  notes?: string;
}

interface ReportsClientProps {
  initialReports: Report[];
}

export function ReportsClient({ initialReports }: ReportsClientProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState<string | null>(null);

  const handleDismiss = async (reportId: string) => {
    setIsPending(reportId);
    try {
      const res = await adminResolveReportAction(reportId, "dismissed");
      if (res.success) {
        toast.success("Report dismissed successfully!");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to dismiss report.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsPending(null);
    }
  };

  const handleRemovePost = async (reportId: string, postId: string) => {
    if (!confirm("Are you sure you want to delete this content and resolve the report?")) {
      return;
    }
    setIsPending(reportId);
    try {
      // 1. Delete post content
      const deleteRes = await adminDeletePostAction(postId);
      if (!deleteRes.success) {
        toast.error(deleteRes.error || "Failed to delete post.");
        setIsPending(null);
        return;
      }

      // 2. Resolve the report
      const resolveRes = await adminResolveReportAction(reportId, "resolved");
      if (resolveRes.success) {
        toast.success("Flagged post successfully removed and report resolved!");
        router.refresh();
      } else {
        toast.error(resolveRes.error || "Failed to resolve report status.");
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
          <Badge>Safety Operations</Badge>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-ink">Flagged Reports</h1>
        </div>
      </div>

      <PageHeading
        eyebrow="Admin Tool"
        title="Review flagged posts and user accounts."
        description="Verify violations of platform policies, resolve reports, or delete reported post blocks."
      />

      <div className="space-y-4">
        {initialReports.length === 0 ? (
          <Card className="border-dashed border-border py-12 text-center text-xs text-muted">
            All caught up! No flagged content reports pending review.
          </Card>
        ) : (
          initialReports.map((r) => (
            <Card key={r.id} className="border border-border/80 bg-white shadow-soft">
              <CardContent className="p-5 space-y-4 text-xs">
                <div className="flex justify-between items-start gap-2 border-b border-border/40 pb-3">
                  <div className="flex items-center gap-1.5 text-danger font-semibold">
                    <AlertTriangle size={15} />
                    <span>Reported Reason: {r.reason}</span>
                  </div>
                  <span className="text-muted">Reporter: @{r.reporter}</span>
                </div>

                <div className="bg-surface p-4 rounded-xl border border-border/60 space-y-1.5">
                  <div className="flex justify-between font-bold text-ink">
                    <span>Original Author: {r.postAuthor}</span>
                    <span>Post ID: {r.targetId}</span>
                  </div>
                  <p className="text-muted leading-relaxed font-medium mt-1 whitespace-pre-wrap">{r.postContent}</p>
                </div>

                {r.notes && (
                  <div className="text-muted italic border-l-2 border-border/60 pl-2">
                    Note: {r.notes}
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDismiss(r.id)}
                    disabled={isPending === r.id}
                    className="h-8 font-semibold"
                  >
                    Dismiss Flag
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleRemovePost(r.id, r.targetId)}
                    disabled={isPending === r.id}
                    className="h-8 bg-danger hover:bg-danger/90 font-semibold gap-1 text-white"
                  >
                    <Trash2 size={12} /> Remove Content
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
