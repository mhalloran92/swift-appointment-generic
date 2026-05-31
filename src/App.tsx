import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import BookingSuccess from "./pages/BookingSuccess";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/SignUp";
import ResetPassword from "./pages/auth/ResetPassword";

import Dashboard from "./pages/client/ClientDashboard";
import Notifications from "./pages/client/Notifications";
import CarePlan from "./pages/client/CarePlan";
import Insurance from "./pages/client/Insurance";
import Resources from "./pages/client/Resources";
import ClientMessages from "./pages/client/Messages";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Sessions from "./pages/admin/Sessions";
import Clients from "./pages/admin/Clients";
import Bookings from "./pages/admin/Bookings";
import Availability from "./pages/admin/Availability";
import AdminMessages from "./pages/admin/Messages";
import AdminSettings from "./pages/admin/Settings";
import IntakeForms from "./pages/admin/IntakeForms";
import IntakeForm from "./pages/IntakeForm";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Sonner />
        <Toaster />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/intake" element={<IntakeForm />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected Client/User Routes */}
            <Route element={<ProtectedRoute allowedRoles={["user", "client", "admin"]} />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/care-plan" element={<CarePlan />} />
              <Route path="/insurance" element={<Insurance />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/dashboard/messages" element={<ClientMessages />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={["admin", "doctor", "office_manager"]} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/sessions" element={<Sessions />} />
              <Route path="/admin/clients" element={<Clients />} />
              <Route path="/admin/bookings" element={<Bookings />} />
              <Route path="/admin/availability" element={<Availability />} />
              <Route path="/admin/messages" element={<AdminMessages />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/intake-forms" element={<IntakeForms />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;