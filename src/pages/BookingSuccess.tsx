import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Calendar, ArrowLeft } from "lucide-react";
import CalendlyInline from "@/components/calendly/CalendlyInline";
import { siteConfig } from "@/config/site-config";
import { Button } from "@/components/ui/button";

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const [isLoaded, setIsLoaded] = useState(false);
  
  const email = searchParams.get("email") || "";
  const name = searchParams.get("name") || "";

  useEffect(() => {
    // Small delay to ensure the animations feel smooth
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col pt-20 pb-12">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div 
          className={`text-center space-y-4 mb-10 transition-all duration-700 transform ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Payment Successful!</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Thank you, <span className="text-foreground font-semibold uppercase">{name}</span>. 
            Your session is secured. Now, please select your appointment time below.
          </p>
        </div>

        {/* Calendly Section */}
        <div 
          className={`relative rounded-3xl border border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden shadow-2xl transition-all duration-1000 delay-300 transform ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
          style={{ minHeight: "700px" }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className="p-4 border-b border-border/50 bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Final Step: Choose Your Time</span>
            </div>
            <div className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">
              Step 2 of 2
            </div>
          </div>

          <div className="w-full h-full min-h-[650px]">
            <CalendlyInline 
              url={siteConfig.calendly.url} 
              prefill={{ name, email }} 
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-center">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
