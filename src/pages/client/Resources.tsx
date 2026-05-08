import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BookOpen } from "lucide-react";

const Resources = () => {
  return (
    <DashboardLayout isAdmin={false}>
      <div className="max-w-2xl mx-auto py-24 text-center space-y-6">
        <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
          <BookOpen className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Resources</h1>
        <p className="text-slate-600 text-lg font-medium leading-relaxed">
          Your provider will add personalized resources here after your first visit.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Resources;
