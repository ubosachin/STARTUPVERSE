"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface UseSupabaseRealtimeOptions {
  conversationId: string | null;
  enabled?: boolean;
}

export function useSupabaseRealtime({ conversationId, enabled = true }: UseSupabaseRealtimeOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null);

  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const addMessage = useCallback((msg: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  useEffect(() => {
    if (!enabled || !conversationId || !hasSupabaseConfig) return;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Load initial messages
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as Message[]);
      });

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          addMessage(payload.new as Message);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [conversationId, enabled, hasSupabaseConfig, addMessage]);

  return { messages, isConnected, setMessages };
}
