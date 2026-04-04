import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Clock, 
  Search, 
  Filter, 
  Loader2, 
  MapPin,
  Eye,
  CircleDollarSign,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  XCircle,
  Menu,
  MoreVertical,
  History,
  TrendingUp,
  Settings2,
  ListFilter
} from "lucide-react";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  useSessionTypes, 
  useCreateSessionType, 
  useUpdateSessionType, 
  useDeleteSessionType, 
  useAdminSessions,
  useUpdateSessionStatus,
  useDeleteSession,
  SessionType,
  AdminSession
} from "@/hooks/useAdminData";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isFuture, parseISO } from "date-fns";

const Sessions = () => {
  // Data State
  const { data: categories, isLoading: isCategoriesLoading } = useSessionTypes();
  const { data: sessions, isLoading: isSessionsLoading } = useAdminSessions();
  
  // Mutations
  const createCategoryMutation = useCreateSessionType();
  const updateCategoryMutation = useUpdateSessionType();
  const deleteCategoryMutation = useDeleteSessionType();
  
  const updateSessionMutation = useUpdateSessionStatus();
  const deleteSessionMutation = useDeleteSession();

  // Navigation State
  const [activeTab, setActiveTab] = useState("categories");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals State
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SessionType | null>(null);
  const [viewingCategory, setViewingCategory] = useState<SessionType | null>(null);
  
  const [viewingSessioninstance, setViewingSessionInstance] = useState<AdminSession | null>(null);

  // Form State (for Categories)
  const [categoryFormData, setCategoryFormData] = useState({
    title: "",
    description: "",
    pricing: "0",
    duration_minutes: "60",
    location: "Main Clinic"
  });

  // Filtered Lists
  const filteredCategories = useMemo(() => 
    categories?.filter(cat => 
      cat.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [], [categories, searchQuery]
  );

  const filteredSessions = useMemo(() => 
    sessions?.filter(sess => 
      sess.session_types.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [], [sessions, searchQuery]
  );

  // Category Handlers
  const handleOpenCategoryDialog = (category?: SessionType) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        title: category.title,
        description: category.description || "",
        pricing: category.pricing.toString(),
        duration_minutes: category.duration_minutes.toString(),
        location: category.location || "Main Clinic"
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        title: "",
        description: "",
        pricing: "0",
        duration_minutes: "60",
        location: "Main Clinic"
      });
    }
    setIsCategoryDialogOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: categoryFormData.title,
      description: categoryFormData.description,
      pricing: parseFloat(categoryFormData.pricing),
      duration_minutes: parseInt(categoryFormData.duration_minutes),
      location: categoryFormData.location
    };

    try {
      if (editingCategory) {
        await updateCategoryMutation.mutateAsync({ id: editingCategory.id, ...payload });
      } else {
        await createCategoryMutation.mutateAsync(payload);
      }
      setIsCategoryDialogOpen(false);
      setViewingCategory(null);
    } catch (error) {}
  };

  const handleCategoryDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteCategoryMutation.mutateAsync(id);
      setViewingCategory(null);
    } catch (error) {}
  };

  // Session Instance Handlers
  const handleSessionStatusUpdate = async (id: string, status: AdminSession['status']) => {
    try {
      await updateSessionMutation.mutateAsync({ id, status });
      setViewingSessionInstance(null);
    } catch (error) {}
  };

  const handleSessionDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this scheduled session?")) return;
    try {
      await deleteSessionMutation.mutateAsync(id);
      setViewingSessionInstance(null);
    } catch (error) {}
  };

  return (
    <DashboardLayout isAdmin={true}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Clinical Management</h2>
            <p className="text-slate-500 font-medium text-sm">Configure treatments and active schedule instances.</p>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="rounded-2xl h-11 px-5 border-slate-200 bg-white shadow-sm font-bold text-xs gap-2 hidden sm:flex">
                <History className="h-4 w-4" />
                Change Logs
             </Button>
             <Button 
                onClick={() => handleOpenCategoryDialog()} 
                className="rounded-2xl h-11 px-6 shadow-[0_8px_30px_rgb(59,130,246,0.3)] transition-all hover:scale-105 active:scale-95 font-black text-xs"
              >
                <Plus className="mr-2 h-4 w-4 stroke-[3]" />
                New Service Offering
             </Button>
          </div>
        </div>

        {/* Unified Tab Area */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <TabsList className="bg-slate-100 p-1.5 rounded-[22px] h-auto w-fit border border-slate-200/50">
              <TabsTrigger 
                value="categories" 
                className="rounded-[16px] px-8 py-2.5 font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/10 transition-all duration-300"
              >
                Categories
              </TabsTrigger>
              <TabsTrigger 
                value="instances" 
                className="rounded-[16px] px-8 py-2.5 font-black text-[11px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/10 transition-all duration-300"
              >
                Session Types
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder={activeTab === "categories" ? "Search services..." : "Search appointments..."}
                  className="pl-11 h-12 rounded-[20px] border-slate-200 bg-white focus:ring-primary/20 text-slate-900 font-bold placeholder:font-medium shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="h-12 rounded-[20px] px-6 border-slate-200 bg-white text-slate-700 font-black text-[10px] gap-3 uppercase tracking-wider shadow-sm">
                <ListFilter className="h-4 w-4" />
                Advanced Filters
              </Button>
            </div>
          </div>

          {/* Tab 1: Categories (Definitions) */}
          <TabsContent value="categories" className="mt-0 outline-none">
            {isCategoriesLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing service categories...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                {filteredCategories.map((category) => (
                  <Card 
                    key={category.id} 
                    onClick={() => setViewingCategory(category)}
                    className="border-none shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.05)] bg-white overflow-hidden group hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 cursor-pointer rounded-[40px] relative"
                  >
                    <div className="h-2 w-full bg-slate-50 group-hover:bg-primary transition-colors duration-500" />
                    <CardHeader className="pb-4 pt-8 px-8">
                      <div className="flex justify-between items-start mb-5">
                        <Badge className="bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest">
                          Service Offering
                        </Badge>
                        <div className="flex gap-1 transform translate-x-2 transition-all">
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-2xl shadow-none">
                            <Eye className="h-4 w-4 stroke-[2.5]" />
                          </Button>
                        </div>
                      </div>
                      <CardTitle className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{category.title}</CardTitle>
                      <CardDescription className="line-clamp-2 h-10 mt-3 font-medium text-slate-500 leading-relaxed">
                        {category.description || "Comprehensive clinical details available in inspection mode."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 pb-8 px-8 border-t border-slate-50/80 mt-2 flex items-center justify-between bg-slate-50/40 group-hover:bg-transparent transition-colors">
                      <div className="flex gap-5">
                        <div className="flex items-center gap-2 font-black text-slate-900">
                           <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-100">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                           </div>
                           <span className="text-sm">{category.duration_minutes}m</span>
                        </div>
                        <div className="flex items-center gap-2 font-black text-slate-900">
                           <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-100">
                              <CircleDollarSign className="h-3.5 w-3.5 text-primary" />
                           </div>
                           <span className="text-sm">${category.pricing}</span>
                        </div>
                      </div>
                      <div className="h-10 w-10 rounded-2xl flex items-center justify-center bg-white border border-slate-100 text-slate-300 group-hover:text-primary group-hover:border-primary/30 transition-all shadow-sm group-hover:shadow-md">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <button 
                  onClick={() => handleOpenCategoryDialog()}
                  className="border-2 border-dashed border-slate-200 rounded-[40px] p-8 flex flex-col items-center justify-center gap-5 text-slate-400 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all group min-h-[250px]"
                >
                  <div className="p-6 rounded-[28px] bg-slate-50 group-hover:bg-white transition-all shadow-sm group-hover:shadow-xl group-hover:scale-110">
                    <Plus className="h-8 w-8 stroke-[2.5]" />
                  </div>
                  <span className="font-black uppercase tracking-[0.2em] text-[10px]">Initialize New Service</span>
                </button>
              </div>
            )}
          </TabsContent>

          {/* Tab 2: Session Instances (Scheduled Slots) */}
          <TabsContent value="instances" className="mt-0 outline-none">
            {isSessionsLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing live schedule...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                {filteredSessions.map((session) => (
                  <Card 
                    key={session.id} 
                    onClick={() => setViewingSessionInstance(session)}
                    className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer rounded-[40px] border border-transparent hover:border-slate-100"
                  >
                    <div className={cn(
                      "h-2 w-full transition-colors duration-500",
                      session.status === 'active' ? "bg-emerald-500/20 group-hover:bg-emerald-500" :
                      session.status === 'cancelled' ? "bg-red-500/20 group-hover:bg-red-500" :
                      "bg-blue-500/20 group-hover:bg-blue-500"
                    )} />
                    <CardHeader className="pb-4 pt-8 px-8">
                       <div className="flex justify-between items-start mb-5">
                          <Badge className={cn(
                            "rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest border-none",
                            session.status === 'active' ? "bg-emerald-50 text-emerald-600" :
                            session.status === 'cancelled' ? "bg-red-50 text-red-600" :
                            "bg-blue-50 text-blue-600"
                          )}>
                            {session.status}
                          </Badge>
                          <div className="flex gap-1 transform translate-x-2 transition-all">
                             <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-2xl shadow-none">
                                <Eye className="h-4 w-4 stroke-[2.5]" />
                             </Button>
                          </div>
                       </div>
                       <CardTitle className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">
                         {format(parseISO(session.datetime), "h:mm a")}
                       </CardTitle>
                       <CardDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                         {format(parseISO(session.datetime), "EEEE, MMMM do")}
                       </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 pb-8 px-8 border-t border-slate-50/80 mt-4 flex items-center justify-between bg-slate-50/40">
                       <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Category</span>
                          <span className="font-black text-slate-800 text-sm leading-none">{session.session_types.title}</span>
                       </div>
                       <div className="flex flex-col items-end gap-1.5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Occupancy</span>
                          <div className="flex items-center gap-2">
                             <div className="h-2 w-16 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className={cn(
                                    "h-full transition-all duration-500",
                                    session.booked_slots >= session.max_slots ? "bg-red-500" : "bg-primary"
                                  )}
                                  style={{ width: `${(session.booked_slots / session.max_slots) * 100}%` }}
                                />
                             </div>
                             <span className="font-black text-slate-900 text-xs">{session.booked_slots}/{session.max_slots}</span>
                          </div>
                       </div>
                    </CardContent>
                  </Card>
                ))}

                <button 
                  className="border-2 border-dashed border-slate-200 rounded-[40px] p-8 flex flex-col items-center justify-center gap-5 text-slate-400 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all group min-h-[250px]"
                >
                  <div className="p-6 rounded-[28px] bg-slate-50 group-hover:bg-white transition-all shadow-sm group-hover:shadow-xl group-hover:scale-110">
                    <CalendarDays className="h-8 w-8 stroke-[2.5]" />
                  </div>
                  <span className="font-black uppercase tracking-[0.2em] text-[10px]">Bulk Schedule Slots</span>
                </button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* --- MODALS --- */}

      {/* 1. Category View Modal */}
      <Dialog open={!!viewingCategory} onOpenChange={(open) => !open && setViewingCategory(null)}>
        <DialogContent className="sm:max-w-[550px] rounded-[48px] overflow-hidden p-0 border-none shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]">
          {viewingCategory && (
            <div className="flex flex-col">
              <div className="h-36 bg-gradient-to-br from-primary via-primary/95 to-primary/80 p-10 flex items-end relative overflow-hidden">
                <div className="absolute top-0 right-0 p-24 opacity-10 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="relative z-10">
                   <Badge className="bg-white/20 text-white border-none rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-4">
                     Clinical Protocol
                   </Badge>
                   <h2 className="text-3xl font-black text-white tracking-tight leading-none">{viewingCategory.title}</h2>
                </div>
              </div>

              <div className="p-10 space-y-10">
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Treatment Roadmap</h4>
                   <p className="text-slate-600 font-medium leading-relaxed text-lg">
                     {viewingCategory.description || "No specific clinical roadmap provided for this category."}
                   </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="bg-slate-50/80 p-7 rounded-[32px] border border-slate-100 flex items-center gap-5">
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                         <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Duration</p>
                         <p className="font-black text-slate-900 text-xl leading-none">{viewingCategory.duration_minutes}m</p>
                      </div>
                   </div>
                   <div className="bg-slate-50/80 p-7 rounded-[32px] border border-slate-100 flex items-center gap-5">
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                         <CircleDollarSign className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Pricing</p>
                         <p className="font-black text-slate-900 text-xl leading-none">${viewingCategory.pricing}</p>
                      </div>
                   </div>
                </div>

                <div className="bg-blue-50/30 p-5 rounded-3xl border border-blue-100/50 flex items-center gap-4">
                   <MapPin className="h-5 w-5 text-primary stroke-[2.5]" />
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Primary Location</span>
                      <span className="text-sm font-bold text-slate-700">{viewingCategory.location || "Central Chiropractic Clinic"}</span>
                   </div>
                </div>
              </div>

              <DialogFooter className="px-10 py-10 bg-slate-50/50 border-t border-slate-100 flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleCategoryDelete(viewingCategory.id)}
                  className="rounded-2xl h-14 flex-1 border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 uppercase"
                >
                   <Trash2 className="h-4 w-4 mr-3" />
                   Remove
                </Button>
                <Button 
                  onClick={() => handleOpenCategoryDialog(viewingCategory)}
                  className="rounded-2xl h-14 flex-1 font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20"
                >
                   <Pencil className="h-4 w-4 mr-3" />
                   Customize
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 2. Session Instance View Modal */}
      <Dialog open={!!viewingSessioninstance} onOpenChange={(open) => !open && setViewingSessionInstance(null)}>
        <DialogContent className="sm:max-w-[550px] rounded-[48px] overflow-hidden p-0 border-none shadow-2xl">
          {viewingSessioninstance && (
             <div className="flex flex-col">
                <div className="h-36 bg-slate-900 p-10 flex items-end relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-24 opacity-10 bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
                   <div className="relative z-10">
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-none rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-4">
                        Active Time Slot
                      </Badge>
                      <h2 className="text-3xl font-black text-white tracking-tight leading-none">
                        {format(parseISO(viewingSessioninstance.datetime), "h:mm a")}
                      </h2>
                   </div>
                </div>

                <div className="p-10 space-y-10">
                   <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                      <div className="flex flex-col gap-1.5">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Category Definition</span>
                         <span className="font-black text-slate-900 text-xl leading-none">{viewingSessioninstance.session_types.title}</span>
                      </div>
                      <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                         <Stethoscope className="h-7 w-7 text-primary" />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3 px-2">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Clinical Date</h4>
                         <p className="font-black text-slate-900 text-lg">{format(parseISO(viewingSessioninstance.datetime), "MMMM do, yyyy")}</p>
                      </div>
                      <div className="space-y-3 px-2">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Occupancy Status</h4>
                         <div className="flex items-center gap-3">
                            <span className="font-black text-slate-900 text-lg">{viewingSessioninstance.booked_slots} / {viewingSessioninstance.max_slots} Booked</span>
                            {viewingSessioninstance.booked_slots >= viewingSessioninstance.max_slots && (
                               <Badge className="bg-red-50 text-red-600 border-none rounded-full px-2 py-0.5 text-[8px] font-black">FULL</Badge>
                            )}
                         </div>
                      </div>
                   </div>

                   {viewingSessioninstance.status === 'cancelled' && (
                      <div className="p-6 bg-red-50 rounded-[32px] border border-red-100 space-y-2">
                         <span className="text-[10px] font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                            <XCircle className="h-3 w-3" />
                            Cancellation Reason
                         </span>
                         <p className="text-sm font-bold text-red-800">{viewingSessioninstance.cancel_reason || "No clinical reason specified."}</p>
                      </div>
                   )}
                </div>

                <DialogFooter className="px-10 py-10 bg-slate-50/50 border-t border-slate-100 flex items-center gap-4">
                   {viewingSessioninstance.status === 'active' ? (
                      <Button 
                        variant="outline"
                        onClick={() => handleSessionStatusUpdate(viewingSessioninstance.id, 'cancelled')}
                        className="rounded-2xl h-14 flex-1 border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100"
                      >
                         <XCircle className="h-4 w-4 mr-3" />
                         Cancel Slot
                      </Button>
                   ) : (
                      <Button 
                        variant="outline"
                        onClick={() => handleSessionStatusUpdate(viewingSessioninstance.id, 'active')}
                        className="rounded-2xl h-14 flex-1 border-slate-200 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100"
                      >
                         <CheckCircle2 className="h-4 w-4 mr-3" />
                         Re-Activate
                      </Button>
                   )}
                   <Button 
                      onClick={() => handleSessionDelete(viewingSessioninstance.id)}
                      variant="destructive"
                      className="rounded-2xl h-14 px-8 font-black text-[10px] uppercase tracking-widest bg-slate-900 hover:bg-black border-none"
                    >
                      <Trash2 className="h-4 w-4" />
                   </Button>
                </DialogFooter>
             </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 3. Category Edit/Create Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[48px] border-none shadow-2xl p-0 overflow-hidden">
          <form onSubmit={handleCategorySubmit}>
            <div className="p-10 pb-2">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black text-slate-900 leading-none">
                  {editingCategory ? "Update Protocol" : "Initialize Offering"}
                </DialogTitle>
                <DialogDescription className="font-bold text-slate-400 mt-2 text-sm">
                  Define the parameters for this clinical service category.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-10 space-y-7">
              <div className="space-y-2.5">
                <Label htmlFor="title" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Label</Label>
                <Input 
                  id="title" 
                  value={categoryFormData.title} 
                  onChange={(e) => setCategoryFormData({...categoryFormData, title: e.target.value})}
                  placeholder="e.g. Initial Consultation" 
                  required
                  className="rounded-2xl h-14 border-slate-200 focus:ring-primary/20 font-bold text-lg px-6"
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="description" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Roadmap</Label>
                <Textarea 
                  id="description" 
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                  placeholder="Describe the clinical process..." 
                  className="rounded-3xl min-h-[140px] resize-none border-slate-200 focus:ring-primary/20 font-medium p-6 text-slate-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2.5">
                  <Label htmlFor="pricing" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fee ($)</Label>
                  <Input 
                    id="pricing" 
                    type="number"
                    value={categoryFormData.pricing}
                    onChange={(e) => setCategoryFormData({...categoryFormData, pricing: e.target.value})}
                    placeholder="0.00" 
                    required
                    className="rounded-2xl h-14 border-slate-200 font-black text-xl px-6"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label htmlFor="duration" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Timing (M)</Label>
                  <Input 
                    id="duration" 
                    type="number"
                    value={categoryFormData.duration_minutes}
                    onChange={(e) => setCategoryFormData({...categoryFormData, duration_minutes: e.target.value})}
                    placeholder="60" 
                    required
                    className="rounded-2xl h-14 border-slate-200 font-black text-xl px-6"
                  />
                </div>
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="location" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clinical Hub</Label>
                <Input 
                  id="location" 
                  value={categoryFormData.location}
                  onChange={(e) => setCategoryFormData({...categoryFormData, location: e.target.value})}
                  placeholder="Main Clinic"
                  className="rounded-2xl h-14 border-slate-200 font-bold px-6"
                />
              </div>
            </div>
            <DialogFooter className="p-10 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <Button type="button" variant="ghost" onClick={() => setIsCategoryDialogOpen(false)} className="rounded-xl font-bold px-8">
                Cancel
              </Button>
              <Button type="submit" disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending} className="rounded-2xl h-14 px-12 font-black text-xs uppercase tracking-widest shadow-[0_15px_30px_rgba(59,130,246,0.2)] min-w-[200px]">
                {(createCategoryMutation.isPending || updateCategoryMutation.isPending) && <Loader2 className="mr-3 h-4 w-4 animate-spin" />}
                {editingCategory ? "Sync Protocol" : "Authorize Offering"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Sessions;
