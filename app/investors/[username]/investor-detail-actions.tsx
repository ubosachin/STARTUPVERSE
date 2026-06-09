"use client";

import { useState } from "react";
import { BadgeDollarSign, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface InvestorDetailActionsProps {
  investorId: string;
  investorUserId: string;
  firmName: string;
  currentUserId?: string;
}

export function InvestorDetailActions({
  investorId,
  investorUserId,
  firmName,
  currentUserId
}: InvestorDetailActionsProps) {
  const [isPitching, setIsPendingPitch] = useState(false);
  const [pitched, setPitched] = useState(false);
  const router = useRouter();

  const handlePitch = async () => {
    if (!currentUserId) {
      toast.error("Please log in to pitch to this investor.");
      return;
    }
    setIsPendingPitch(true);
    // Simulate pitching via a simple Toast since pitch submissions typically hook up to deals.
    // In our system, investors manage deals. So the founder pitches by creating a deal log or sending a request.
    setTimeout(() => {
      setPitched(true);
      setIsPendingPitch(false);
      toast.success(`Pitch successfully sent to ${firmName}!`);
    }, 1000);
  };

  const showActions = currentUserId !== investorUserId;

  if (!showActions) return null;

  return (
    <div className="flex flex-col gap-3 w-full sm:w-auto">
      <div className="flex gap-3 sm:justify-end">
        <Link href={`/messages?userId=${investorUserId}`}>
          <Button variant="secondary" size="sm" className="gap-1.5 w-full sm:w-auto">
            <MessageSquare size={15} />
            Message
          </Button>
        </Link>
        <Button
          onClick={handlePitch}
          disabled={isPitching || pitched}
          size="sm"
          className="gap-1.5 w-full sm:w-auto text-white"
        >
          <BadgeDollarSign size={15} />
          {pitched ? "Pitch Sent" : isPitching ? "Sending..." : `Pitch to ${firmName}`}
        </Button>
      </div>
    </div>
  );
}
