import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Booking, Profile } from "./useAdminData";

export const useClientProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["client-profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!userId,
  });
};

export const useClientBookings = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["client-bookings", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          sessions (
            id,
            datetime,
            session_types (*)
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Booking[];
    },
    enabled: !!userId,
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status: 'cancelled' })
        .eq("id", bookingId);
      if (error) throw error;
    },
    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({ queryKey: ["client-bookings"] });
      toast.success("Appointment cancelled successfully");
    },
    onError: (error: any) => {
      toast.error(`Cancellation failed: ${error.message}`);
    },
  });
};
