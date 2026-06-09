"use client";

import { useEffect } from "react";
import { supabaseBrowserClient } from "@/lib/supabase/client";

export function useRealtimeChannel(channelName: string, onMessage?: (payload: unknown) => void) {
  useEffect(() => {
    const client = supabaseBrowserClient;
    if (!client) return;

    const channel = client
      .channel(channelName)
      .on("broadcast", { event: "message" }, (payload) => onMessage?.(payload))
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [channelName, onMessage]);
}
