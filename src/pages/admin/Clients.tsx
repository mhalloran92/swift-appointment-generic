import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Calendar,
  ShieldCheck,
  UserCheck,
  Clock,
  Trash2,
  Users,
  Loader2,
  Check,
  Eye,
  Pencil,
  MapPin,
  ExternalLink
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAdminClients, useUpdateClientRole, useUpdateClientProfile, useDeleteClient, Profile } from "@/hooks/useAdminData";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Clients = () => {
  const { data: clients, isLoading } = useAdminClients();
  const updateRoleMutation = useUpdateClientRole();
  const updateProfileMutation = useUpdateClientProfile();
  const deleteClientMutation = useDeleteClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<Profile['role'] | 'all'>('all');
  const [selectedClient, setSelectedClient] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});

  const filteredClients = clients?.filter(client => {
    const matchesSearch = (
      client.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      client.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesRole = roleFilter === 'all' || client.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  const handleUpdateRole = async (id: string, newRole: Profile['role']) => {
    try {
      await updateRoleMutation.mutateAsync({ id, role: newRole });
    } catch (error) {
       // Handled in mutation
    }
  };

  const handleOpenView = (client: Profile) => {
    setSelectedClient(client);
    setIsEditing(false);
    setEditForm({
      first_name: client.first_name,
      last_name: client.last_name,
      phone: client.phone,
      email: client.email
    });
  };

  const handleSaveProfile = async () => {
    if (!selectedClient) return;
    try {
      await updateProfileMutation.mutateAsync({
        id: selectedClient.id,
        ...editForm
      });
      setIsEditing(false);
      // Update selected client in UI
      setSelectedClient({ ...selectedClient, ...editForm } as Profile);
    } catch (error) {
      // Handled in mutation
    }
  };

  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    
    // Simple confirmation - in a real app use a more robust confirmation dialog
    if (!window.confirm(`Are you sure you want to archive ${selectedClient.first_name}? This will remove them from the directory.`)) return;
    
    try {
      await deleteClientMutation.mutateAsync(selectedClient.id);
      setSelectedClient(null);
    } catch (error) {
      // Handled in mutation
    }
  };

  return (
    <DashboardLayout isAdmin={true}>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Client Directory</h2>
            <p className="text-slate-500 mt-1">Manage patient records and administrative access levels.</p>
          </div>
          <Button className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            <Plus className="mr-2 h-4 w-4" />
            Register New Client
          </Button>
        </div>

        {/* Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by name, email or phone..." 
              className="pl-10 h-11 rounded-xl border-slate-200 bg-white shadow-sm focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="md:col-span-4 flex gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-1 h-11 rounded-xl px-4 border-slate-200 bg-white text-slate-600 hover:text-primary hover:border-primary/30 transition-all">
                  <Filter className="mr-2 h-4 w-4" />
                  {roleFilter === 'all' ? 'All Roles' : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-slate-100">
                <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">Filter by Role</DropdownMenuLabel>
                {(['all', 'admin', 'client', 'user'] as const).map((r) => (
                  <DropdownMenuItem 
                    key={r} 
                    onClick={() => setRoleFilter(r)}
                    className="flex items-center justify-between px-3 py-2.5 cursor-pointer rounded-lg m-1"
                  >
                    <span className="capitalize">{r}</span>
                    {roleFilter === r && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="flex-1 h-11 rounded-xl px-4 border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-all">
              Export
            </Button>
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-slate-500 font-medium">Loading patient records...</p>
             </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="w-[300px] font-bold text-slate-500 py-4 px-6">Client</TableHead>
                  <TableHead className="font-bold text-slate-500 py-4">Contact</TableHead>
                  <TableHead className="font-bold text-slate-500 py-4">Role</TableHead>
                  <TableHead className="font-bold text-slate-500 py-4">Registered</TableHead>
                  <TableHead className="text-right py-4 px-6 font-bold text-slate-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow 
                    key={client.id} 
                    onClick={() => handleOpenView(client)}
                    className="group hover:bg-slate-50/50 border-slate-50 transition-colors cursor-pointer"
                  >
                    <TableCell className="py-5 px-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border-2 border-white group-hover:scale-105 transition-transform shadow-sm">
                          <AvatarImage src={client.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${client.email}`} />
                          <AvatarFallback>{client.first_name?.charAt(0) || client.email?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 leading-none">
                              {client.first_name} {client.last_name}
                            </p>
                            {client.role === 'admin' && <ShieldCheck className="h-3 w-3 text-primary" />}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 font-medium tracking-tight truncate max-w-[150px]">{client.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Mail className="h-3.5 w-3.5 text-slate-300" />
                          <span className="truncate max-w-[180px]">{client.email || 'No email'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Phone className="h-3.5 w-3.5 text-slate-300" />
                          {client.phone || 'No phone'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        client.role === 'admin' ? 'bg-primary/10 text-primary' :
                        client.role === 'client' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {client.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-4 w-4 text-slate-300" />
                        {format(new Date(client.created_at), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-5 px-6">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenView(client)}
                          className="h-9 w-9 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl border border-transparent hover:border-slate-100 transition-all"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-9 w-9 p-0 hover:bg-white rounded-xl border border-transparent hover:border-slate-100 shadow-sm transition-all focus-visible:ring-primary/20">
                              <MoreHorizontal className="h-4 w-4 text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl border-slate-100 shadow-xl w-52 p-2">
                            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1.5">Management</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleOpenView(client)} className="px-3 py-2.5 rounded-lg cursor-pointer flex items-center gap-2 hover:bg-slate-50 font-medium">
                              <Eye className="h-4 w-4 opacity-70" />
                              View Patient Details
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="bg-slate-50 mx-1 my-1.5" />
                            <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1">Change Access Level</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleUpdateRole(client.id, 'client')} className="px-3 py-2 rounded-lg cursor-pointer flex justify-between items-center m-0.5">
                              Client {client.role === 'client' && <Check className="h-3.5 w-3.5 text-primary" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateRole(client.id, 'admin')} className="px-3 py-2 rounded-lg cursor-pointer flex justify-between items-center m-0.5">
                              Admin {client.role === 'admin' && <Check className="h-3.5 w-3.5 text-primary" />}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateRole(client.id, 'user')} className="px-3 py-2 rounded-lg cursor-pointer flex justify-between items-center m-0.5">
                              User {client.role === 'user' && <Check className="h-3.5 w-3.5 text-primary" />}
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="bg-slate-50 mx-1 my-1.5" />
                            <DropdownMenuItem className="px-3 py-2.5 rounded-lg cursor-pointer text-red-600 flex items-center gap-2 hover:bg-red-50 focus:bg-red-50 focus:text-red-700 transition-colors">
                              <Trash2 className="h-4 w-4 opacity-70" />
                              Archive Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!isLoading && filteredClients.length === 0 && (
            <div className="py-24 text-center animate-in fade-in zoom-in duration-300">
               <div className="bg-slate-50 h-20 w-20 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Users className="h-10 w-10 text-slate-200" />
               </div>
               <h3 className="text-xl font-bold text-slate-900">No matching records</h3>
               <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">Try broadening your search or resetting the role filter.</p>
               <Button 
                variant="link" 
                className="mt-4 text-primary font-bold"
                onClick={() => { setSearchQuery(""); setRoleFilter("all"); }}
               >
                 Clear all filters
               </Button>
            </div>
          )}
        </div>
      </div>

      {/* View Modal */}
      <Dialog open={!!selectedClient} onOpenChange={(open) => !open && setSelectedClient(null)}>
        <DialogContent className="sm:max-w-[600px] rounded-[32px] overflow-hidden p-0 border-none shadow-2xl">
          {selectedClient && (
            <div className="flex flex-col">
              {/* Cover/Header area */}
              <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent relative">
                <div className="absolute -bottom-10 left-8">
                   <Avatar className="h-24 w-24 border-4 border-white shadow-xl ring-1 ring-slate-100">
                    <AvatarImage src={selectedClient.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedClient.email}`} />
                    <AvatarFallback className="text-2xl font-bold">{selectedClient.first_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="pt-14 pb-8 px-8 flex flex-col gap-8">
                <div className="flex justify-between items-start">
                  <div>
                    {isEditing ? (
                      <div className="flex gap-2 mb-2">
                        <Input 
                          value={editForm.first_name || ""} 
                          onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                          className="h-10 rounded-xl border-slate-200 font-bold"
                          placeholder="First Name"
                        />
                        <Input 
                          value={editForm.last_name || ""} 
                          onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                          className="h-10 rounded-xl border-slate-200 font-bold"
                          placeholder="Last Name"
                        />
                      </div>
                    ) : (
                      <h2 className="text-2xl font-bold text-slate-900">
                        {selectedClient.first_name} {selectedClient.last_name}
                      </h2>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="rounded-full bg-slate-50 text-slate-600 border-slate-200 font-bold uppercase text-[10px] tracking-widest px-3">
                        {selectedClient.role}
                      </Badge>
                      <span className="text-xs text-slate-400 font-medium tracking-tight">ID: {selectedClient.id}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isEditing ? (
                      <>
                        <Button 
                          onClick={() => setIsEditing(true)}
                          variant="outline" 
                          className="rounded-xl h-10 border-slate-200 hover:bg-primary/5 hover:text-primary transition-all font-bold"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                        <Button 
                          onClick={handleDeleteClient}
                          variant="outline" 
                          className="rounded-xl h-10 border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-100 transition-all font-bold"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Archive
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          onClick={handleSaveProfile}
                          disabled={updateProfileMutation.isPending}
                          className="rounded-xl h-10 font-bold shadow-lg shadow-primary/10"
                        >
                          {updateProfileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                          Save Changes
                        </Button>
                        <Button 
                          onClick={() => setIsEditing(false)}
                          variant="outline" 
                          className="rounded-xl h-10 border-slate-200 font-bold"
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                        <Mail className="h-4 w-4 text-slate-300" />
                        {isEditing ? (
                          <Input 
                            value={editForm.email || ""} 
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="h-8 border-none bg-transparent p-0 focus-visible:ring-0 font-medium"
                            placeholder="Email Address"
                          />
                        ) : (
                          <span className="font-medium">{selectedClient.email}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                        <Phone className="h-4 w-4 text-slate-300" />
                        {isEditing ? (
                          <Input 
                            value={editForm.phone || ""} 
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            className="h-8 border-none bg-transparent p-0 focus-visible:ring-0 font-medium"
                            placeholder="Phone Number"
                          />
                        ) : (
                          <span className="font-medium">{selectedClient.phone || 'No phone provided'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                        <Calendar className="h-4 w-4 text-slate-300" />
                        <span className="font-medium">Joined {format(new Date(selectedClient.created_at), "MMMM yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
                        <Clock className="h-4 w-4 text-slate-300" />
                        <span className="font-medium">Active Member</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex bg-slate-50 p-4 rounded-3xl border border-slate-100 items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-sm">
                        <p className="font-bold text-slate-700">Medical Records</p>
                        <p className="text-slate-500">Last updated: {format(new Date(), "PP")}</p>
                      </div>
                   </div>
                   <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-white rounded-lg">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Files
                   </Button>
                </div>
              </div>

              <DialogFooter className="px-8 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3 sm:justify-end">
                <Button onClick={() => setSelectedClient(null)} variant="ghost" className="rounded-xl font-bold">
                  Close
                </Button>
                <Button className="rounded-xl font-bold shadow-lg shadow-primary/10">
                  Open Direct Message
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Clients;
