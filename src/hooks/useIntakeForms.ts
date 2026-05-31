import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface PatientIntake {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  phone: string;
  email: string;
  address: string;
  insurance_provider: string | null;
  insurance_member_id: string | null;
  insurance_group_number: string | null;
  reason_for_visit: string;
  current_medications: string | null;
  previous_injuries: string | null;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  consent: boolean;
  created_at: string;
}

export function useAdminIntakeForms() {
  return useQuery({
    queryKey: ["admin-intake-forms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patient_intake")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PatientIntake[];
    },
  });
}
