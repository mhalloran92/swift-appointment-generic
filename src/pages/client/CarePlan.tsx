import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ClipboardList } from "lucide-react";

const CarePlan = () => {
  return (
    <DashboardLayout isAdmin={false}>
      <div className="max-w-2xl mx-auto py-24 text-center space-y-6">
        <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto">
          <ClipboardList className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Care Plan</h1>
        <p className="text-slate-600 text-lg font-medium leading-relaxed">
          Your care plan will be ready after your first visit. Once your provider reviews your assessment, you'll find personalized resources, exercises, and next steps right here.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default CarePlan;
