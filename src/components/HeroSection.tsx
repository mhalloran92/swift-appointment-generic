import { Button } from "@/components/ui/button";
import { scrollToSection } from "@/lib/scroll-to-section";
import { ArrowRight } from "lucide-react";
import CalendlyPopupButton from "./calendly/CalendlyPopupButton";
import { siteConfig } from "@/config/site-config";

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <img
          src={siteConfig.author.image}
          alt={siteConfig.author.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />

      {/* Subtle radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container relative z-10 text-center max-w-3xl animate-fade-in">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
          End the Pain.
          <br />
          <span className="text-primary">Restore Your Movement.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-3">
          {siteConfig.description}
        </p>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-10">
          Built for busy professionals who need clear plans, predictable progress, and respect for
          their time in {siteConfig.location.city}.
        </p>
        <div className="flex flex-col sm:inline-flex sm:flex-row sm:items-center sm:justify-center gap-3 sm:gap-4">
          <Button
            size="lg"
            className="hover-scale text-base px-8 py-6 h-auto"
            onClick={() => scrollToSection("services")}
          >
            Book Your Appointment
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="text-base px-8 py-6 h-auto"
            onClick={() => scrollToSection("services")}
          >
            See Appointment Types
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
