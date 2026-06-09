import { Suspense } from "react";
import { ChatPanel } from "@/components/messaging/chat-panel";
import { PageHeading } from "@/components/layout/page-heading";
import { Loader2 } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="py-5">
      <PageHeading
        eyebrow="Messages"
        title="Realtime conversations for founders, investors, and teams."
        description="One-to-one chat, typing indicators, seen status, file uploads, emoji support, and Supabase Realtime channels."
      />
      <Suspense fallback={
        <div className="flex h-[450px] items-center justify-center rounded-2xl border border-border/80 bg-white shadow-soft">
          <div className="flex flex-col items-center gap-2 text-muted">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-xs font-semibold uppercase tracking-wider">Loading conversation panel...</span>
          </div>
        </div>
      }>
        <ChatPanel />
      </Suspense>
    </div>
  );
}
