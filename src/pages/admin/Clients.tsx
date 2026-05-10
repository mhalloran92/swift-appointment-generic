import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAdminClients, Profile } from "@/hooks/useAdminData";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import {
  IconSearch,
  IconUsersGroup,
  IconMail,
  IconPhone,
  IconCalendar,
  IconShieldCheck,
  IconHeartHandshake,
  IconMessages,
  IconUser,
  IconId,
  IconHash,
  IconChevronRight,
} from "@tabler/icons-react";

// ── Helpers ────────────────────────────────────────────────────────────────

const ROLE_PILL: Record<Profile["role"], string> = {
  admin:  "bg-primary/10 text-primary",
  client: "bg-emerald-100 text-emerald-700",
  user:   "bg-slate-100 text-slate-500",
  banned: "bg-red-100 text-red-600",
};

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
        <p className="text-sm font-semibold text-slate-800 break-words">{value}</p>
      ) : (
        <p className="text-sm text-slate-300 italic">Not on file</p>
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
    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{title}</p>
  </div>
);

// ── Page ───────────────────────────────────────────────────────────────────

const Clients = () => {
  const { data: clients, isLoading } = useAdminClients();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Profile | null>(null);
  const navigate = useNavigate();

  const filtered =
    clients?.filter((c) => {
      const q = search.toLowerCase();
      return (
        c.first_name?.toLowerCase().includes(q) ||
        c.last_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q)
      );
    }) ?? [];

  return (
    <DashboardLayout isAdmin={true}>
      <div className="space-y-8">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Clients</h2>
          <p className="text-slate-500 mt-1">
            {isLoading
              ? "Loading patient records…"
              : `${clients?.length ?? 0} patient${clients?.length === 1 ? "" : "s"} registered`}
          </p>
        </div>

        {/* ── Search ─────────────────────────────────────────────────── */}
        <div className="relative max-w-md">
          <IconSearch
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <Input
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-2xl border-slate-200 bg-white shadow-sm focus-visible:ring-primary/20"
          />
        </div>

        {/* ── Roster ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Column headers */}
          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_32px] gap-x-4 px-6 py-3 border-b border-slate-100 bg-slate-50/60">
            {["Patient", "Email", "Phone", "Joined", ""].map((h) => (
              <p key={h} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {h}
              </p>
            ))}
          </div>

          {/* Loading skeletons */}
          {isLoading && (
            <div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="grid grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_32px] gap-x-4 px-6 py-4 border-b border-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                    <Skeleton className="h-4 w-28 rounded-lg" />
                  </div>
                  <Skeleton className="h-4 w-40 rounded-lg self-center" />
                  <Skeleton className="h-4 w-24 rounded-lg self-center" />
                  <Skeleton className="h-4 w-20 rounded-lg self-center" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
            <div className="py-20 text-center">
              <IconUsersGroup size={44} className="text-slate-200 mx-auto mb-4" />
              <p className="font-bold text-slate-600">No patients found</p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-2 text-sm text-primary font-bold hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          {/* Rows */}
          {!isLoading &&
            filtered.map((client) => (
              <button
                key={client.id}
                onClick={() => setSelected(client)}
                className="grid grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_32px] gap-x-4 px-6 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors w-full text-left group"
              >
                {/* Patient */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-9 w-9 shrink-0 border border-slate-100">
                    <AvatarImage src={client.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs font-bold bg-slate-100 text-slate-500">
                      {client.first_name?.charAt(0)}
                      {client.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {client.first_name} {client.last_name}
                    </p>
                    <Badge
                      className={`mt-0.5 rounded-full px-2 py-0 text-[10px] font-bold border-none uppercase tracking-wide ${
                        ROLE_PILL[client.role]
                      }`}
                    >
                      {client.role}
                    </Badge>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center min-w-0">
                  <span className="text-sm text-slate-600 truncate">{client.email ?? "—"}</span>
                </div>

                {/* Phone */}
                <div className="flex items-center">
                  <span className="text-sm text-slate-600">{client.phone ?? "—"}</span>
                </div>

                {/* Joined */}
                <div className="flex items-center">
                  <span className="text-sm text-slate-500">
                    {format(new Date(client.created_at), "MMM d, yyyy")}
                  </span>
                </div>

                {/* Arrow */}
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

      {/* ── Detail panel ──────────────────────────────────────────────── */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg p-0 flex flex-col gap-0 border-l border-slate-200"
        >
          {selected && (
            <>
              {/* Header */}
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-slate-100 px-6 pt-12 pb-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white shadow-lg ring-1 ring-slate-100 shrink-0">
                    <AvatarImage src={selected.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xl font-black bg-white text-slate-400">
                      {selected.first_name?.charAt(0)}
                      {selected.last_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 pt-1">
                    <h2 className="text-xl font-black text-slate-900 truncate">
                      {selected.first_name} {selected.last_name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border-none uppercase tracking-wide ${
                          ROLE_PILL[selected.role]
                        }`}
                      >
                        {selected.role}
                      </Badge>
                      <span className="text-xs text-slate-400 font-medium">
                        Member since {format(new Date(selected.created_at), "MMMM yyyy")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable body */}
              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="px-6 py-6 space-y-7">

                  {/* Contact */}
                  <section>
                    <SectionHead icon={<IconUser size={14} />} title="Contact" />
                    <div className="bg-slate-50/70 rounded-2xl px-4 border border-slate-100">
                      <InfoRow icon={<IconMail size={15} />} label="Email" value={selected.email} />
                      <InfoRow icon={<IconPhone size={15} />} label="Phone" value={selected.phone} />
                      <InfoRow
                        icon={<IconCalendar size={15} />}
                        label="Date of Birth"
                        value={
                          selected.date_of_birth
                            ? format(new Date(selected.date_of_birth + "T00:00:00"), "MMMM d, yyyy")
                            : null
                        }
                      />
                    </div>
                  </section>

                  {/* Insurance */}
                  <section>
                    <SectionHead icon={<IconShieldCheck size={14} />} title="Insurance" />
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

                  {/* Emergency contact */}
                  <section>
                    <SectionHead icon={<IconHeartHandshake size={14} />} title="Emergency Contact" />
                    <div className="bg-slate-50/70 rounded-2xl px-4 border border-slate-100">
                      <InfoRow
                        icon={<IconUser size={15} />}
                        label="Name"
                        value={selected.emergency_contact_name}
                      />
                      <InfoRow
                        icon={<IconHeartHandshake size={15} />}
                        label="Relationship"
                        value={selected.emergency_contact_relationship}
                      />
                      <InfoRow
                        icon={<IconPhone size={15} />}
                        label="Phone"
                        value={selected.emergency_contact_phone}
                      />
                    </div>
                  </section>

                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="border-t border-slate-100 p-5 shrink-0">
                <Button
                  className="w-full h-12 rounded-2xl font-bold shadow-lg shadow-primary/15"
                  onClick={() => {
                    setSelected(null);
                    navigate("/admin/messages");
                  }}
                >
                  <IconMessages size={16} className="mr-2" />
                  Open Message Thread
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default Clients;
