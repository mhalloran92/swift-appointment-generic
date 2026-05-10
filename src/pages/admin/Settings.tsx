import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { usePracticeSettings, useUpdatePracticeSettings } from "@/hooks/useAdminData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  IconBuilding,
  IconMapPin,
  IconPhone,
  IconMail,
  IconLink,
  IconDeviceFloppy,
  IconLock,
  IconSettings,
} from "@tabler/icons-react";

// ── Field ─────────────────────────────────────────────────────────────────────

const Field = ({
  icon,
  label,
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
      <span className="text-slate-300">{icon}</span>
      {label}
    </label>
    <Input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm focus-visible:ring-primary/20 text-sm font-medium text-slate-800 placeholder:text-slate-300 disabled:opacity-50"
    />
  </div>
);

// ── Page ──────────────────────────────────────────────────────────────────────

const Settings = () => {
  const { role } = useAuth();
  const { data: settings, isLoading } = usePracticeSettings();
  const updateSettings = useUpdatePracticeSettings();

  const [practiceName, setPracticeName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [calendlyUrl, setCalendlyUrl] = useState("");

  // Populate form when data loads
  useEffect(() => {
    if (settings) {
      setPracticeName(settings.practice_name ?? "");
      setAddress(settings.address ?? "");
      setPhone(settings.phone ?? "");
      setEmail(settings.email ?? "");
      setCalendlyUrl(settings.calendly_url ?? "");
    }
  }, [settings]);

  const isDirty =
    practiceName !== (settings?.practice_name ?? "") ||
    address !== (settings?.address ?? "") ||
    phone !== (settings?.phone ?? "") ||
    email !== (settings?.email ?? "") ||
    calendlyUrl !== (settings?.calendly_url ?? "");

  const handleSave = () => {
    updateSettings.mutate({
      practice_name: practiceName,
      address,
      phone,
      email,
      calendly_url: calendlyUrl,
    });
  };

  const canEdit = role === "admin" || role === "doctor";

  return (
    <DashboardLayout isAdmin={true}>
      <div className="space-y-8 max-w-2xl">

        {/* ── Header ───────────────────────────────────────────────── */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h2>
          <p className="text-slate-500 mt-1">
            {canEdit
              ? "Manage your practice information and booking configuration."
              : "Practice configuration — view only."}
          </p>
        </div>

        {/* ── Access Denied ─────────────────────────────────────────── */}
        {role === "office_manager" && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
              <IconLock size={28} className="text-slate-300" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-lg">Access Restricted</p>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">
                Settings can only be edited by the doctor or administrator. Contact them to request changes.
              </p>
            </div>
          </div>
        )}

        {/* ── Form ─────────────────────────────────────────────────── */}
        {canEdit && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

            {/* Section: Practice Info */}
            <div className="px-8 py-6 border-b border-slate-50">
              <div className="flex items-center gap-2 mb-6">
                <IconBuilding size={14} className="text-primary" />
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Practice Information</p>
              </div>

              {isLoading ? (
                <div className="space-y-5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-1.5">
                      <Skeleton className="h-3 w-24 rounded" />
                      <Skeleton className="h-11 w-full rounded-2xl" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-5">
                  <Field
                    icon={<IconBuilding size={12} />}
                    label="Practice Name"
                    id="practice-name"
                    value={practiceName}
                    onChange={setPracticeName}
                    placeholder="e.g. City Chiropractic"
                  />
                  <Field
                    icon={<IconMapPin size={12} />}
                    label="Address"
                    id="address"
                    value={address}
                    onChange={setAddress}
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>
              )}
            </div>

            {/* Section: Contact */}
            <div className="px-8 py-6 border-b border-slate-50">
              <div className="flex items-center gap-2 mb-6">
                <IconPhone size={14} className="text-primary" />
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Contact Details</p>
              </div>

              {isLoading ? (
                <div className="space-y-5">
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-1.5">
                      <Skeleton className="h-3 w-24 rounded" />
                      <Skeleton className="h-11 w-full rounded-2xl" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-5">
                  <Field
                    icon={<IconPhone size={12} />}
                    label="Phone Number"
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={setPhone}
                    placeholder="(555) 000-0000"
                  />
                  <Field
                    icon={<IconMail size={12} />}
                    label="Email Address"
                    id="email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="hello@yourpractice.com"
                  />
                </div>
              )}
            </div>

            {/* Section: Booking */}
            <div className="px-8 py-6 border-b border-slate-50">
              <div className="flex items-center gap-2 mb-6">
                <IconLink size={14} className="text-primary" />
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Booking Configuration</p>
              </div>

              {isLoading ? (
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-24 rounded" />
                  <Skeleton className="h-11 w-full rounded-2xl" />
                </div>
              ) : (
                <Field
                  icon={<IconLink size={12} />}
                  label="Calendly URL"
                  id="calendly-url"
                  value={calendlyUrl}
                  onChange={setCalendlyUrl}
                  placeholder="https://calendly.com/yourname/event"
                />
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 bg-slate-50/40 flex items-center justify-between">
              <p className="text-xs text-slate-400 font-medium">
                {settings?.updated_at
                  ? `Last saved ${format(new Date(settings.updated_at), "MMM d, yyyy 'at' h:mm a")}`
                  : "Not yet saved"}
              </p>
              <Button
                onClick={handleSave}
                disabled={!isDirty || updateSettings.isPending || isLoading}
                className="h-11 px-6 rounded-2xl font-bold shadow-lg shadow-primary/15 gap-2"
              >
                <IconDeviceFloppy size={16} />
                {updateSettings.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Settings;
