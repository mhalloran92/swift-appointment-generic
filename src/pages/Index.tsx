import StickyHeader from "@/components/StickyHeader";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import TrustSection from "@/components/TrustSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import LogisticsSection from "@/components/LogisticsSection";
import FinalCTA from "@/components/FinalCTA";
import { siteConfig } from "@/config/site-config";

const Index = () => {
  return (
    <>
      <StickyHeader />
      <main>
        <HeroSection />
        <ServicesSection />
        <TrustSection />
        <TestimonialsSection />
        <LogisticsSection />
        <FinalCTA />
      </main>
      <footer className="border-t border-border py-8 bg-background/95">
        <div className="container flex flex-col gap-4 text-center md:text-left md:flex-row md:items-center md:justify-between text-xs text-muted-foreground">
          <div className="space-y-1">
            <p className="font-medium text-foreground text-sm">{siteConfig.fullName}</p>
            <p>{siteConfig.location.address}</p>
            <p>© {new Date().getFullYear()} All rights reserved.</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Questions or ready to schedule?
            </p>
            <p>
              <a href={`tel:${siteConfig.contact.phone}`} className="underline-offset-2 hover:underline">
                {siteConfig.contact.phone}
              </a>{" "}
              ·{" "}
              <a href={`mailto:${siteConfig.contact.email}`} className="underline-offset-2 hover:underline">
                {siteConfig.contact.email}
              </a>
            </p>
            <p className="text-[11px] text-muted-foreground">
              We aim to respond to all messages within one business day.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Index;
