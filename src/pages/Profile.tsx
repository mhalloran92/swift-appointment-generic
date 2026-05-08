import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import CalendlyPopupButton from "@/components/calendly/CalendlyPopupButton";

export const Profile = () => {
  const { user, avatarUrl, refreshAvatar } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone, date_of_birth, emergency_contact_name, emergency_contact_relationship, emergency_contact_phone")
        .eq("id", user?.id)
        .single();

      // PGRST116 = no row found; fine for brand-new users
      if (error && error.code !== "PGRST116") throw error;

      setFirstName(data?.first_name || user?.user_metadata?.first_name || "");
      setLastName(data?.last_name || user?.user_metadata?.last_name || "");
      setPhone(data?.phone || user?.user_metadata?.phone || "");
      setDateOfBirth(data?.date_of_birth || user?.user_metadata?.date_of_birth || "");
      setEmergencyName(data?.emergency_contact_name || "");
      setEmergencyRelationship(data?.emergency_contact_relationship || "");
      setEmergencyPhone(data?.emergency_contact_phone || "");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading profile",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user?.id,
          email: user?.email,
          first_name: firstName,
          last_name: lastName,
          phone,
          date_of_birth: dateOfBirth || null,
          emergency_contact_name: emergencyName,
          emergency_contact_relationship: emergencyRelationship,
          emergency_contact_phone: emergencyPhone,
          updated_at: new Date().toISOString(),
        });
        
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile details have been saved.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user?.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: filePath })
        .eq("id", user?.id);
        
      if (updateError) throw updateError;
      
      await refreshAvatar();
      
      toast({
        title: "Profile picture updated",
        description: "Your new profile picture has been saved.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error uploading image",
        description: error.message,
      });
    } finally {
      setUploadingAvatar(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  return (
    <DashboardLayout isAdmin={false}>
      <div className="max-w-4xl mx-auto space-y-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Personal Profile</h1>
          <p className="text-slate-500 mt-1 font-medium">Update your clinical records and account preferences.</p>
        </div>

        <div className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-12 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-12 translate-x-12 blur-3xl" />
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <form className="space-y-6" onSubmit={updateProfile}>
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
              <Avatar className="h-24 w-24 border-2 border-slate-100">
                <AvatarImage src={avatarUrl || user?.user_metadata?.avatar_url} alt={user?.email || ""} />
                <AvatarFallback className="text-2xl">{user?.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              
              <div className="flex flex-col items-center sm:items-start">
                <label 
                  htmlFor="avatar-upload" 
                  className={`inline-flex items-center justify-center py-2 px-4 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer transition-colors ${uploadingAvatar ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {uploadingAvatar ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : "Change Picture"}
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingAvatar}
                  onChange={uploadAvatar}
                />
                <p className="mt-2 text-xs text-slate-500">JPG, GIF or PNG. Max size of 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ""}
                className="mt-1 block w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-slate-500">Email cannot be changed here.</p>
            </div>

            <div className="pt-6 border-t border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Emergency Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Contact Name</label>
                  <input
                    type="text"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Relationship</label>
                  <input
                    type="text"
                    value={emergencyRelationship}
                    onChange={(e) => setEmergencyRelationship(e.target.value)}
                    placeholder="e.g. Spouse, Parent"
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Emergency Contact Phone</label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="e.g. (555) 000-0000"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-slate-900"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="rounded-2xl h-12 px-8 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Profile Changes
              </Button>
            </div>
          </form>
        )}
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-[40px] border border-primary/10 p-8 md:p-12 text-center space-y-6 shadow-sm">
           <div className="h-16 w-16 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-2 border border-white">
             <Loader2 className="h-8 w-8 text-primary" />
           </div>
           <div>
             <h3 className="text-2xl font-black text-slate-900 leading-tight">Schedule Your Next Visit</h3>
             <p className="text-slate-600 font-medium mt-2 max-w-sm mx-auto leading-relaxed">
               Keep your wellness momentum. Book your next adjustment or consultation today.
             </p>
           </div>
           <div className="pt-2">
             <CalendlyPopupButton 
               text="Book Your Appointment"
               className="rounded-2xl h-14 px-10 font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-base"
             />
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;