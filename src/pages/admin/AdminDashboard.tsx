import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminMetrics, useTodayAppointments } from "@/hooks/useAdminData";
import { Link } from "react-router-dom";
import { format, isAfter, startOfDay } from "date-fns";
import {
  IconCalendarEvent,
  IconUsersGroup,
  IconMessageDots,
  IconClockHour4,
  IconCalendarOff,
  IconArrowRight,
  IconCircleCheckFilled,
  IconCircleXFilled,
} from "@tabler/icons-react";

// ── Metric card ────────────────────────────────────────────────────────────

interface MetricCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number | string;
  href?: string;
  linkLabel?: string;
  loading?: boolean;
}

const MetricCard = ({
  icon,
  iconBg,
  label,
  value,
  href,
  linkLabel,
  loading,
}: MetricCardProps) => (
  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7 flex flex-col gap-5">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg}`}>
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      {loading ? (
        <Skeleton className="h-10 w-20 rounded-xl" />
      ) : (
        <p className="text-4xl font-black text-slate-900 leading-none">{value}</p>
      )}
    </div>
    {href && (
      <Link
        to={href}
        className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline self-start"
      >
        {linkLabel}
        <IconArrowRight size={14} />
      </Link>
    )}
  </div>
);

// ── Main page ──────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { data: metrics, isLoading: loadingMetrics } = useAdminMetrics();
  const { data: appointments, isLoading: loadingAppts } = useTodayAppointments();

  const todayLabel = format(new Date(), "EEEE, MMMM d");
  const upcoming = appointments?.filter(
    (a) => a.status === "active" && isAfter(new Date(a.start_time), startOfDay(new Date()))
  ) ?? [];

  return (
    <DashboardLayout isAdmin={true}>
      <div className="space-y-8">

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Overview
            </h2>
            <p className="text-slate-500 mt-1">{todayLabel}</p>
          </div>
          <Button asChild className="rounded-2xl h-11 px-6 shadow-lg shadow-primary/20 w-fit">
            <Link to="/admin/messages">
              <IconMessageDots size={16} className="mr-2" />
              View Messages
              {(metrics?.unreadMessages ?? 0) > 0 && (
                <span className="ml-2 bg-white/20 text-white text-[10px] font-black rounded-full px-2 py-0.5">
                  {metrics!.unreadMessages}
                </span>
              )}
            </Link>
          </Button>
        </div>

        {/* ── Metric cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            icon={<IconCalendarEvent size={22} className="text-blue-600" />}
            iconBg="bg-blue-50"
            label="Today's Appointments"
            value={metrics?.todayAppointments ?? 0}
            loading={loadingMetrics}
            href="/admin/bookings"
            linkLabel="All bookings"
          />
          <MetricCard
            icon={<IconUsersGroup size={22} className="text-violet-600" />}
            iconBg="bg-violet-50"
            label="Total Patients"
            value={metrics?.totalPatients ?? 0}
            loading={loadingMetrics}
            href="/admin/clients"
            linkLabel="Client directory"
          />
          <MetricCard
            icon={<IconMessageDots size={22} className="text-amber-600" />}
            iconBg="bg-amber-50"
            label="Unread Messages"
            value={metrics?.unreadMessages ?? 0}
            loading={loadingMetrics}
            href="/admin/messages"
            linkLabel="Open inbox"
          />
        </div>

        {/* ── Today's schedule ─────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Section header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
            <div>
              <h3 className="text-xl font-black text-slate-900">Today's Schedule</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Appointments for {todayLabel}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
              <IconClockHour4 size={16} className="text-primary" />
              {loadingAppts ? "—" : `${upcoming.length} upcoming`}
            </div>
          </div>

          {/* Rows */}
          {loadingAppts ? (
            <div className="divide-y divide-slate-50">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-6 px-8 py-5">
                  <Skeleton className="h-10 w-16 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40 rounded-lg" />
                    <Skeleton className="h-3 w-56 rounded-lg" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : appointments?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-8">
              <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
                <IconCalendarOff size={28} className="text-slate-300" />
              </div>
              <p className="font-bold text-slate-700">No appointments today</p>
              <p className="text-sm text-slate-400 mt-1 max-w-xs">
                Calendly bookings will appear here automatically once synced.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {appointments!.map((appt) => {
                const start = new Date(appt.start_time);
                const isPast = !isAfter(start, new Date());
                const isCancelled = appt.status === "cancelled";

                return (
                  <div
                    key={appt.id}
                    className={`flex items-center gap-6 px-8 py-5 transition-colors ${
                      isPast || isCancelled
                        ? "opacity-50"
                        : "hover:bg-slate-50/60"
                    }`}
                  >
                    {/* Time column */}
                    <div className="w-16 shrink-0 text-center">
                      <p className="text-lg font-black text-slate-900 leading-none">
                        {format(start, "h:mm")}
                      </p>
                      <p className="text-[11px] font-bold text-slate-400 uppercase">
                        {format(start, "a")}
                      </p>
                    </div>

                    {/* Divider dot */}
                    <div className="w-2 h-2 rounded-full bg-primary/30 shrink-0" />

                    {/* Patient + type */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {appt.invitee_name || appt.invitee_email}
                      </p>
                      <p className="text-sm text-slate-500 truncate mt-0.5">
                        {appt.event_name}
                      </p>
                    </div>

                    {/* Location */}
                    {appt.location && (
                      <p className="text-xs text-slate-400 font-medium hidden lg:block truncate max-w-[140px]">
                        {appt.location}
                      </p>
                    )}

                    {/* Status badge */}
                    {isCancelled ? (
                      <Badge className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide bg-red-100 text-red-600 border-none flex items-center gap-1 shrink-0">
                        <IconCircleXFilled size={11} />
                        Cancelled
                      </Badge>
                    ) : isPast ? (
                      <Badge className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide bg-slate-100 text-slate-500 border-none flex items-center gap-1 shrink-0">
                        <IconCircleCheckFilled size={11} />
                        Completed
                      </Badge>
                    ) : (
                      <Badge className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide bg-emerald-100 text-emerald-700 border-none flex items-center gap-1 shrink-0">
                        <IconCircleCheckFilled size={11} />
                        Confirmed
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
