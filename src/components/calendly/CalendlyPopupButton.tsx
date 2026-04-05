import { siteConfig } from "@/config/site-config";
import React from "react";
import { Button } from "@/components/ui/button";
import CalendlyInline from "./CalendlyInline";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface CalendlyPopupButtonProps {
  text?: string;
  url?: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  prefill?: {
    name?: string;
    email?: string;
    customAnswers?: Record<string, string>;
  };
}

const CalendlyPopupButton: React.FC<CalendlyPopupButtonProps> = ({ 
  text = "Book Your Appointment",
  url = import.meta.env.VITE_CALENDLY_URL || siteConfig.calendly.url,
  className = "",
  variant = "default",
  size = "lg",
  prefill
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
        >
          {text}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[1000px] p-0 border-none overflow-hidden h-[85vh] sm:h-[800px] rounded-2xl bg-[#080C16] shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
        <div className="w-full h-full p-0 flex items-stretch">
          <CalendlyInline url={url} prefill={prefill} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CalendlyPopupButton;
