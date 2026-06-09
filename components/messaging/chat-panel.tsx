"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Smile, Upload, Send, ShieldAlert, CheckCheck, Loader2, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSupabaseRealtime } from "@/lib/hooks/useSupabaseRealtime";
import { 
  getConversationsAction, 
  sendMessageAction, 
  markConversationReadAction 
} from "@/lib/actions/messages";
import { MediaUploader } from "@/components/ui/media-uploader";

const EMOJIS = ["👍", "🚀", "💡", "🐂", "👏", "🤝", "🎉", "🔥", "❤️", "🎯"];

export function ChatPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeConversationId = searchParams.get("conversationId");

  const [conversations, setConversations] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [attachedUrl, setAttachedUrl] = useState("");
  const [attachedPublicId, setAttachedPublicId] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Bind to realtime messages stream via hook
  const { messages, setMessages } = useSupabaseRealtime({ 
    conversationId: activeConversationId 
  });

  useEffect(() => {
    loadConversationsList();
  }, [activeConversationId]);

  useEffect(() => {
    if (activeConversationId) {
      markAsRead(activeConversationId);
    }
  }, [activeConversationId, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  async function loadConversationsList() {
    setIsLoadingConvs(true);
    try {
      const list = await getConversationsAction();
      setConversations(list);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setIsLoadingConvs(false);
    }
  }

  async function markAsRead(convId: string) {
    try {
      await markConversationReadAction(convId);
    } catch (err) {
      console.error("Failed to mark conversation read:", err);
    }
  }

  function handleSelectConversation(id: string) {
    router.push(`/messages?conversationId=${id}`);
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if ((!inputText.trim() && !attachedUrl) || !activeConversationId) return;

    const textToSend = inputText.trim() || (attachedUrl ? "📎 Sent an attachment" : "");
    const mediaUrlToSend = attachedUrl || undefined;

    setInputText("");
    setAttachedUrl("");
    setAttachedPublicId("");
    setShowUploader(false);

    try {
      const res = await sendMessageAction(activeConversationId, textToSend, mediaUrlToSend);
      if (res.success && res.message) {
        // Append message to state to give instant/optimistic loading visual
        setMessages((prev) => {
          if (prev.some((m) => m.id === res.message.id)) return prev;
          return [...prev, res.message];
        });
        
        // Refresh conversations list
        loadConversationsList();

        // Simulated reply typing state
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
        }, 1400);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  }

  function handleAddEmoji(emoji: string) {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  }

  function handleUploadSuccess(url: string, publicId: string) {
    setAttachedUrl(url);
    setAttachedPublicId(publicId);
  }

  function handleUploadDelete() {
    setAttachedUrl("");
    setAttachedPublicId("");
  }

  function scrollToBottom() {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const myUserId = messages.length > 0 ? messages.find(m => m.sender_id !== activeConv?.otherUserId)?.sender_id : "user-current";

  return (
    <Card className="border border-border/80 shadow-soft overflow-hidden h-[calc(100vh-16rem)] min-h-[480px]">
      <CardContent className="p-0 flex h-full">
        
        {/* Left Side: Conversations list */}
        <aside className="w-80 border-r border-border flex flex-col h-full bg-surface/30 shrink-0">
          <div className="p-4 border-b border-border bg-white flex items-center justify-between">
            <h2 className="font-bold text-ink">Conversations</h2>
            <Badge className="bg-primary/10 text-primary border-0 font-semibold">
              {conversations.length} Active
            </Badge>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {isLoadingConvs ? (
              <div className="p-6 text-center text-xs text-muted flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin text-primary" />
                <span>Loading threads...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted">
                No active messages. Connect with founders in the directory to start a chat thread.
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = c.id === activeConversationId;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectConversation(c.id)}
                    className={`w-full text-left p-4 hover:bg-white transition flex items-start gap-3 relative ${
                      isSelected ? "bg-white border-l-4 border-primary" : ""
                    }`}
                  >
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink text-xs font-bold text-white uppercase overflow-hidden">
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt={c.name} className="size-full object-cover" />
                      ) : (
                        c.name.split(" ").map((n: string) => n[0]).join("")
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-baseline gap-2">
                        <span className={`text-xs font-bold truncate ${c.unread ? "text-primary font-extrabold" : "text-ink"}`}>
                          {c.name}
                        </span>
                        <span className="text-[10px] text-muted whitespace-nowrap">{c.lastTime}</span>
                      </div>
                      <p className="text-[11px] text-muted truncate mt-0.5">{c.title}</p>
                      <p className={`text-xs truncate mt-2 ${c.unread ? "text-primary font-bold" : "text-muted"}`}>
                        {c.lastMessage}
                      </p>
                    </div>
                    {c.unread && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 grid size-2.5 place-items-center rounded-full bg-primary" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Side: Message Thread */}
        <section className="flex-1 flex flex-col h-full bg-white relative min-w-0">
          {activeConversationId && activeConv ? (
            <>
              {/* Active Conversation Header */}
              <div className="p-4 border-b border-border bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-ink text-xs font-bold text-white uppercase overflow-hidden">
                    {activeConv.avatarUrl ? (
                      <img src={activeConv.avatarUrl} alt={activeConv.name} className="size-full object-cover" />
                    ) : (
                      activeConv.name.split(" ").map((n: string) => n[0]).join("")
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-ink leading-tight">{activeConv.name}</h3>
                    <p className="text-[10px] text-muted font-medium mt-0.5">{activeConv.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-success font-semibold bg-success/10 px-2 py-0.5 rounded-full">
                  <span className="size-1.5 rounded-full bg-success animate-pulse" />
                  Online
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface/10 no-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-muted p-8">
                    <p className="text-xs">No messages yet. Send a greeting to start building relation.</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isSentByMe = m.sender_id !== activeConv.otherUserId;
                    const mediaUrl = (m as any).media_url;

                    return (
                      <div key={m.id} className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs shadow-line relative ${
                          isSentByMe 
                            ? "bg-primary text-white rounded-br-none" 
                            : "bg-surface text-ink border border-border/80 rounded-bl-none"
                        }`}>
                          {/* Text content */}
                          {m.content && <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>}
                          
                          {/* Cloudinary media attachment */}
                          {mediaUrl && (
                            <div className="mt-2 pt-2 border-t border-white/20">
                              {mediaUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)/i) || mediaUrl.includes("/image/upload/") ? (
                                <img src={mediaUrl} alt="Chat attachment" className="rounded-lg max-h-40 object-cover" />
                              ) : mediaUrl.match(/\.(mp4|webm)/i) || mediaUrl.includes("/video/upload/") ? (
                                <video src={mediaUrl} controls className="rounded-lg max-h-40" />
                              ) : (
                                <div className="flex items-center gap-2 bg-black/10 p-2 rounded-lg text-[10px]">
                                  <FileText size={16} />
                                  <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-85 truncate max-w-[120px]">
                                    Open Attachment
                                  </a>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="mt-1 flex items-center justify-end gap-1 opacity-70 text-[9px] select-none text-right">
                            <span>
                              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isSentByMe && (
                              <CheckCheck size={10} className={m.is_read ? "text-sky-300" : "text-white/60"} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Simulated typing state */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-surface border border-border/85 rounded-bl-none flex items-center gap-1">
                      <Loader2 className="animate-spin text-muted" size={12} />
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wide">Typing...</span>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Message Composer Controls */}
              <div className="border-t border-border bg-white p-4">
                {showUploader && (
                  <div className="mb-3">
                    <MediaUploader
                      folder="messages"
                      onUploadSuccess={handleUploadSuccess}
                      onDeleteSuccess={handleUploadDelete}
                      defaultValue={attachedUrl}
                      defaultPublicId={attachedPublicId}
                      label="Upload file attachment"
                    />
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={() => setShowUploader(!showUploader)}
                    title="Attach File"
                    className={`rounded-xl shrink-0 ${showUploader ? "bg-surface border-primary" : ""}`}
                  >
                    <Upload size={15} />
                  </Button>
                  
                  <input
                    type="text"
                    required={!attachedUrl}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Send message securely..."
                    className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 text-xs placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                  />

                  {/* Emoji Trigger */}
                  <div className="relative">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="rounded-xl shrink-0"
                    >
                      <Smile size={15} />
                    </Button>
                    
                    {showEmojiPicker && (
                      <div className="absolute bottom-12 right-0 bg-white border border-border p-2 rounded-xl shadow-soft flex gap-1.5 z-20">
                        {EMOJIS.map((e) => (
                          <button
                            key={e}
                            type="button"
                            onClick={() => handleAddEmoji(e)}
                            className="hover:scale-125 transition text-base"
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button type="submit" size="icon" className="rounded-xl shrink-0">
                    <Send size={15} />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted">
              <ShieldAlert size={34} className="text-muted/60" />
              <h3 className="mt-4 font-bold text-ink">Select a conversation</h3>
              <p className="mt-1 text-xs text-muted max-w-xs mx-auto">
                Pick an existing message thread on the left pane or calculate founder compatibility to initialize new channels.
              </p>
            </div>
          )}
        </section>

      </CardContent>
    </Card>
  );
}
