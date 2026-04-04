import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/scroll-to-section";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, LogOut, LayoutDashboard } from "lucide-react";
import CalendlyPopupButton from "./calendly/CalendlyPopupButton";

import { siteConfig } from "@/config/site-config";

export default function StickyHeader() {
  const [scrolled, setScrolled] = useState(false);
  const { user, role, avatarUrl, signOut } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-border shadow-lg shadow-black/20"
          : "bg-background/60 backdrop-blur-sm border-transparent"
      }`}
    >
      <div
        className={`container flex items-center justify-between gap-6 transition-all duration-300 ${
          scrolled ? "h-14 md:h-16" : "h-16 md:h-20"
        }`}
      >
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("hero");
          }}
          className={`font-bold tracking-tight text-foreground transition-all duration-300 ${
            scrolled ? "text-base md:text-lg" : "text-lg md:text-xl"
          }`}
        >
          {siteConfig.name}
        </a>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {siteConfig.nav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full px-1"
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl || user.user_metadata?.avatar_url} alt={user.email || ""} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user.email && <p className="font-medium">{user.email}</p>}
                    {role && <p className="w-[200px] truncate text-sm text-muted-foreground capitalize">{role}</p>}
                  </div>
                </div>
                <DropdownMenuSeparator />
                {role && (
                  <DropdownMenuItem asChild>
                    <Link to={role === "admin" ? "/admin" : "/dashboard"}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>{role === "admin" ? "Admin" : "Dashboard"}</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => await signOut()} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="outline" size="sm" className="hidden md:inline-flex border-slate-300">
                Log In
              </Button>
            </Link>
          )}
          <CalendlyPopupButton 
            text="Book"
            size="sm"
            className="hover-scale focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        </div>
      </div>
    </header>
  );
}