import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

const Availability = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <DashboardLayout isAdmin={true}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Weekly Availability</h1>
        <p className="text-slate-500 mt-1">Set the times when the clinic is open for appointments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Select Date</h2>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border mx-auto"
          />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Time Slots for {date?.toDateString()}</h2>
            <div className="text-center py-12 text-slate-500">
              <p>Select a date to manage specific availability or edit the global weekly template below.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Weekly Template</h2>
            <div className="space-y-4">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                <div key={day} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                  <span className="font-medium text-slate-700">{day}</span>
                  <div className="text-sm text-slate-500">
                    9:00 AM - 5:00 PM
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Availability;
