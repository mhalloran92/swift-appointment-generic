import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Bell, User, AlertCircle, CheckCircle2, ChevronRight, X, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      type: "action",
      title: "Update your profile",
      description: "Please add your emergency contact detail to your clinical records.",
      icon: User,
      color: "bg-primary/10 text-primary",
      time: "2 hours ago",
      isNew: true
    },
    {
      id: 2,
      type: "alert",
      title: "Holiday Hours",
      description: "We are closed this Friday for the public holiday. No sessions will be held.",
      icon: AlertCircle,
      color: "bg-amber-100 text-amber-600",
      time: "5 hours ago",
      isNew: true
    },
    {
      id: 3,
      type: "success",
      title: "Booking Confirmed",
      description: "Your session on Nov 24th has been successfully confirmed by Dr. Jeffery Kamzik.",
      icon: CheckCircle2,
      color: "bg-emerald-100 text-emerald-600",
      time: "1 day ago",
      isNew: false
    },
    {
      id: 4,
      type: "info",
      title: "New Protocol Available",
      description: "We've added a new 'Post-Adjustment Recovery' guide to the wellness section.",
      icon: Info,
      color: "bg-blue-100 text-blue-600",
      time: "3 days ago",
      isNew: false
    }
  ];

  return (
    <DashboardLayout isAdmin={false}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Clinical Alerts</h1>
            <p className="text-slate-500 mt-1 font-medium">Stay updated with your treatment and clinic announcements.</p>
          </div>
          <Button variant="ghost" className="text-slate-400 font-bold hover:text-primary">
            Mark all as read
          </Button>
        </div>

        <div className="space-y-4">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`group relative overflow-hidden bg-white rounded-[32px] border p-8 transition-all hover:shadow-xl hover:translate-y-[-2px] ${
                notif.isNew ? "border-primary/20 shadow-sm" : "border-slate-100"
              }`}
            >
              {notif.isNew && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
              )}
              
              <div className="flex gap-6">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform ${notif.color}`}>
                  <notif.icon className="h-7 w-7" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-black text-slate-900">{notif.title}</h3>
                      {notif.isNew && (
                        <Badge className="bg-primary hover:bg-primary text-[10px] text-white border-none py-0 px-2 rounded-full h-5">NEW</Badge>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{notif.time}</span>
                  </div>
                  
                  <p className="text-slate-600 font-medium leading-relaxed max-w-2xl">
                    {notif.description}
                  </p>
                  
                  <div className="pt-2 flex items-center gap-4">
                    <Button variant="link" className="p-0 h-auto font-black text-primary text-sm no-underline group-hover:gap-2 transition-all">
                      View Details <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="h-1 w-1 rounded-full bg-slate-300" />
                    <button className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-900 rounded-[40px] p-10 text-center space-y-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 tracking-tighter to-transparent opacity-50 pointer-events-none" />
          <h3 className="text-xl font-black text-white relative z-10">End of alerts</h3>
          <p className="text-slate-400 font-medium relative z-10">You're all caught up with your clinical updates.</p>
          <Button 
            variant="outline" 
            className="rounded-2xl h-12 px-8 font-bold border-white/10 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm transition-all relative z-10 mt-4"
            onClick={() => window.history.back()}
          >
            Return to Hub
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
