import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// --- Types ---

export interface SessionType {
  id: string;
  title: string;
  description: string | null;
  pricing: number;
  duration_minutes: number;
  location: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: 'user' | 'client' | 'admin' | 'banned';
  avatar_url: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  session_id: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'unpaid' | 'pending' | 'paid';
  created_at: string;
  profiles: Profile;
  sessions: {
    id: string;
    datetime: string;
    session_types: SessionType;
  };
}

export interface AdminSession {
  id: string;
  session_type_id: string;
  datetime: string;
  max_slots: number;
  booked_slots: number;
  status: 'active' | 'cancelled' | 'completed';
  cancel_reason: string | null;
  created_at: string;
  session_types: SessionType;
}

// --- Session Types Hooks ---

export const useSessionTypes = () => {
  return useQuery({
    queryKey: ["session-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_types")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SessionType[];
    },
  });
};

export const useCreateSessionType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newSession: Omit<SessionType, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("session_types")
        .insert([newSession])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-types"] });
      toast.success("Session type created successfully");
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

export const useUpdateSessionType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SessionType> & { id: string }) => {
      const { data, error } = await supabase
        .from("session_types")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-types"] });
      toast.success("Session type updated");
    },
  });
};

export const useDeleteSessionType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("session_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-types"] });
      toast.success("Session type deleted");
    },
  });
};

// --- Sessions (Instances) Hooks ---

export const useAdminSessions = () => {
  return useQuery({
    queryKey: ["admin-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sessions")
        .select("*, session_types(*)")
        .order("datetime", { ascending: true });
      if (error) throw error;
      return data as unknown as AdminSession[];
    },
  });
};

export const useUpdateSessionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, cancel_reason }: { id: string; status: AdminSession['status']; cancel_reason?: string }) => {
      const { data, error } = await supabase
        .from("sessions")
        .update({ status, cancel_reason })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
      toast.success("Session status updated");
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sessions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sessions"] });
      toast.success("Scheduled session removed");
    },
  });
};

// --- Clients Hooks ---

export const useAdminClients = () => {
  return useQuery({
    queryKey: ["admin-clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });
};

export const useUpdateClientRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Profile['role'] }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateClientProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Profile> & { id: string }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      toast.success("Client profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Update Error: ${error.message}`);
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-clients"] });
      toast.success("Client record archived/deleted");
    },
    onError: (error: any) => {
      toast.error(`Deletion Error: ${error.message}`);
    },
  });
};

// --- Bookings Hooks ---

export const useAdminBookings = () => {
  return useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          profiles (*),
          sessions (
            id,
            datetime,
            session_types (*)
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Booking[];
    },
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Booking['status'] }) => {
      const { data, error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("Booking status updated");
    },
  });
};

export const useUpdateBookingPaymentStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payment_status }: { id: string; payment_status: Booking['payment_status'] }) => {
      const { data, error } = await supabase
        .from("bookings")
        .update({ payment_status })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast.success("Payment status updated");
    },
    onError: (error: any) => {
      toast.error(`Payment Error: ${error.message}`);
    },
  });
};
