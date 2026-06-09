"use client";

import { useState } from "react";
import { UserPlus, UserCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { sendConnectionAction } from "@/lib/actions/connections";
import { useRouter } from "next/navigation";

interface ConnectButtonProps {
  userId: string;
  initialStatus: string | null;
  initialSender: string | null;
  currentUserId?: string;
}

export function ConnectButton({ userId, initialStatus, initialSender, currentUserId }: ConnectButtonProps) {
  const [status, setStatus] = useState<string | null>(initialStatus);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  if (currentUserId === userId) {
    return null;
  }

  const handleConnect = async () => {
    setIsPending(true);
    try {
      const res = await sendConnectionAction(userId);
      if (res.success) {
        setStatus("pending");
        toast.success("Connection request sent successfully!");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to send connection request.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  if (status === "accepted") {
    return (
      <Button variant="secondary" size="sm" className="gap-1.5" disabled>
        <UserCheck size={15} />
        Connected
      </Button>
    );
  }

  if (status === "pending") {
    const isSender = initialSender === currentUserId;
    return (
      <Button variant="secondary" size="sm" className="gap-1.5" disabled>
        <Clock size={15} />
        {isSender ? "Request Sent" : "Respond in Network"}
      </Button>
    );
  }

  return (
    <Button size="sm" className="gap-1.5" onClick={handleConnect} disabled={isPending}>
      <UserPlus size={15} />
      {isPending ? "Connecting..." : "Connect"}
    </Button>
  );
}
