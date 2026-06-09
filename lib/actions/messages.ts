"use server";

import { createSupabaseServiceClient, getCurrentDbUser } from "@/lib/supabase/server";

/**
 * Send a message within a conversation thread.
 * Supports text and optional media attachments (uploaded via Cloudinary).
 */
export async function sendMessageAction(conversationId: string, content: string, mediaUrl?: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Not authenticated" };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured" };

  const { data, error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: dbUser.id,
    content: content.trim(),
    media_url: mediaUrl || null
  }).select("*").single();

  if (error) return { success: false, error: error.message };

  // Update conversation updated_at for sorting lists
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return { success: true, message: data };
}

/**
 * Create a conversation thread between the current user and another user.
 * Returns the existing conversation ID if one already exists.
 */
export async function createConversationAction(otherUserId: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Not authenticated" };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured" };

  // Fetch conversations that current user is part of
  const { data: myConvs } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", dbUser.id);

  if (myConvs && myConvs.length > 0) {
    const myConvIds = myConvs.map((e) => e.conversation_id);
    
    // Check if the other user shares any of these conversation IDs
    const { data: shared } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", otherUserId)
      .in("conversation_id", myConvIds);

    if (shared && shared.length > 0) {
      return { success: true, conversationId: shared[0].conversation_id };
    }
  }

  // Create a brand new conversation
  const { data: conversation, error: convErr } = await supabase
    .from("conversations")
    .insert({})
    .select("id")
    .single();

  if (convErr) return { success: false, error: convErr.message };

  // Insert participant records for both users
  await supabase.from("conversation_participants").insert([
    { conversation_id: conversation.id, user_id: dbUser.id },
    { conversation_id: conversation.id, user_id: otherUserId }
  ]);

  return { success: true, conversationId: conversation.id };
}

/**
 * Mark all messages in a conversation as read.
 */
export async function markConversationReadAction(conversationId: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { success: false, error: "Not authenticated" };

  const supabase = createSupabaseServiceClient();
  if (!supabase) return { success: false, error: "Database not configured" };

  await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", dbUser.id);

  await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", dbUser.id);

  return { success: true };
}

/**
 * Fetch all conversations for the current logged in user.
 */
export async function getConversationsAction() {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return [];

  const supabase = createSupabaseServiceClient();
  if (!supabase) return [];

  // Fetch participant entries for the current user
  const { data: participants, error } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", dbUser.id);

  if (error || !participants || participants.length === 0) return [];

  const convIds = participants.map((p) => p.conversation_id);

  // Fetch conversation records, ordered by update frequency
  const { data: conversations } = await supabase
    .from("conversations")
    .select("id, updated_at")
    .in("id", convIds)
    .order("updated_at", { ascending: false });

  if (!conversations || conversations.length === 0) return [];

  // Fetch other participant profile details
  const { data: partners } = await supabase
    .from("conversation_participants")
    .select(`
      conversation_id,
      user_id,
      profiles (
        full_name,
        bio,
        avatar_url
      ),
      users (
        username,
        role
      )
    `)
    .in("conversation_id", convIds)
    .neq("user_id", dbUser.id);

  // Fetch last message for each thread
  const { data: messages } = await supabase
    .from("messages")
    .select("conversation_id, content, created_at, sender_id, is_read")
    .in("conversation_id", convIds)
    .order("created_at", { ascending: true });

  const lastMsgMap = new Map<string, any>();
  const unreadMap = new Map<string, number>();

  messages?.forEach((msg) => {
    lastMsgMap.set(msg.conversation_id, msg);
    if (msg.sender_id !== dbUser.id && !msg.is_read) {
      unreadMap.set(msg.conversation_id, (unreadMap.get(msg.conversation_id) || 0) + 1);
    }
  });

  const partnerMap = new Map<string, any>();
  partners?.forEach((p) => {
    partnerMap.set(p.conversation_id, p);
  });

  const results = conversations.map((conv) => {
    const partner = partnerMap.get(conv.id);
    const lastMsg = lastMsgMap.get(conv.id);
    const unreadCount = unreadMap.get(conv.id) || 0;

    const partnerProfile = partner?.profiles;
    const partnerUser = partner?.users;

    return {
      id: conv.id,
      name: partnerProfile?.full_name || partnerUser?.username || "Unknown Member",
      avatarUrl: partnerProfile?.avatar_url || "",
      title: partnerProfile?.bio?.split(".")[0] || partnerUser?.role || "Member",
      lastMessage: lastMsg ? lastMsg.content : "No messages yet",
      lastTime: lastMsg
        ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "",
      unread: unreadCount > 0,
      unreadCount,
      otherUserId: partner?.user_id || ""
    };
  });

  return results;
}
