import { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  useMyMessages,
  useSendPatientMessage,
  useMarkMyMessagesRead,
} from "@/hooks/useMessages";
import { cn } from "@/lib/utils";

const ClientMessages = () => {
  const { user } = useAuth();
  const { data: messages, isLoading } = useMyMessages(user?.id);
  const markRead = useMarkMyMessagesRead();
  const sendMessage = useSendPatientMessage();
  const [body, setBody] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Mark admin messages as read on mount
  useEffect(() => {
    if (user?.id) markRead.mutate(user.id);
  }, [user?.id]);

  // Scroll to bottom whenever the thread updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const trimmed = body.trim();
    if (!trimmed || !user?.id || sendMessage.isPending) return;
    await sendMessage.mutateAsync({ userId: user.id, body: trimmed });
    setBody("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout isAdmin={false}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Messages</h1>
          <p className="text-slate-500 mt-1 font-medium">
            Your conversation with the practice.
          </p>
        </div>

        <div
          className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col"
          style={{ height: "calc(100vh - 220px)" }}
        >
          {/* Thread */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !messages?.length ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <MessageSquare className="h-12 w-12 text-slate-200 mb-4" />
                <p className="font-bold text-slate-700">No messages yet</p>
                <p className="text-sm text-slate-400 mt-1 max-w-xs">
                  Send a message below and the practice will get back to you.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.sender_role === "patient" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.sender_role === "patient"
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-slate-100 text-slate-800 rounded-bl-sm"
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                    <p
                      className={cn(
                        "text-[10px] mt-1.5 font-medium",
                        msg.sender_role === "patient"
                          ? "text-white/60 text-right"
                          : "text-slate-400"
                      )}
                    >
                      {format(new Date(msg.created_at), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Reply box */}
          <div className="border-t border-slate-100 p-4 flex gap-3 items-end shrink-0">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message to the practice… (Enter to send, Shift+Enter for newline)"
              className="resize-none rounded-2xl border-slate-200 text-sm focus-visible:ring-primary/20"
              rows={2}
            />
            <Button
              onClick={handleSend}
              disabled={!body.trim() || sendMessage.isPending}
              className="h-[72px] w-12 rounded-2xl p-0 shadow-lg shadow-primary/20 shrink-0"
            >
              {sendMessage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientMessages;
