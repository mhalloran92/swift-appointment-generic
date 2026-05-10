import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAllAdminAppointments, AdminAppointment } from "@/hooks/useAdminData";
import { format, isAfter, startOfToday, endOfToday, startOfWeek, endOfWeek, addDays, isWithinInterval, isSameDay } from "date-fns";
import {
  IconCalendarEvent,
  IconCalendarOff,
  IconChevronRight,
  IconClock,
  IconFilter,
  IconMapPin,
  IconMail,
  IconUser,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconX,
  IconExternalLink,
  IconRefresh,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

// ── Helpers ─────────────────────────────────────────────────────────────────

type DerivedStatus = "confirmed" | "completed" | "cancelled";

function deriveStatus(appt: AdminAppointment): DerivedStatus {
  if (appt.status === "cancelled") return "cancelled";
  return isAfter(new Date(appt.start_time), new Date()) ? "confirmed" : "completed";
}

const STATUS_STYLE: Record<DerivedStatus, string> = {
  confirmed: "bg-emerald-100 text-emerald-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled:  "bg-red-100 text-red-600",
};

const STATUS_ICON: Record<DerivedStatus, React.ReactNode> = {
  confirmed: <IconCircleCheckFilled size={11} />,
  completed: <IconCircleCheckFilled size={11} />,
  cancelled:  <IconCircleXFilled size={11} />,
};

// ── Detail Panel ─────────────────────────────────────────────────────────────

const DetailRow = ({ label, value }: { label: string; value: string | null | undefined }) => (
  <div className="flex items-start gap-3 py-3.5 border-b border-slate-100 last:border-0">
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      {value ? (
        <p className="text-sm font-semibold text-slate-800 break-words">{value}</p>
      ) : (
        <p className="text-sm text-slate-300 italic">Not available</p>
      )}
    </div>
  </div>
);

// ── Page ─────────────────────────────────────────────────────────────────────

const Bookings = () => {
  const { data: appointments, isLoading } = useAllAdminAppointments();

  const [statusFilter, setStatusFilter] = useState<"all" | DerivedStatus>("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [datePreset, setDatePreset] = useState<string>("all");
  const [selected, setSelected] = useState<AdminAppointment | null>(null);

  const applyPreset = (preset: string) => {
    setDatePreset(preset);
    const today = startOfToday();
    switch (preset) {
      case "today":
        setDateRange({ from: today, to: endOfToday() });
        break;
      case "week":
        setDateRange({ from: startOfWeek(today), to: endOfWeek(today) });
        break;
      case "month":
        setDateRange({ from: today, to: addDays(today, 30) });
        break;
      default:
        setDateRange({ from: undefined, to: undefined });
    }
  };

  const filtered = useMemo(() => {
    if (!appointments) return [];
    return appointments.filter((appt) => {
      const derived = deriveStatus(appt);
      if (statusFilter !== "all" && derived !== statusFilter) return false;
      if (dateRange.from && dateRange.to) {
        if (!isWithinInterval(new Date(appt.start_time), { start: dateRange.from, end: dateRange.to })) return false;
      } else if (dateRange.from) {
        if (!isSameDay(new Date(appt.start_time), dateRange.from)) return false;
      }
      return true;
    });
  }, [appointments, statusFilter, dateRange]);

  const hasFilters = statusFilter !== "all" || dateRange.from !== undefined;

  const clearFilters = () => {
    setStatusFilter("all");
    applyPreset("all");
  };

  const dateLabel = dateRange.from
    ? dateRange.to
      ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d")}`
      : format(dateRange.from, "MMM d, yyyy")
    : "All dates";

  return (
    <DashboardLayout isAdmin={true}>
      <div className="space-y-8">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Bookings</h2>
          <p className="text-slate-500 mt-1">
            {isLoading
              ? "Loading appointments…"
              : `${filtered.length} of ${appointments?.length ?? 0} appointment${appointments?.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {/* ── Filters ─────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Status */}
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="h-10 w-44 rounded-2xl border-slate-200 bg-white shadow-sm text-sm font-semibold focus:ring-primary/20">
              <div className="flex items-center gap-2">
                <IconFilter size={14} className="text-slate-400 shrink-0" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Date range */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-10 rounded-2xl border-slate-200 bg-white shadow-sm text-sm font-semibold gap-2 hover:bg-white",
                  dateRange.from ? "text-slate-900" : "text-slate-400"
                )}
              >
                <IconCalendarEvent size={14} className="text-slate-400 shrink-0" />
                {dateLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-2xl border-slate-100" align="start">
              <div className="flex">
                {/* Presets */}
                <div className="w-40 bg-slate-50 p-3 flex flex-col gap-1 border-r border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Presets</p>
                  {[
                    { id: "all", label: "All time" },
                    { id: "today", label: "Today" },
                    { id: "week", label: "This week" },
                    { id: "month", label: "Next 30 days" },
                  ].map((p) => (
                    <Button
                      key={p.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => applyPreset(p.id)}
                      className={cn(
                        "justify-start rounded-xl px-2.5 h-8 text-xs font-semibold",
                        datePreset === p.id
                          ? "bg-white text-primary shadow-sm"
                          : "text-slate-500 hover:bg-white/70"
                      )}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange.from}
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    setDateRange({ from: range?.from, to: range?.to });
                    setDatePreset("custom");
                  }}
                  numberOfMonths={1}
                />
              </div>
            </PopoverContent>
          </Popover>

          {/* Clear */}
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-10 rounded-2xl text-slate-500 hover:text-red-500 hover:bg-red-50 font-semibold gap-1.5"
            >
              <IconX size={14} />
              Clear
            </Button>
          )}
        </div>

        {/* ── Table ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

          {/* Column headers */}
          <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,2.5fr)_minmax(0,1.6fr)_minmax(0,1.2fr)_32px] gap-x-4 px-6 py-3 border-b border-slate-100 bg-slate-50/60">
            {["Patient", "Appointment Type", "Date & Time", "Status", ""].map((h) => (
              <p key={h} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
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
                  className="grid grid-cols-[minmax(0,2fr)_minmax(0,2.5fr)_minmax(0,1.6fr)_minmax(0,1.2fr)_32px] gap-x-4 px-6 py-4 border-b border-slate-50"
                >
                  <Skeleton className="h-4 w-32 rounded-lg self-center" />
                  <Skeleton className="h-4 w-44 rounded-lg self-center" />
                  <Skeleton className="h-4 w-28 rounded-lg self-center" />
                  <Skeleton className="h-5 w-20 rounded-full self-center" />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!isLoading && filtered.length === 0 && (
            <div className="py-20 text-center">
              <IconCalendarOff size={44} className="text-slate-200 mx-auto mb-4" />
              <p className="font-bold text-slate-600">No appointments found</p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-2 text-sm text-primary font-bold hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Rows */}
          {!isLoading &&
            filtered.map((appt) => {
              const derived = deriveStatus(appt);
              const start = new Date(appt.start_time);
              const dimmed = derived === "completed" || derived === "cancelled";

              return (
                <button
                  key={appt.id}
                  onClick={() => setSelected(appt)}
                  className={cn(
                    "grid grid-cols-[minmax(0,2fr)_minmax(0,2.5fr)_minmax(0,1.6fr)_minmax(0,1.2fr)_32px] gap-x-4 px-6 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors w-full text-left group",
                    dimmed && "opacity-60"
                  )}
                >
                  {/* Patient */}
                  <div className="flex items-center min-w-0">
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {appt.invitee_name || appt.invitee_email}
                    </span>
                  </div>

                  {/* Appointment Type */}
                  <div className="flex items-center min-w-0">
                    <span className="text-sm text-slate-600 truncate">{appt.event_name}</span>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center">
                    <span className="text-sm text-slate-600 tabular-nums whitespace-nowrap">
                      {format(start, "MMM d, yyyy")}
                      <span className="text-slate-400 ml-1">{format(start, "h:mm a")}</span>
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center">
                    <Badge
                      className={cn(
                        "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide border-none flex items-center gap-1 shrink-0",
                        STATUS_STYLE[derived]
                      )}
                    >
                      {STATUS_ICON[derived]}
                      {derived}
                    </Badge>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center">
                    <IconChevronRight
                      size={16}
                      className="text-slate-300 group-hover:text-primary transition-colors"
                    />
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* ── Detail Sheet ───────────────────────────────────────────── */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 flex flex-col gap-0 border-l border-slate-200"
        >
          {selected && (() => {
            const derived = deriveStatus(selected);
            const start = new Date(selected.start_time);
            const end = selected.end_time ? new Date(selected.end_time) : null;

            return (
              <>
                {/* Header */}
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-slate-100 px-6 pt-12 pb-6">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {format(start, "MMM")}
                      </span>
                      <span className="text-2xl font-black text-slate-800 leading-none">
                        {format(start, "d")}
                      </span>
                    </div>
                    <div className="min-w-0 pt-1">
                      <h2 className="text-xl font-black text-slate-900 truncate">
                        {selected.invitee_name || selected.invitee_email}
                      </h2>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-[10px] font-bold border-none uppercase tracking-wide flex items-center gap-1",
                            STATUS_STYLE[derived]
                          )}
                        >
                          {STATUS_ICON[derived]}
                          {derived}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <ScrollArea className="flex-1 overflow-y-auto">
                  <div className="px-6 py-6 space-y-6">

                    <div className="bg-slate-50/70 rounded-2xl px-4 border border-slate-100">
                      <DetailRow label="Appointment Type" value={selected.event_name} />
                      <DetailRow
                        label="Date & Time"
                        value={`${format(start, "EEEE, MMMM d, yyyy")} at ${format(start, "h:mm a")}${end ? ` – ${format(end, "h:mm a")}` : ""}`}
                      />
                      {selected.location && (
                        <DetailRow label="Location" value={selected.location} />
                      )}
                    </div>

                    <div className="bg-slate-50/70 rounded-2xl px-4 border border-slate-100">
                      <DetailRow label="Patient Name" value={selected.invitee_name} />
                      <DetailRow label="Email" value={selected.invitee_email} />
                    </div>

                    {(selected.cancel_url || selected.reschedule_url) && (
                      <div className="space-y-2">
                        {selected.reschedule_url && (
                          <a
                            href={selected.reschedule_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                          >
                            <IconRefresh size={14} />
                            Reschedule link
                            <IconExternalLink size={12} />
                          </a>
                        )}
                        {selected.cancel_url && (
                          <a
                            href={selected.cancel_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:underline"
                          >
                            <IconX size={14} />
                            Cancel link
                            <IconExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default Bookings;
