import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface Message {
  id: string;
  patient_id: string;
  sender_role: "admin" | "patient";
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface InboxEntry {
  patient_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
  last_message_at: string;
  last_message_body: string;
  unread_count: number;
}

// ── Patient hooks ──────────────────────────────────────────────────────────

export const useMyMessages = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["my-messages", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("patient_id", userId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!userId,
    refetchInterval: 15_000,
  });
};

export const useMyUnreadCount = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["my-unread-count", userId],
    queryFn: async () => {
      if (!userId) return 0;
      const { count, error } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("patient_id", userId)
        .eq("sender_role", "admin")
        .eq("is_read", false);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!userId,
    refetchInterval: 15_000,
  });
};

export const useSendPatientMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, body }: { userId: string; body: string }) => {
      const { error } = await supabase.from("messages").insert({
        patient_id: userId,
        sender_role: "patient",
        body,
        is_read: false,
      });
      if (error) throw error;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["my-messages", userId] });
    },
    onError: (err: any) => {
      toast.error(`Failed to send: ${err.message}`);
    },
  });
};

export const useMarkMyMessagesRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("patient_id", userId)
        .eq("sender_role", "admin")
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["my-messages", userId] });
      queryClient.invalidateQueries({ queryKey: ["my-unread-count", userId] });
    },
  });
};

// ── Admin hooks ────────────────────────────────────────────────────────────

export const useAdminInbox = () => {
  return useQuery({
    queryKey: ["admin-inbox"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          patient_id, sender_role, is_read, created_at, body,
          profiles!messages_patient_id_fkey(id, first_name, last_name, email, avatar_url)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Group by patient_id, keeping the most-recent entry per patient
      const map = new Map<string, InboxEntry>();
      for (const row of data as any[]) {
        const pid = row.patient_id as string;
        if (!map.has(pid)) {
          map.set(pid, {
            patient_id: pid,
            first_name: row.profiles?.first_name ?? null,
            last_name: row.profiles?.last_name ?? null,
            email: row.profiles?.email ?? null,
            avatar_url: row.profiles?.avatar_url ?? null,
            last_message_at: row.created_at,
            last_message_body: row.body,
            unread_count: 0,
          });
        }
        // Count unread patient messages (the ones admin hasn't read)
        if (row.sender_role === "patient" && !row.is_read) {
          map.get(pid)!.unread_count++;
        }
      }

      return Array.from(map.values()).sort(
        (a, b) =>
          new Date(b.last_message_at).getTime() -
          new Date(a.last_message_at).getTime()
      );
    },
    refetchInterval: 15_000,
  });
};

export const usePatientThread = (patientId: string | undefined) => {
  return useQuery({
    queryKey: ["admin-thread", patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("patient_id", patientId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!patientId,
    refetchInterval: 15_000,
  });
};

export const useSendAdminMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      patientId,
      body,
    }: {
      patientId: string;
      body: string;
    }) => {
      const { error } = await supabase.from("messages").insert({
        patient_id: patientId,
        sender_role: "admin",
        body,
        is_read: false,
      });
      if (error) throw error;
    },
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-thread", patientId] });
      queryClient.invalidateQueries({ queryKey: ["admin-inbox"] });
    },
    onError: (err: any) => {
      toast.error(`Failed to send: ${err.message}`);
    },
  });
};

export const useMarkPatientMessagesRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patientId: string) => {
      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("patient_id", patientId)
        .eq("sender_role", "patient")
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: (_, patientId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-thread", patientId] });
      queryClient.invalidateQueries({ queryKey: ["admin-inbox"] });
    },
  });
};
