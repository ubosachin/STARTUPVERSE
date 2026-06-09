"use client";

import { useState } from "react";
import { BadgeDollarSign, MessageSquare, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { toggleFollowStartupAction } from "@/lib/actions/startups";
import { expressInterestAction } from "@/lib/actions/deals";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface StartupDetailActionsProps {
  startupId: string;
  founderId: string;
  founderUsername: string;
  hasActiveRound: boolean;
  roundId?: string;
  isFollowingInitial: boolean;
  currentUserId?: string;
}

export function StartupDetailActions({
  startupId,
  founderId,
  founderUsername,
  hasActiveRound,
  roundId,
  isFollowingInitial,
  currentUserId
}: StartupDetailActionsProps) {
  const [isFollowing, setIsFollowing] = useState(isFollowingInitial);
  const [isPendingFollow, setIsPendingFollow] = useState(false);
  const [isPendingInterest, setIsPendingInterest] = useState(false);
  const [expressedInterest, setExpressedInterest] = useState(false);
  const router = useRouter();

  const handleFollow = async () => {
    if (!currentUserId) {
      toast.error("Please log in to follow startups.");
      return;
    }
    setIsPendingFollow(true);
    try {
      const res = await toggleFollowStartupAction(startupId);
      if (res.success) {
        setIsFollowing(!isFollowing);
        toast.success(isFollowing ? "Unfollowed startup" : "Following startup!");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to toggle follow.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsPendingFollow(false);
    }
  };

  const handleExpressInterest = async () => {
    if (!currentUserId) {
      toast.error("Please log in to express interest.");
      return;
    }
    if (!roundId) return;
    setIsPendingInterest(true);
    try {
      const res = await expressInterestAction(startupId, roundId);
      if (res.success) {
        setExpressedInterest(true);
        toast.success("Successfully expressed interest in this funding round!");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to express interest.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsPendingInterest(false);
    }
  };

  const showHeaderActions = currentUserId !== founderId;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Header action buttons */}
      {showHeaderActions && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:justify-end">
          <Button
            variant={isFollowing ? "secondary" : "primary"}
            size="sm"
            onClick={handleFollow}
            disabled={isPendingFollow}
            className="gap-1.5 min-w-[90px]"
          >
            {isFollowing ? <Check size={14} /> : <Plus size={14} />}
            {isFollowing ? "Following" : "Follow"}
          </Button>

          <Link href={`/messages?userId=${founderId}`}>
            <Button variant="secondary" size="sm" className="gap-1.5">
              <MessageSquare size={14} />
              Contact Founder
            </Button>
          </Link>
        </div>
      )}

      {/* Express Interest Button - Rendered in Sidebar if there is an active round */}
      {hasActiveRound && roundId && showHeaderActions && (
        <div className="mt-4">
          <Button
            onClick={handleExpressInterest}
            disabled={isPendingInterest || expressedInterest}
            className="w-full gap-1.5 text-white"
          >
            <BadgeDollarSign size={15} />
            {expressedInterest
              ? "Interest Expressed"
              : isPendingInterest
              ? "Submitting..."
              : "Express interest"}
          </Button>
        </div>
      )}
    </div>
  );
}
