import { useState } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useClientBookings, useCancelBooking, useClientProfile } from "@/hooks/useClientData";
import { 
  Calendar, 
  Clock, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  CalendarPlus,
  ArrowRight,
  Bell,
  Activity,
  User,
  History,
  XCircle,
  Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import CalendlyPopupButton from "@/components/calendly/CalendlyPopupButton";

const ClientDashboard = () => {
  const { user } = useAuth();
  const { data: bookings, isLoading } = useClientBookings(user?.id);
  const { data: profile } = useClientProfile(user?.id);
  const cancelMutation = useCancelBooking();
  const [activeTab, setActiveTab] = useState("upcoming");

  const upcomingBookings = bookings?.filter(b => 
    b.status === 'confirmed' && isAfter(new Date(b.sessions.datetime), new Date())
  ) || [];

  const pastBookings = bookings?.filter(b => 
    b.status === 'completed' || (b.status === 'confirmed' && isBefore(new Date(b.sessions.datetime), new Date()))
  ) || [];

  const nextBooking = upcomingBookings[upcomingBookings.length - 1]; // Closest one due to sort

  return (
    <DashboardLayout isAdmin={false}>
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Personalized Welcome Hero */}
        <section className="relative overflow-hidden rounded-[40px] bg-slate-900 text-white p-8 md:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-widest">
                 <Activity className="h-3 w-3 text-emerald-400" />
                 Wellness Portal Active
               </div>
               <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                 Welcome back, <br/>
                 <span className="text-primary">{profile?.first_name || user?.user_metadata?.first_name || 'Friend'}!</span>
               </h1>
               <p className="text-slate-400 text-lg max-w-sm">
                 Your clinical path is on track. You've completed {pastBookings.length} sessions so far.
               </p>
               <div className="flex flex-wrap gap-4">
                 <CalendlyPopupButton 
                   text="Book New Session"
                   className="rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                 />
                 <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all">
                   View Care Plan
                 </Button>
               </div>
            </div>

            {/* Next Visit Spotlight */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-xl space-y-4">
               <div className="flex items-center justify-between">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Next Visit</h3>
                 <Badge className="bg-emerald-500/20 text-emerald-400 border-none rounded-full px-3 py-0.5 text-[10px] uppercase font-black">Confirmed</Badge>
               </div>
               
               {nextBooking ? (
                 <div className="space-y-4">
                    <div className="flex items-center gap-4">
                       <div className="h-14 w-14 rounded-2xl bg-primary/20 flex flex-col items-center justify-center text-primary border border-primary/20">
                          <span className="text-xs uppercase font-black">{format(new Date(nextBooking.sessions.datetime), "MMM")}</span>
                          <span className="text-xl font-black leading-none">{format(new Date(nextBooking.sessions.datetime), "dd")}</span>
                       </div>
                       <div>
                          <p className="font-bold text-lg">{nextBooking.sessions.session_types.title}</p>
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                             <Clock className="h-3.5 w-3.5" />
                             {format(new Date(nextBooking.sessions.datetime), "h:mm a")}
                          </div>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <Button variant="secondary" className="flex-1 rounded-xl h-10 font-bold text-xs">Add to Calendar</Button>
                       <Button variant="ghost" className="rounded-xl h-10 font-bold text-xs text-slate-400 hover:text-white hover:bg-white/5">Manage</Button>
                    </div>
                 </div>
               ) : (
                 <div className="py-6 text-center">
                    <p className="text-slate-400 text-sm italic">No upcoming visits scheduled.</p>
                    <Button variant="link" className="text-primary font-bold mt-2 h-auto p-0">Find a slot today <ArrowRight className="ml-1 h-3 w-3" /></Button>
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
                  ) : upcomingBookings.length > 0 ? (
                    upcomingBookings.map(booking => (
                      <div key={booking.id} className="group bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                         <div className="flex items-center gap-5">
                            <div className="h-16 w-16 rounded-3xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100 group-hover:bg-primary group-hover:border-primary transition-colors">
                               <span className="text-[10px] uppercase font-black text-slate-400 group-hover:text-white/70">{format(new Date(booking.sessions.datetime), "EEE")}</span>
                               <span className="text-2xl font-black text-slate-900 group-hover:text-white leading-none">{format(new Date(booking.sessions.datetime), "dd")}</span>
                            </div>
                            <div>
                               <p className="font-bold text-slate-900 text-lg">{booking.sessions.session_types.title}</p>
                               <div className="flex flex-wrap items-center gap-3 mt-1 text-slate-500 text-sm font-medium">
                                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 opacity-60" /> {format(new Date(booking.sessions.datetime), "h:mm a")}</span>
                                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                                  <span className="flex items-center gap-1.5 capitalize"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> {booking.status}</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <Button 
                              variant="outline" 
                              className="rounded-xl font-bold text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all"
                              onClick={() => {
                                if(window.confirm("Are you sure you want to cancel this appointment?")) {
                                  cancelMutation.mutate(booking.id);
                                }
                              }}
                              disabled={cancelMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
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
                       />
                    </div>
                  )}
               </TabsContent>

               <TabsContent value="history" className="mt-0 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {pastBookings.length > 0 ? (
                    pastBookings.map(booking => (
                      <div key={booking.id} className="bg-slate-50/50 rounded-[32px] p-6 border border-slate-100 flex items-center justify-between opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                        <div className="flex items-center gap-5">
                          <div className="h-12 w-12 rounded-2xl bg-white flex flex-col items-center justify-center border border-slate-100">
                             <span className="text-xs font-black text-slate-800">{format(new Date(booking.sessions.datetime), "dd")}</span>
                             <span className="text-[10px] font-bold text-slate-400 uppercase">{format(new Date(booking.sessions.datetime), "MMM")}</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{booking.sessions.session_types.title}</p>
                            <p className="text-xs text-slate-500 font-medium">Completed on {format(new Date(booking.sessions.datetime), "PPP")}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="font-bold text-primary hover:bg-white rounded-lg">View Summary</Button>
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
                 <Badge className="bg-primary/10 text-primary border-none text-[10px] rounded-full">2 New</Badge>
               </div>
               
               <div className="space-y-4">
                  <div className="flex gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white transition-colors cursor-pointer group">
                     <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <User className="h-5 w-5" />
                     </div>
                     <div>
                        <p className="font-bold text-slate-900 text-sm">Update your profile</p>
                        <p className="text-xs text-slate-500 mt-0.5">Please add your emergency contact detail.</p>
                     </div>
                  </div>

                  <div className="flex gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white transition-colors cursor-pointer group">
                     <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                        <AlertCircle className="h-5 w-5" />
                     </div>
                     <div>
                        <p className="font-bold text-slate-900 text-sm">Holiday Hours</p>
                        <p className="text-xs text-slate-500 mt-0.5">We are closed this Friday for the public holiday.</p>
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
               <h3 className="text-lg font-black text-slate-900 leading-tight">Your Wellness Goal</h3>
               <p className="text-sm text-slate-600 font-medium">Maintain a bi-weekly adjustment schedule for optimal mobility.</p>
               <div className="w-full bg-white/50 h-2 rounded-full overflow-hidden">
                 <div className="bg-primary h-full w-[65%]" />
               </div>
               <p className="text-[10px] font-bold text-primary uppercase tracking-widest">65% OF TARGET ACHIEVED</p>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ClientDashboard;
