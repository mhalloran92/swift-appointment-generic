import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useClientAppointments, useClientProfile } from "@/hooks/useClientData";
import {
  Calendar,
  Clock,
  ChevronRight,
  CheckCircle2,
  Bell,
  Activity,
  User,
  XCircle,
  Stethoscope,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, isBefore } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import CalendlyPopupButton from "@/components/calendly/CalendlyPopupButton";
import { siteConfig } from "@/config/site-config";

const ClientDashboard = () => {
  const { user } = useAuth();
  const { data: appointments, isLoading } = useClientAppointments(user?.id);
  const { data: profile } = useClientProfile(user?.id);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("upcoming");

  const prefill = useMemo(() => ({
    name: [
      profile?.first_name || user?.user_metadata?.first_name,
      profile?.last_name  || user?.user_metadata?.last_name,
    ].filter(Boolean).join(' ').trim(),
    email: user?.email || '',
    phone: profile?.phone || '',
  }), [
    profile?.first_name, profile?.last_name, profile?.phone,
    user?.user_metadata?.first_name, user?.user_metadata?.last_name, user?.email,
  ]);

  useEffect(() => {
    const handleCalendlyEvent = (e: MessageEvent) => {
      if (e.data?.event === "calendly.event_scheduled") {
        queryClient.invalidateQueries({ queryKey: ["client-appointments"] });
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["client-appointments"] });
        }, 3000);
      }
    };
    window.addEventListener("message", handleCalendlyEvent);
    return () => window.removeEventListener("message", handleCalendlyEvent);
  }, [queryClient]);

  const upcomingAppointments = appointments?.filter(a =>
    a.status === "active" && isAfter(new Date(a.start_time), new Date())
  ) || [];

  const pastAppointments = appointments?.filter(a =>
    a.status === "cancelled" || isBefore(new Date(a.start_time), new Date())
  ) || [];

  const nextAppointment = upcomingAppointments[0];

  return (
    <DashboardLayout isAdmin={false}>
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Personalized Welcome Hero */}
        <section className="relative overflow-hidden rounded-[40px] bg-slate-900 text-white p-8 md:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Welcome back, <br/>
                <span className="text-primary">{profile?.first_name || user?.user_metadata?.first_name || 'Friend'}!</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-sm">
                {pastAppointments.length === 0
                  ? "Ready to get started? Book your first session below."
                  : `Your clinical path is on track. You've completed ${pastAppointments.length} session${pastAppointments.length === 1 ? "" : "s"} so far.`}
              </p>
              <div className="flex flex-wrap gap-4">
                <CalendlyPopupButton
                  text="Book New Session"
                  className="rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                  prefill={prefill}
                />
                <Link to="/care-plan">
                  <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all">
                    View Care Plan
                  </Button>
                </Link>
              </div>
            </div>

            {/* Next Visit Spotlight */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Next Visit</h3>
                {nextAppointment && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-none rounded-full px-3 py-0.5 text-[10px] uppercase font-black">Confirmed</Badge>
                )}
              </div>

              {nextAppointment ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/20 flex flex-col items-center justify-center text-primary border border-primary/20">
                      <span className="text-xs uppercase font-black">{format(new Date(nextAppointment.start_time), "MMM")}</span>
                      <span className="text-xl font-black leading-none">{format(new Date(nextAppointment.start_time), "dd")}</span>
                    </div>
                    <div>
                      <p className="font-bold text-lg">{nextAppointment.event_name}</p>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Clock className="h-3.5 w-3.5" />
                        {format(new Date(nextAppointment.start_time), "h:mm a")}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" className="flex-1 rounded-xl h-10 font-bold text-xs">Add to Calendar</Button>
                    {nextAppointment.reschedule_url && (
                      <a href={nextAppointment.reschedule_url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" className="rounded-xl h-10 font-bold text-xs text-slate-400 hover:text-white hover:bg-white/5">Reschedule</Button>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-slate-400 text-sm italic">No upcoming visits scheduled.</p>
                  <CalendlyPopupButton
                    text="Find a slot today →"
                    variant="link"
                    size="sm"
                    className="text-primary font-bold mt-2 h-auto p-0"
                    prefill={prefill}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left: Appointment Management */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <Stethoscope className="h-6 w-6 text-primary" />
                Appointment Hub
              </h2>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="bg-slate-100 rounded-xl p-1 h-10 border-none">
                  <TabsTrigger value="upcoming" className="rounded-lg font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">Upcoming</TabsTrigger>
                  <TabsTrigger value="history" className="rounded-lg font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">History</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Tabs value={activeTab} className="w-full">
              <TabsContent value="upcoming" className="mt-0 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-[30px]" />)}
                  </div>
                ) : upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map(appt => (
                    <div key={appt.id} className="group bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="h-16 w-16 rounded-3xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100 group-hover:bg-primary group-hover:border-primary transition-colors">
                          <span className="text-[10px] uppercase font-black text-slate-400 group-hover:text-white/70">{format(new Date(appt.start_time), "EEE")}</span>
                          <span className="text-2xl font-black text-slate-900 group-hover:text-white leading-none">{format(new Date(appt.start_time), "dd")}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-lg">{appt.event_name}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-slate-500 text-sm font-medium">
                            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 opacity-60" /> {format(new Date(appt.start_time), "h:mm a")}</span>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Confirmed</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {appt.cancel_url && (
                          <a href={appt.cancel_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="rounded-xl font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all">
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
                    <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-900">No active bookings</h3>
                    <p className="text-slate-500 text-sm max-w-[200px] mx-auto mt-1">Ready for your next session? Browse available slots below.</p>
                    <CalendlyPopupButton
                      text="Book Appointment"
                      className="mt-6 rounded-xl font-bold shadow-lg shadow-primary/20"
                      prefill={prefill}
                    />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-0 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {pastAppointments.length > 0 ? (
                  pastAppointments.map(appt => (
                    <div key={appt.id} className="bg-slate-50/50 rounded-[32px] p-6 border border-slate-100 flex items-center justify-between opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-2xl bg-white flex flex-col items-center justify-center border border-slate-100">
                          <span className="text-xs font-black text-slate-800">{format(new Date(appt.start_time), "dd")}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{format(new Date(appt.start_time), "MMM")}</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{appt.event_name}</p>
                          <p className="text-xs text-slate-500 font-medium">
                            {appt.status === "cancelled" ? "Cancelled" : `Completed on ${format(new Date(appt.start_time), "PPP")}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-slate-400 italic">No past sessions recorded.</div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Notifications & Activity */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Clinic Alerts
                </h2>
                <Badge className="bg-primary/10 text-primary border-none text-[10px] rounded-full">1 New</Badge>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white transition-colors cursor-pointer group">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Update your profile</p>
                    <p className="text-xs text-slate-500 mt-0.5">Please add your emergency contact details.</p>
                  </div>
                </div>
              </div>

              <Link to="/notifications">
                <Button variant="link" className="w-full font-bold text-slate-400 no-underline hover:text-primary p-0 h-auto">
                  View all notifications <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-[32px] border border-primary/10 p-8 text-center space-y-4">
              <div className="h-16 w-16 bg-white rounded-3xl shadow-lg flex items-center justify-center mx-auto mb-4 border border-white">
                <Activity className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-black text-slate-900 leading-tight">{siteConfig.wellnessGoal.title}</h3>
              <p className="text-sm text-slate-600 font-medium">{siteConfig.wellnessGoal.description}</p>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
