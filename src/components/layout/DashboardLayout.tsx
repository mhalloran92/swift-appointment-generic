import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  LogOut, 
  Bell,
  Search,
  User as UserIcon,
  Menu,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { siteConfig } from "@/config/site-config";

export const DashboardLayout = ({ children, isAdmin = false }: { children: React.ReactNode, isAdmin?: boolean }) => {
  const { signOut, user, role, avatarUrl } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const adminLinks = [
    { label: "Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Sessions", href: "/admin/sessions", icon: Calendar },
    { label: "Clients", href: "/admin/clients", icon: Users },
    { label: "Bookings", href: "/admin/bookings", icon: Calendar },
  ];

  const clientLinks = [
    { label: "My Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Management", href: "/dashboard", icon: Calendar }, // Points back to main hub for now
    { label: "Profile", href: "/profile", icon: Users },
    { label: "Notifications", href: "/notifications", icon: Bell },
  ];

  const links = isAdmin ? adminLinks : clientLinks;

  const getPageTitle = () => {
    const activeLink = links.find(link => link.href === location.pathname);
    return activeLink ? activeLink.label : "Dashboard";
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
        <Link to="/" className="font-bold text-xl text-primary tracking-tight font-black uppercase" onClick={() => setIsSidebarOpen(false)}>
          {siteConfig.name}
        </Link>
        <Button variant="ghost" size="icon" className="md:hidden text-slate-400" onClick={toggleSidebar}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <nav className="flex-1 py-6 px-4 space-y-1.5">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.href;
          return (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive 
                  ? "text-primary bg-primary/5 shadow-sm shadow-primary/5" 
                  : "text-slate-600 hover:text-primary hover:bg-slate-50"
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-primary" : "text-slate-400 opacity-80"}`} />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-200 bg-slate-50/50">
        <button
          onClick={() => {
            setIsSidebarOpen(false);
            signOut();
          }}
          className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 hover:shadow-sm"
        >
          <LogOut className="mr-3 h-5 w-5 opacity-80" />
          Sign out
        </button>
      </div>
    </div>
  );


  return (
    <div className="min-h-screen flex bg-slate-50/50">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 md:hidden transition-opacity animate-in fade-in"
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white z-[60] md:hidden transform transition-transform duration-300 ease-in-out shadow-2xl ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-sm bg-white/80">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden text-slate-500 hover:text-primary" onClick={toggleSidebar}>
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold text-slate-800">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <div className="hidden sm:flex relative items-center group">
              <Search className="absolute left-3 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-48 lg:w-64 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
              />
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-primary transition-colors hidden xs:flex">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2.5 h-2 w-2 bg-primary rounded-full border-2 border-white"></span>
              </Button>
              
              <div className="h-8 w-px bg-slate-200 hidden xs:block"></div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="pl-1 pr-1 md:pr-2 h-10 hover:bg-slate-100 rounded-full gap-2 md:gap-3 transition-all duration-300">
                    <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover:ring-primary/10 transition-all">
                      <AvatarImage src={avatarUrl || user?.user_metadata?.avatar_url} alt={user?.email || ""} />
                      <AvatarFallback className="bg-primary/5 text-primary border border-primary/10">
                        {user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:flex flex-col items-start leading-none gap-1">
                      <span className="text-sm font-semibold text-slate-700">
                        {user?.email?.split('@')[0]}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                        {role || "Member"}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 mt-1 shadow-2xl rounded-2xl border-slate-200" align="end">
                  <div className="p-2 pt-3 pb-3">
                    <p className="px-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">My Account</p>
                    <div className="px-2 py-1.5 flex flex-col gap-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{user?.email}</p>
                      <p className="text-xs text-slate-500 capitalize">{role}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem asChild className="m-1 rounded-xl cursor-pointer focus:bg-primary/5 focus:text-primary py-2.5">
                    <Link to="/profile" className="flex items-center w-full">
                      <UserIcon className="mr-3 h-4 w-4 opacity-70" />
                      <span className="font-medium">My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="m-1 rounded-xl cursor-pointer focus:bg-primary/5 focus:text-primary py-2.5">
                    <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center w-full">
                      <LayoutDashboard className="mr-3 h-4 w-4 opacity-70" />
                      <span className="font-medium">{isAdmin ? "Admin Overview" : "Dashboard"}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem onClick={async () => await signOut()} className="m-1 rounded-xl cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 py-2.5">
                    <LogOut className="mr-3 h-4 w-4 opacity-70" />
                    <span className="font-medium">Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-8 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {children}
        </main>
      </div>
    </div>
  );
};