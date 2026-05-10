import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  useAdminInbox,
  usePatientThread,
  useSendAdminMessage,
  useMarkPatientMessagesRead,
} from "@/hooks/useMessages";
import { cn } from "@/lib/utils";

const AdminMessages = () => {
  const { data: inbox, isLoading: loadingInbox } = useAdminInbox();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const { data: thread, isLoading: loadingThread } = usePatientThread(
    selectedPatientId ?? undefined
  );
  const sendMessage = useSendAdminMessage();
  const markRead = useMarkPatientMessagesRead();
  const [body, setBody] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const selectedPatient = inbox?.find((p) => p.patient_id === selectedPatientId);

  // Auto-select first patient once inbox loads
  useEffect(() => {
    if (inbox?.length && !selectedPatientId) {
      setSelectedPatientId(inbox[0].patient_id);
    }
  }, [inbox, selectedPatientId]);

  // Mark patient messages as read when opening a thread
  useEffect(() => {
    if (selectedPatientId) {
      markRead.mutate(selectedPatientId);
    }
  }, [selectedPatientId]);

  // Scroll to bottom when thread updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread]);

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setBody("");
  };

  const handleSend = async () => {
    const trimmed = body.trim();
    if (!trimmed || !selectedPatientId || sendMessage.isPending) return;
    await sendMessage.mutateAsync({ patientId: selectedPatientId, body: trimmed });
    setBody("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <DashboardLayout isAdmin={true}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Messages</h2>
          <p className="text-slate-500 mt-1">Two-way communication with your patients.</p>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex"
             style={{ height: "calc(100vh - 220px)" }}>
          {/* ── Inbox list ─────────────────────────────────────────────── */}
          <div className="w-72 shrink-0 border-r border-slate-100 flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Patient Inbox
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingInbox ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : !inbox?.length ? (
                <div className="py-16 px-6 text-center">
                  <MessageSquare className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">No messages yet.</p>
                </div>
              ) : (
                inbox.map((entry) => (
                  <button
                    key={entry.patient_id}
                    onClick={() => handleSelectPatient(entry.patient_id)}
                    className={cn(
                      "w-full text-left px-4 py-4 flex items-start gap-3 border-b border-slate-50 hover:bg-slate-50/80 transition-colors",
                      selectedPatientId === entry.patient_id &&
                        "bg-primary/5 border-l-2 border-l-primary"
                    )}
                  >
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={entry.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs font-bold bg-slate-100 text-slate-500">
                        {entry.first_name?.charAt(0)}
                        {entry.last_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {entry.first_name} {entry.last_name}
                        </p>
                        {entry.unread_count > 0 && (
                          <Badge className="bg-primary text-white border-none rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center text-[10px] font-black shrink-0">
                            {entry.unread_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {entry.last_message_body}
                      </p>
                      <p className="text-[10px] text-slate-300 mt-1 font-medium">
                        {format(new Date(entry.last_message_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* ── Thread panel ───────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedPatient ? (
              <>
                {/* Thread header */}
                <div className="h-16 border-b border-slate-100 flex items-center gap-4 px-6 shrink-0">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={selectedPatient.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs font-bold bg-slate-100 text-slate-500">
                      {selectedPatient.first_name?.charAt(0)}
                      {selectedPatient.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-none">
                      {selectedPatient.first_name} {selectedPatient.last_name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedPatient.email}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                  {loadingThread ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : !thread?.length ? (
                    <div className="text-center py-16 text-slate-400 text-sm italic">
                      No messages yet. Start the conversation.
                    </div>
                  ) : (
                    thread.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          msg.sender_role === "admin" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                            msg.sender_role === "admin"
                              ? "bg-primary text-white rounded-br-sm"
                              : "bg-slate-100 text-slate-800 rounded-bl-sm"
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                          <p
                            className={cn(
                              "text-[10px] mt-1.5 font-medium",
                              msg.sender_role === "admin"
                                ? "text-white/60 text-right"
                                : "text-slate-400"
                            )}
                          >
                            {format(new Date(msg.created_at), "h:mm a")}
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
                    placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-medium">
                    Select a patient to view their messages
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminMessages;
