import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { siteConfig } from "@/config/site-config";
import {
  IconUser,
  IconShieldCheck,
  IconHeartHandshake,
  IconNotes,
  IconCircleCheck,
  IconArrowRight,
  IconArrowLeft,
} from "@tabler/icons-react";

const STEPS = [
  { label: "Personal Info", icon: IconUser },
  { label: "Insurance", icon: IconShieldCheck },
  { label: "Medical History", icon: IconNotes },
  { label: "Emergency & Consent", icon: IconHeartHandshake },
];

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "h-11 rounded-2xl border-slate-200 bg-white shadow-sm focus-visible:ring-primary/20 text-slate-900";

export default function IntakeForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    phone: "",
    email: "",
    address: "",
    insurance_provider: "",
    insurance_member_id: "",
    insurance_group_number: "",
    reason_for_visit: "",
    current_medications: "",
    previous_injuries: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    consent: false,
  });

  const set = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const canAdvance = () => {
    if (step === 0)
      return (
        form.first_name &&
        form.last_name &&
        form.date_of_birth &&
        form.phone &&
        form.email &&
        form.address
      );
    if (step === 2) return !!form.reason_for_visit;
    if (step === 3)
      return (
        form.emergency_contact_name &&
        form.emergency_contact_phone &&
        form.consent
      );
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("patient_intake").insert({
        first_name: form.first_name,
        last_name: form.last_name,
        date_of_birth: form.date_of_birth,
        phone: form.phone,
        email: form.email,
        address: form.address,
        insurance_provider: form.insurance_provider || null,
        insurance_member_id: form.insurance_member_id || null,
        insurance_group_number: form.insurance_group_number || null,
        reason_for_visit: form.reason_for_visit,
        current_medications: form.current_medications || null,
        previous_injuries: form.previous_injuries || null,
        emergency_contact_name: form.emergency_contact_name,
        emergency_contact_phone: form.emergency_contact_phone,
        consent: form.consent,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      toast.error("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 max-w-md w-full text-center space-y-5">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto">
            <IconCircleCheck size={36} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            Intake Form Submitted
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            Thank you! We've received your intake form and will have everything
            ready before your visit.
          </p>
          <Button
            className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-primary/15"
            onClick={() => navigate("/")}
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-1">
          <a
            href="/"
            className="text-primary font-black text-xl uppercase tracking-tight block mb-4"
          >
            {siteConfig.name}
          </a>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Patient Intake Form
          </h1>
          <p className="text-slate-500 text-sm">
            Complete this form before your visit to save time at the office.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            const done = i < step;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
                    done
                      ? "bg-emerald-100 text-emerald-600"
                      : active
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "bg-slate-100 text-slate-300"
                  }`}
                >
                  {done ? (
                    <IconCircleCheck size={18} />
                  ) : (
                    <Icon size={18} />
                  )}
                </div>
                <span
                  className={`text-[9px] font-bold uppercase tracking-widest text-center leading-none ${
                    active ? "text-primary" : done ? "text-emerald-600" : "text-slate-300"
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-5">
          {/* Step 0: Personal Info */}
          {step === 0 && (
            <>
              <h2 className="text-lg font-black text-slate-900">
                Personal Information
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name">
                  <Input
                    className={inputCls}
                    value={form.first_name}
                    onChange={(e) => set("first_name", e.target.value)}
                    placeholder="Jane"
                  />
                </Field>
                <Field label="Last Name">
                  <Input
                    className={inputCls}
                    value={form.last_name}
                    onChange={(e) => set("last_name", e.target.value)}
                    placeholder="Doe"
                  />
                </Field>
              </div>
              <Field label="Date of Birth">
                <Input
                  type="date"
                  className={inputCls}
                  value={form.date_of_birth}
                  onChange={(e) => set("date_of_birth", e.target.value)}
                />
              </Field>
              <Field label="Phone">
                <Input
                  type="tel"
                  className={inputCls}
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="(555) 000-0000"
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  className={inputCls}
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="jane@example.com"
                />
              </Field>
              <Field label="Address">
                <Input
                  className={inputCls}
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="123 Main St, City, State 12345"
                />
              </Field>
            </>
          )}

          {/* Step 1: Insurance */}
          {step === 1 && (
            <>
              <h2 className="text-lg font-black text-slate-900">
                Insurance Information
              </h2>
              <p className="text-sm text-slate-400">
                Leave blank if you are paying out of pocket.
              </p>
              <Field label="Insurance Provider">
                <Input
                  className={inputCls}
                  value={form.insurance_provider}
                  onChange={(e) => set("insurance_provider", e.target.value)}
                  placeholder="e.g. Blue Cross Blue Shield"
                />
              </Field>
              <Field label="Member ID">
                <Input
                  className={inputCls}
                  value={form.insurance_member_id}
                  onChange={(e) => set("insurance_member_id", e.target.value)}
                  placeholder="e.g. XYZ123456789"
                />
              </Field>
              <Field label="Group Number">
                <Input
                  className={inputCls}
                  value={form.insurance_group_number}
                  onChange={(e) =>
                    set("insurance_group_number", e.target.value)
                  }
                  placeholder="e.g. 987654"
                />
              </Field>
            </>
          )}

          {/* Step 2: Medical */}
          {step === 2 && (
            <>
              <h2 className="text-lg font-black text-slate-900">
                Medical History
              </h2>
              <Field label="Reason for Visit *">
                <Textarea
                  className="rounded-2xl border-slate-200 bg-white shadow-sm focus-visible:ring-primary/20 text-slate-900 min-h-[100px]"
                  value={form.reason_for_visit}
                  onChange={(e) => set("reason_for_visit", e.target.value)}
                  placeholder="Describe what brings you in today…"
                />
              </Field>
              <Field label="Current Medications">
                <Textarea
                  className="rounded-2xl border-slate-200 bg-white shadow-sm focus-visible:ring-primary/20 text-slate-900 min-h-[80px]"
                  value={form.current_medications}
                  onChange={(e) => set("current_medications", e.target.value)}
                  placeholder="List any medications you are currently taking…"
                />
              </Field>
              <Field label="Previous Injuries or Conditions">
                <Textarea
                  className="rounded-2xl border-slate-200 bg-white shadow-sm focus-visible:ring-primary/20 text-slate-900 min-h-[80px]"
                  value={form.previous_injuries}
                  onChange={(e) => set("previous_injuries", e.target.value)}
                  placeholder="Any prior injuries, surgeries, or chronic conditions…"
                />
              </Field>
            </>
          )}

          {/* Step 3: Emergency & Consent */}
          {step === 3 && (
            <>
              <h2 className="text-lg font-black text-slate-900">
                Emergency Contact & Consent
              </h2>
              <Field label="Emergency Contact Name *">
                <Input
                  className={inputCls}
                  value={form.emergency_contact_name}
                  onChange={(e) =>
                    set("emergency_contact_name", e.target.value)
                  }
                  placeholder="Full name"
                />
              </Field>
              <Field label="Emergency Contact Phone *">
                <Input
                  type="tel"
                  className={inputCls}
                  value={form.emergency_contact_phone}
                  onChange={(e) =>
                    set("emergency_contact_phone", e.target.value)
                  }
                  placeholder="(555) 000-0000"
                />
              </Field>

              <div className="bg-slate-50/70 rounded-2xl border border-slate-100 p-4 space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed">
                  By submitting this form, I confirm that the information
                  provided is accurate to the best of my knowledge. I consent
                  to the collection and use of this information for the purpose
                  of receiving care at {siteConfig.fullName}.
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => set("consent", e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-primary"
                  />
                  <span className="text-sm font-semibold text-slate-800">
                    I agree to the above statement *
                  </span>
                </label>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 0 && (
            <Button
              variant="outline"
              className="h-12 rounded-2xl font-bold flex-1"
              onClick={() => setStep((s) => s - 1)}
            >
              <IconArrowLeft size={16} className="mr-2" />
              Back
            </Button>
          )}
          {step < STEPS.length - 1 ? (
            <Button
              className="h-12 rounded-2xl font-bold shadow-lg shadow-primary/15 flex-1"
              disabled={!canAdvance()}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue
              <IconArrowRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button
              className="h-12 rounded-2xl font-bold shadow-lg shadow-primary/15 flex-1"
              disabled={!canAdvance() || submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Submitting…" : "Submit Intake Form"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
