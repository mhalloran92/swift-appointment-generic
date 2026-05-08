import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const Insurance = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState("");
  const [memberId, setMemberId] = useState("");
  const [groupNumber, setGroupNumber] = useState("");

  useEffect(() => {
    if (user) loadInsurance();
  }, [user]);

  const loadInsurance = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("insurance_provider, insurance_member_id, insurance_group_number")
        .eq("id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      setProvider(data?.insurance_provider || "");
      setMemberId(data?.insurance_member_id || "");
      setGroupNumber(data?.insurance_group_number || "");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error loading insurance info", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const saveInsurance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user?.id,
          insurance_provider: provider,
          insurance_member_id: memberId,
          insurance_group_number: groupNumber,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({ title: "Insurance info saved", description: "Your insurance details have been updated." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error saving insurance info", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout isAdmin={false}>
      <div className="max-w-2xl mx-auto space-y-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Insurance</h1>
          <p className="text-slate-500 mt-1 font-medium">Keep your insurance details on file for easy reference.</p>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-12 translate-x-12 blur-3xl" />

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <form className="space-y-6" onSubmit={saveInsurance}>
              <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Insurance Details</p>
                  <p className="text-sm text-slate-500">This information is stored securely on your profile.</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Insurance Provider</label>
                <input
                  type="text"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="e.g. Blue Cross Blue Shield"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Member ID</label>
                <input
                  type="text"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  placeholder="e.g. XYZ123456789"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Group Number</label>
                <input
                  type="text"
                  value={groupNumber}
                  onChange={(e) => setGroupNumber(e.target.value)}
                  placeholder="e.g. GRP98765"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-slate-900"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-2xl h-12 px-8 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Insurance Info
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Insurance;
