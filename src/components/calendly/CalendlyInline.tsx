import React, { useEffect, useRef } from "react";
import { useCalendly } from "@/hooks/useCalendly";

interface CalendlyInlineProps {
  url?: string;
  prefill?: {
    name?: string;
    email?: string;
    customAnswers?: Record<string, string>;
  };
}

const CalendlyInline: React.FC<CalendlyInlineProps> = ({ 
  url = import.meta.env.VITE_CALENDLY_URL,
  prefill 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isLoaded, formatCalendlyUrl } = useCalendly();

  useEffect(() => {
    if (isLoaded && containerRef.current && url) {
      const finalUrl = formatCalendlyUrl(url);
      
      try {
        window.Calendly.initInlineWidget({
          url: finalUrl,
          parentElement: containerRef.current,
          prefill: prefill,
          utm: {},
          backgroundColor: import.meta.env.VITE_CALENDLY_BG_COLOR || "ffffff",
          textColor: import.meta.env.VITE_CALENDLY_TEXT_COLOR || "1e293b",
          primaryColor: import.meta.env.VITE_CALENDLY_PRIMARY_COLOR || "0ea5e9",
          hideGdprBanner: true,
        });
      } catch (err) {
        console.error("Calendly initInlineWidget error:", err);
      }
    }
  }, [isLoaded, url, prefill, formatCalendlyUrl]);

  return (
    <div 
      ref={containerRef} 
      className="calendly-inline-widget w-full h-full"
      style={{ minWidth: "320px", minHeight: "500px" }}
    />
  );
};

export default CalendlyInline;
