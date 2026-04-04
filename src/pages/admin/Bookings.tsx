import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Calendar as CalendarIcon,
  Clock,
  MoreVertical,
  Search,
  Check,
  X,
  AlertCircle,
  FileText,
  User as UserIcon,
  Loader2,
  CircleDollarSign,
  CreditCard,
  Ban,
  Filter,
  Eye,
  ChevronDown,
  CalendarDays,
  History,
  ArrowRight,
  ExternalLink,
  MapPin,
  Stethoscope,
  Plus,
  ArrowUpDown,
  SortAsc,
  SortDesc
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { 
  useAdminBookings, 
  useUpdateBookingStatus, 
  useUpdateBookingPaymentStatus, 
  Booking,
  useSessionTypes
} from "@/hooks/useAdminData";
import { format, isToday, isWithinInterval, startOfToday, endOfToday, startOfWeek, endOfWeek, addDays, isSameDay } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const Bookings = () => {
  const { data: bookings, isLoading } = useAdminBookings();
  const { data: sessionTypes } = useSessionTypes();
  const updateStatusMutation = useUpdateBookingStatus();
  const updatePaymentMutation = useUpdateBookingPaymentStatus();

  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sessionTypeFilter, setSessionTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [datePreset, setDatePreset] = useState<string>("all");

  // Sorting State
  const [sortBy, setSortBy] = useState<string>("datetime");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selection State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const filteredAndSortedBookings = (() => {
    if (!bookings) return [];

    let result = bookings.filter(booking => {
      const bookingDate = new Date(booking.sessions.datetime);
      
      const matchesStatus = statusFilter === "all" || booking.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesSessionType = sessionTypeFilter === "all" || booking.sessions.session_types.id === sessionTypeFilter;
      
      let matchesDate = true;
      if (dateRange.from && dateRange.to) {
        matchesDate = isWithinInterval(bookingDate, { start: dateRange.from, end: dateRange.to });
      } else if (dateRange.from) {
        matchesDate = isSameDay(bookingDate, dateRange.from);
      }

      return matchesStatus && matchesSessionType && matchesDate;
    });

    // Sorting Logic
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "datetime":
          comparison = new Date(a.sessions.datetime).getTime() - new Date(b.sessions.datetime).getTime();
          break;
        case "name":
          comparison = (a.profiles.first_name || "").localeCompare(b.profiles.first_name || "");
          break;
        case "price":
          comparison = (a.sessions.session_types.pricing || 0) - (b.sessions.session_types.pricing || 0);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  })();

  const handleUpdateStatus = async (id: string, newStatus: Booking['status']) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status: newStatus });
    } catch (error) {
       // Handled in mutation
    }
  };

  const handleUpdatePayment = async (id: string, newPaymentStatus: Booking['payment_status']) => {
    try {
      await updatePaymentMutation.mutateAsync({ id, payment_status: newPaymentStatus });
    } catch (error) {
       // Handled in mutation
    }
  };

  const applyDatePreset = (preset: string) => {
    setDatePreset(preset);
    const today = startOfToday();
    switch (preset) {
      case 'today':
        setDateRange({ from: today, to: endOfToday() });
        break;
      case 'week':
        setDateRange({ from: startOfWeek(today), to: endOfWeek(today) });
        break;
      case 'next14':
        setDateRange({ from: today, to: addDays(today, 14) });
        break;
      default:
        setDateRange({ from: undefined, to: undefined });
        break;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getPaymentStatusColor = (status: Booking['payment_status']) => {
    switch (status) {
      case 'paid': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'pending': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <DashboardLayout isAdmin={true}>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Clinic Schedule</h2>
            <p className="text-slate-500 mt-1 font-medium">Coordinate patient care and financial records across the facility.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button className="rounded-2xl h-11 px-6 shadow-xl shadow-primary/20 hover:scale-105 transition-all outline-none">
                <Plus className="mr-2 h-4 w-4" />
                Schedule Client
             </Button>
          </div>
        </div>

        {/* Global Toolbar Container */}
        <div className="flex flex-col gap-4">
          {/* Advanced Filter Toolbar */}
          <div className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              {/* Status Filter */}
              <div className="md:col-span-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-slate-50/50 focus:ring-primary/20 text-slate-900 font-semibold">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-slate-500" />
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
              </div>

              {/* Session Type Filter */}
              <div className="md:col-span-3">
                <Select value={sessionTypeFilter} onValueChange={setSessionTypeFilter}>
                  <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-slate-50/50 focus:ring-primary/20 text-slate-900 font-semibold">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-slate-500" />
                      <SelectValue placeholder="Session Type" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                    <SelectItem value="all">All Treatments</SelectItem>
                    {sessionTypes?.map(st => (
                      <SelectItem key={st.id} value={st.id}>{st.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Picker */}
              <div className="md:col-span-6 flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn(
                      "h-11 rounded-2xl border-slate-200 bg-slate-50/50 flex-1 justify-start font-semibold text-slate-900 hover:bg-white transition-all",
                      !dateRange.from && "text-slate-500"
                    )}>
                      <CalendarDays className="mr-2 h-4 w-4 text-slate-500" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Select Appointment Window</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden shadow-2xl border-slate-100" align="end">
                    <div className="flex h-full">
                      <div className="w-44 bg-slate-50/80 p-3 flex flex-col gap-1 border-r border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Presets</p>
                        {[
                          { id: 'all', label: 'Anytime', icon: History },
                          { id: 'today', label: 'Today', icon: Clock },
                          { id: 'week', label: 'This Week', icon: CalendarIcon },
                          { id: 'next14', label: 'Next 14 Days', icon: CalendarDays },
                        ].map((p) => (
                          <Button
                            key={p.id}
                            variant="ghost"
                            size="sm"
                            onClick={() => applyDatePreset(p.id)}
                            className={cn(
                              "justify-start rounded-xl px-2.5 py-1.5 h-auto font-medium text-xs gap-2",
                              datePreset === p.id ? "bg-white text-primary shadow-sm" : "hover:bg-white/50 text-slate-500"
                            )}
                          >
                            <p.icon className="h-3.5 w-3.5 opacity-70" />
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
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => { setStatusFilter("all"); setSessionTypeFilter("all"); applyDatePreset("all"); }}
                  className="h-11 w-11 rounded-2xl bg-slate-50/50 hover:bg-red-50 hover:text-red-500 transition-all text-slate-400"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Sorting and Grouping Toolbar */}
          <div className="flex items-center justify-between px-2">
             <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Ordering</p>
                <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm gap-1">
                   {[
                     { id: 'datetime', label: 'Date', icon: CalendarIcon },
                     { id: 'name', label: 'Name', icon: UserIcon },
                     { id: 'price', label: 'Price', icon: CircleDollarSign },
                     { id: 'status', label: 'Status', icon: History },
                   ].map((s) => (
                     <Button
                      key={s.id}
                      variant={sortBy === s.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSortBy(s.id)}
                      className={cn(
                        "rounded-lg px-3 py-1.5 h-auto text-[11px] font-bold gap-1.5",
                        sortBy === s.id ? "bg-primary text-white shadow-md shadow-primary/20" : "text-slate-500 hover:bg-slate-50"
                      )}
                     >
                       <s.icon className="h-3 w-3" />
                       {s.label}
                     </Button>
                   ))}
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="h-9 w-9 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-500 hover:text-primary transition-all overflow-hidden relative"
                >
                  <div className={cn("transition-all duration-300 transform", sortOrder === "asc" ? "translate-y-0" : "rotate-180")}>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </Button>
             </div>
             
             <div className="text-[11px] font-bold text-slate-400 flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                Showing {filteredAndSortedBookings.length} Appointments
             </div>
          </div>
        </div>

        {/* Bookings List Area */}
        {isLoading ? (
           <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-slate-500 font-medium">Crunching clinic data...</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredAndSortedBookings.map((booking) => {
              const bookingDate = new Date(booking.sessions.datetime);
              return (
                <div 
                  key={booking.id} 
                  onClick={() => setSelectedBooking(booking)}
                  className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all group flex flex-col lg:flex-row lg:items-center justify-between gap-6 cursor-pointer relative overflow-hidden"
                >
                  {/* Status Indicator Stripe */}
                  <div className={cn(
                    "absolute top-0 left-0 w-1.5 h-full",
                    booking.status === 'confirmed' ? 'bg-emerald-500' :
                    booking.status === 'cancelled' ? 'bg-red-500' :
                    booking.status === 'completed' ? 'bg-blue-500' : 'bg-slate-200'
                  )} />

                  <div className="flex items-start gap-5 pl-2">
                    <div className="h-16 w-16 rounded-3xl bg-slate-50/80 flex flex-col items-center justify-center border border-slate-100 group-hover:bg-white group-hover:border-primary/10 transition-colors shadow-sm">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                        {format(bookingDate, "MMM")}
                      </span>
                      <span className="text-2xl font-black text-slate-800 leading-none">
                        {format(bookingDate, "dd")}
                      </span>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="font-bold text-xl text-slate-900 leading-none mr-2">
                          {booking.profiles.first_name} {booking.profiles.last_name || '(No Name)'}
                        </h3>
                        <Badge variant="secondary" className={cn("rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest border-none", getStatusColor(booking.status))}>
                          {booking.status}
                        </Badge>
                        <Badge variant="outline" className={cn("rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5", getPaymentStatusColor(booking.payment_status))}>
                          <CircleDollarSign className="h-3 w-3" />
                          {booking.payment_status || 'unpaid'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-8">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                          <Stethoscope className="h-4 w-4 text-slate-300" />
                          {booking.sessions.session_types.title}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                          <Clock className="h-4 w-4 text-slate-300" />
                          {format(bookingDate, "h:mm a")}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                          <CircleDollarSign className="h-4 w-4 text-slate-300" />
                          ${booking.sessions.session_types.pricing || '0.00'}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                          <UserIcon className="h-4 w-4 text-slate-200" />
                          <span className="max-w-[180px] truncate">{booking.profiles.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 lg:self-center border-t lg:border-t-0 pt-4 lg:pt-0" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center bg-slate-50/50 rounded-2xl p-1 gap-1 border border-slate-100/50">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className={cn(
                              "rounded-xl font-bold text-[11px] h-9 px-3 gap-2 transition-all",
                              booking.payment_status === 'paid' 
                                ? "text-emerald-600 bg-white shadow-sm border border-emerald-100" 
                                : "text-slate-500 hover:text-emerald-500 hover:bg-emerald-50"
                            )}
                          >
                            <CircleDollarSign className="h-3.5 w-3.5" />
                            {booking.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="rounded-2xl border-slate-100 shadow-2xl w-44 p-1">
                           <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Update Transaction</DropdownMenuLabel>
                           {['paid', 'unpaid', 'pending'].map((ps) => (
                             <DropdownMenuItem 
                              key={ps} 
                              onClick={() => handleUpdatePayment(booking.id, ps as Booking['payment_status'])} 
                              className="rounded-xl flex justify-between items-center cursor-pointer px-3 py-2.5 font-medium"
                             >
                                <span className="capitalize">{ps}</span>
                                {booking.payment_status === ps && <Check className="h-3.5 w-3.5 text-primary" />}
                             </DropdownMenuItem>
                           ))}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <div className="h-4 w-px bg-slate-200 mx-1"></div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="rounded-xl font-bold text-[11px] h-9 px-4 text-slate-600 hover:bg-white hover:text-primary transition-all">
                             Manage Status
                             <ChevronDown className="ml-2 h-3.5 w-3.5 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="rounded-2xl border-slate-100 shadow-2xl w-48 p-1">
                          <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Lifecycle State</DropdownMenuLabel>
                          {['confirmed', 'completed', 'cancelled'].map((rs) => (
                            <DropdownMenuItem 
                              key={rs} 
                              onClick={() => handleUpdateStatus(booking.id, rs as Booking['status'])}
                              className="rounded-xl flex justify-between items-center cursor-pointer px-3 py-2.5 font-medium capitalize"
                            >
                              {rs}
                              {booking.status === rs && <Check className="h-3.5 w-3.5 text-primary" />}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setSelectedBooking(booking)}
                      className="h-10 w-10 text-slate-400 hover:bg-slate-50 hover:text-primary rounded-xl transition-all border border-transparent hover:border-slate-100"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {filteredAndSortedBookings.length === 0 && (
               <div className="bg-white border-2 border-dashed border-slate-100 rounded-[40px] py-24 text-center shadow-inner">
                  <div className="bg-slate-50 h-24 w-24 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100/50">
                    <CalendarDays className="h-12 w-12 text-slate-200/50" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">No appointments found</h3>
                  <p className="text-slate-500 max-w-xs mx-auto mt-2 font-medium">Try broadening your filters or reset the search parameters.</p>
                  <Button 
                    variant="link" 
                    className="mt-6 text-primary font-bold text-lg"
                    onClick={() => { setStatusFilter("all"); setSessionTypeFilter("all"); applyDatePreset("all"); }}
                  >
                    Reset all filters
                  </Button>
               </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-[650px] rounded-[40px] overflow-hidden p-0 border-none shadow-2xl">
          {selectedBooking && (
            <div className="flex flex-col">
              {/* Animated Header Component */}
              <div className="h-40 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-10 flex items-start justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-20 opacity-10 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10 flex items-center gap-6">
                   <div className="h-20 w-20 bg-white/20 backdrop-blur-md rounded-3xl border border-white/20 flex flex-col items-center justify-center text-white">
                      <span className="text-xs font-bold uppercase tracking-widest">{format(new Date(selectedBooking.sessions.datetime), "MMM")}</span>
                      <span className="text-3xl font-black">{format(new Date(selectedBooking.sessions.datetime), "dd")}</span>
                   </div>
                   <div className="text-white">
                      <h2 className="text-3xl font-black tracking-tight">{selectedBooking.profiles.first_name} {selectedBooking.profiles.last_name}</h2>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-none rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                          {selectedBooking.status}
                        </Badge>
                        <Badge className="bg-black/10 hover:bg-black/20 text-white border-none rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                          {selectedBooking.payment_status}
                        </Badge>
                      </div>
                   </div>
                </div>
              </div>

              <div className="px-10 py-10 space-y-10">
                <div className="grid grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Appointment Summary</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                           <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                             <Stethoscope className="h-5 w-5 text-primary" />
                           </div>
                           <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Treatment</p>
                              <p className="font-bold text-slate-800">{selectedBooking.sessions.session_types.title}</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-4">
                           <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                             <Clock className="h-5 w-5 text-primary" />
                           </div>
                           <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Schedule</p>
                              <p className="font-bold text-slate-800">{format(new Date(selectedBooking.sessions.datetime), "EEEE, h:mm a")}</p>
                           </div>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Credentials</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-100/50">
                           <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                             <AvatarImage src={selectedBooking.profiles.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedBooking.profiles.email}`} />
                             <AvatarFallback>{selectedBooking.profiles.first_name?.charAt(0)}</AvatarFallback>
                           </Avatar>
                           <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{selectedBooking.profiles.first_name} {selectedBooking.profiles.last_name}</p>
                              <p className="text-xs text-slate-500 truncate">{selectedBooking.profiles.email}</p>
                           </div>
                        </div>
                        <Button variant="outline" className="w-full rounded-2xl h-11 border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50">
                           <UserIcon className="h-4 w-4 mr-2" />
                           Jump to Patient Profile
                        </Button>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-50/80 p-6 rounded-[32px] border border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
                         <CircleDollarSign className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                         <p className="font-bold text-slate-900">Payment Collection</p>
                         <p className="text-sm text-slate-500">Service Fee: ${selectedBooking.sessions.session_types.pricing || '0.00'}</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                       <Button 
                        size="sm" 
                        variant={selectedBooking.payment_status === 'paid' ? 'outline' : 'default'}
                        onClick={() => handleUpdatePayment(selectedBooking.id, selectedBooking.payment_status === 'paid' ? 'unpaid' : 'paid')}
                        className={cn("rounded-xl px-4 font-bold h-10", selectedBooking.payment_status === 'paid' && "border-slate-200 text-slate-600")}
                       >
                         {selectedBooking.payment_status === 'paid' ? 'Mark Unpaid' : 'Mark as Paid'}
                       </Button>
                   </div>
                </div>
              </div>

              <DialogFooter className="px-10 py-6 bg-slate-50/30 border-t border-slate-100 flex items-center sm:justify-between">
                <div className="flex items-center gap-2">
                   <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:bg-white border border-transparent hover:border-slate-100">
                      <MoreVertical className="h-4 w-4" />
                   </Button>
                </div>
                <div className="flex items-center gap-3">
                   <Button variant="ghost" onClick={() => setSelectedBooking(null)} className="rounded-xl font-bold h-11 px-6">
                      Cancel
                   </Button>
                   <Button className="rounded-xl font-bold h-11 px-8 shadow-xl shadow-primary/10">
                      Save All Changes
                   </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Bookings;
