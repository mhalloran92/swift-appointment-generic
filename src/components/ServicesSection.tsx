import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useScrollFadeIn } from "@/hooks/use-scroll-fade-in";
import { Clock, Loader2 } from "lucide-react";
import { siteConfig } from "@/config/site-config";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useClientProfile } from "@/hooks/useClientData";
import CalendlyInline from "./calendly/CalendlyInline";

type Service = typeof siteConfig.services[0];
type DialogState = "auth" | "first-visit" | "calendly" | null;

export default function ServicesSection() {
  const { ref, isVisible } = useScrollFadeIn();
  const { user } = useAuth();
  const { data: profile } = useClientProfile(user?.id);
  const navigate = useNavigate();

  const prefill = useMemo(() => ({
    name: [
      profile?.first_name || user?.user_metadata?.first_name,
      profile?.last_name  || user?.user_metadata?.last_name,
    ].filter(Boolean).join(' ').trim(),
    email: user?.email || '',
    phone: profile?.phone || '',
  }), [
    profile?.first_name, profile?.last_name, profile?.phone,
    user?.user_metadata?.first_name, user?.user_metadata?.last_name, user?.email,
  ]);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [dialogState, setDialogState] = useState<DialogState>(null);
  const [isChecking, setIsChecking] = useState(false);

  const initialService = siteConfig.services.find(s => s.id === "initial") ?? siteConfig.services[0];

  const closeDialog = () => {
    setDialogState(null);
    setSelectedService(null);
  };

  const openCalendly = (service: Service) => {
    setSelectedService(service);
    setDialogState("calendly");
  };

  const handleBookClick = async (service: Service) => {
    if (!user) {
      setSelectedService(service);
      setDialogState("auth");
      return;
    }

    setIsChecking(true);
    try {
      const [appointmentsRes, profileRes] = await Promise.all([
        supabase.from("appointments").select("id").eq("user_id", user.id).limit(1),
        supabase.from("profiles").select("is_existing_patient").eq("id", user.id).single(),
      ]);

      const hasHistory = (appointmentsRes.data?.length ?? 0) > 0;
      const isExistingPatient = profileRes.data?.is_existing_patient === true;

      if (hasHistory || isExistingPatient) {
        openCalendly(service);
      } else {
        setSelectedService(service);
        setDialogState("first-visit");
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleFirstVisitYes = () => {
    openCalendly(initialService);
  };

  const handleFirstVisitNo = async () => {
    if (user) {
      await supabase.from("profiles").update({ is_existing_patient: true }).eq("id", user.id);
    }
    // selectedService already set — open Calendly for what they originally clicked
    setDialogState("calendly");
  };

  return (
    <section id="services" className="py-24 md:py-32">
      <div className="container" ref={ref}>
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Appointment Types</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Each session is structured with a clear objective. Choose what fits your needs.
          </p>

          <div className="mt-8 space-y-4">
            <p className="text-xs font-medium tracking-wide uppercase text-primary">
              Who we help
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Desk workers", "Active professionals", "Athletes", "New parents"].map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {siteConfig.services.map((s, i) => (
            <div
              key={s.name}
              className={`group relative rounded-xl border border-border bg-card/90 backdrop-blur-sm p-6 flex flex-col transition-all duration-300 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 focus-within:border-primary/70 focus-within:shadow-lg focus-within:shadow-primary/15 ${
                isVisible ? "animate-fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: isVisible ? `${i * 120}ms` : "0ms" }}
            >
              <h3 className="text-lg font-semibold mb-2">{s.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{s.focus}</p>

              <div className="mb-3">
                <p className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wide">
                  Investment
                </p>
                <p className="text-sm font-semibold text-foreground">{s.price}</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <Clock className="w-4 h-4" />
                <span>{s.duration}</span>
              </div>

              <Badge variant="secondary" className="w-fit mb-3 text-[11px]">
                Ideal for: {s.idealFor}
              </Badge>

              <p className="text-xs text-muted-foreground mb-4 flex-1 leading-relaxed">
                {s.frequency}
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBookClick(s)}
                disabled={isChecking}
                className="w-full group-hover:border-primary group-hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Book This Session"}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Auth prompt */}
      <Dialog open={dialogState === "auth"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Sign in to book</DialogTitle>
            <DialogDescription className="text-sm">
              Create a free account or log in to book your appointment and track your visit history.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Button onClick={() => navigate("/signup")} className="w-full h-11 font-bold rounded-xl">
              Create Account
            </Button>
            <Button onClick={() => navigate("/login")} variant="outline" className="w-full h-11 font-bold rounded-xl">
              Log In
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New vs returning prompt */}
      <Dialog open={dialogState === "first-visit"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Is this your first visit with us?</DialogTitle>
            <DialogDescription className="text-sm">
              This helps us match you with the right appointment type.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-2">
            <Button onClick={handleFirstVisitYes} className="w-full h-11 font-bold rounded-xl">
              Yes, this is my first visit
            </Button>
            <Button onClick={handleFirstVisitNo} variant="outline" className="w-full h-11 font-bold rounded-xl">
              No, I've been here before
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Calendly popup */}
      <Dialog open={dialogState === "calendly"} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="w-[95vw] sm:max-w-[1000px] p-0 border-none overflow-hidden h-[85vh] sm:h-[800px] rounded-2xl bg-[#080C16] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
          <div className="w-full h-full flex items-stretch">
            {selectedService && dialogState === "calendly" && (
              <CalendlyInline url={selectedService.calendlyUrl} prefill={prefill} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
