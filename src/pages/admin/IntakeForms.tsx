import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAdminIntakeForms, PatientIntake } from "@/hooks/useIntakeForms";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { format } from "date-fns";
import {
  IconClipboardList,
  IconChevronRight,
  IconUser,
  IconPhone,
  IconMail,
  IconMapPin,
  IconShieldCheck,
  IconId,
  IconHash,
  IconHeartHandshake,
  IconNotes,
  IconPill,
  IconBandage,
} from "@tabler/icons-react";

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) => (
  <div className="flex items-start gap-3 py-3.5 border-b border-slate-100 last:border-0">
    <div className="mt-0.5 text-slate-300 shrink-0">{icon}</div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
        {label}
      </p>
      {value ? (
        <p className="text-sm font-semibold text-slate-800 break-words whitespace-pre-wrap">
          {value}
        </p>
      ) : (
        <p className="text-sm text-slate-300 italic">Not provided</p>
      )}
    </div>
  </div>
);

const SectionHead = ({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) => (
  <div className="flex items-center gap-2 mb-3">
    <span className="text-primary">{icon}</span>
    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
      {title}
    </p>
  </div>
);

const IntakeForms = () => {
  const { data: forms, isLoading } = useAdminIntakeForms();
  const [selected, setSelected] = useState<PatientIntake | null>(null);

  return (
    <DashboardLayout isAdmin={true}>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            Intake Forms
          </h2>
          <p className="text-slate-500 mt-1">
            {isLoading
              ? "Loading submissions…"
              : `${forms?.length ?? 0} intake form${
                  forms?.length === 1 ? "" : "s"
                } submitted`}
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_32px] gap-x-4 px-6 py-3 border-b border-slate-100 bg-slate-50/60">
            {["Patient", "Email", "Phone", "Submitted", ""].map((h) => (
              <p
                key={h}
                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
              >
                {h}
              </p>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="grid grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_32px] gap-x-4 px-6 py-4 border-b border-slate-50"
                >
                  <Skeleton className="h-4 w-36 rounded-lg self-center" />
                  <Skeleton className="h-4 w-40 rounded-lg self-center" />
                  <Skeleton className="h-4 w-24 rounded-lg self-center" />
                  <Skeleton className="h-4 w-20 rounded-lg self-center" />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!isLoading && (forms?.length ?? 0) === 0 && (
            <div className="py-20 text-center">
              <IconClipboardList
                size={44}
                className="text-slate-200 mx-auto mb-4"
              />
              <p className="font-bold text-slate-600">No intake forms yet</p>
              <p className="text-sm text-slate-400 mt-1">
                Submissions will appear here once patients complete the intake
                form.
              </p>
            </div>
          )}

          {/* Rows */}
          {!isLoading &&
            forms?.map((form) => (
              <button
                key={form.id}
                onClick={() => setSelected(form)}
                className="grid grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_32px] gap-x-4 px-6 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors w-full text-left group"
              >
                <div className="flex items-center min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {form.first_name} {form.last_name}
                  </p>
                </div>
                <div className="flex items-center min-w-0">
                  <span className="text-sm text-slate-600 truncate">
                    {form.email}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-slate-600">{form.phone}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-slate-500">
                    {format(new Date(form.created_at), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <IconChevronRight
                    size={16}
                    className="text-slate-300 group-hover:text-primary transition-colors"
                  />
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Detail panel */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg p-0 flex flex-col gap-0 border-l border-slate-200"
        >
          {selected && (
            <>
              {/* Header */}
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-slate-100 px-6 pt-12 pb-6">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <IconClipboardList size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900">
                      {selected.first_name} {selected.last_name}
                    </h2>
                    <span className="text-xs text-slate-400 font-medium">
                      Submitted{" "}
                      {format(
                        new Date(selected.created_at),
                        "MMMM d, yyyy 'at' h:mm a"
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="px-6 py-6 space-y-7">
                  {/* Contact */}
                  <section>
                    <SectionHead
                      icon={<IconUser size={14} />}
                      title="Personal Information"
                    />
                    <div className="bg-slate-50/70 rounded-2xl px-4 border border-slate-100">
                      <InfoRow
                        icon={<IconMail size={15} />}
                        label="Email"
                        value={selected.email}
                      />
                      <InfoRow
                        icon={<IconPhone size={15} />}
                        label="Phone"
                        value={selected.phone}
                      />
                      <InfoRow
                        icon={<IconUser size={15} />}
                        label="Date of Birth"
                        value={
                          selected.date_of_birth
                            ? format(
                                new Date(selected.date_of_birth + "T00:00:00"),
                                "MMMM d, yyyy"
                              )
                            : null
                        }
                      />
                      <InfoRow
                        icon={<IconMapPin size={15} />}
                        label="Address"
                        value={selected.address}
                      />
                    </div>
                  </section>

                  {/* Insurance */}
                  <section>
                    <SectionHead
                      icon={<IconShieldCheck size={14} />}
                      title="Insurance"
                    />
                    <div className="bg-slate-50/70 rounded-2xl px-4 border border-slate-100">
                      <InfoRow
                        icon={<IconShieldCheck size={15} />}
                        label="Provider"
                        value={selected.insurance_provider}
                      />
                      <InfoRow
                        icon={<IconId size={15} />}
                        label="Member ID"
                        value={selected.insurance_member_id}
                      />
                      <InfoRow
                        icon={<IconHash size={15} />}
                        label="Group Number"
                        value={selected.insurance_group_number}
                      />
                    </div>
                  </section>

                  {/* Medical */}
                  <section>
                    <SectionHead
                      icon={<IconNotes size={14} />}
                      title="Medical History"
                    />
                    <div className="bg-slate-50/70 rounded-2xl px-4 border border-slate-100">
                      <InfoRow
                        icon={<IconNotes size={15} />}
                        label="Reason for Visit"
                        value={selected.reason_for_visit}
                      />
                      <InfoRow
                        icon={<IconPill size={15} />}
                        label="Current Medications"
                        value={selected.current_medications}
                      />
                      <InfoRow
                        icon={<IconBandage size={15} />}
                        label="Previous Injuries / Conditions"
                        value={selected.previous_injuries}
                      />
                    </div>
                  </section>

                  {/* Emergency contact */}
                  <section>
                    <SectionHead
                      icon={<IconHeartHandshake size={14} />}
                      title="Emergency Contact"
                    />
                    <div className="bg-slate-50/70 rounded-2xl px-4 border border-slate-100">
                      <InfoRow
                        icon={<IconUser size={15} />}
                        label="Name"
                        value={selected.emergency_contact_name}
                      />
                      <InfoRow
                        icon={<IconPhone size={15} />}
                        label="Phone"
                        value={selected.emergency_contact_phone}
                      />
                    </div>
                  </section>

                  {/* Consent */}
                  <section>
                    <SectionHead
                      icon={<IconShieldCheck size={14} />}
                      title="Consent"
                    />
                    <div className="bg-slate-50/70 rounded-2xl px-4 border border-slate-100">
                      <InfoRow
                        icon={<IconShieldCheck size={15} />}
                        label="Patient Consent"
                        value={selected.consent ? "Agreed" : "Not agreed"}
                      />
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default IntakeForms;
