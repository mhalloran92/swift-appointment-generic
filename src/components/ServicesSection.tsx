import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useScrollFadeIn } from "@/hooks/use-scroll-fade-in";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site-config";
import ApplicationForm from "./booking/ApplicationForm";

export default function ServicesSection() {
  const { ref, isVisible } = useScrollFadeIn();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleBookClick = (service: any) => {
    setSelectedService(service);
    setIsFormOpen(true);
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
                className="w-full group-hover:border-primary group-hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Book This Session
              </Button>
            </div>
          ))}
        </div>
      </div>

      {selectedService && (
        <ApplicationForm
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
          service={selectedService}
        />
      )}
    </section>
  );
}
