import { useScrollFadeIn } from "@/hooks/use-scroll-fade-in";
import CalendlyPopupButton from "./calendly/CalendlyPopupButton";
import { siteConfig } from "@/config/site-config";

export default function FinalCTA() {
  const { ref, isVisible } = useScrollFadeIn();

  return (
    <section id="final-cta" className="py-24 md:py-32 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent" />

      <div
        className={`container relative z-10 text-center max-w-2xl ${
          isVisible ? "animate-fade-in" : "opacity-0"
        }`}
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-4">Book Your Appointment</h2>
        <p className="text-muted-foreground text-lg mb-3">
          Ready to take the next step toward less pain and better movement?
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          The fastest way to schedule your visit is through our online booking system below.
        </p>
        <CalendlyPopupButton 
          text="Book Your Appointment"
          url={siteConfig.services.find(s => s.id === "initial")?.calendlyUrl}
          className="hover-scale text-base px-10 py-6 h-auto"
        />
      </div>
    </section>
  );
}
