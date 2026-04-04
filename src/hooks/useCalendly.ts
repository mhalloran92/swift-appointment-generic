import { useEffect, useState } from "react";

declare global {
  interface Window {
    Calendly: any;
  }
}

/**
 * Ensures a URL is absolute for use with Calendly widgets
 * and handles potential whitespace from .env parsing.
 */
const formatCalendlyUrl = (url: string): string => {
  if (!url || typeof url !== "string") return "https://calendly.com";
  
  const cleanUrl = url.trim();
  if (!cleanUrl) return "https://calendly.com";

  let finalUrl = cleanUrl;
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    finalUrl = `https://calendly.com/${cleanUrl.replace(/^\//, "")}`;
  }

  // Append branding and hide_gdpr_banner parameters
  try {
    const urlObj = new URL(finalUrl);
    urlObj.searchParams.set("hide_gdpr_banner", "1");
    
    // Add branding colors if they exist in env
    const bgColor = import.meta.env.VITE_CALENDLY_BG_COLOR;
    const textColor = import.meta.env.VITE_CALENDLY_TEXT_COLOR;
    const primaryColor = import.meta.env.VITE_CALENDLY_PRIMARY_COLOR;
    
    if (bgColor) urlObj.searchParams.set("background_color", bgColor.replace("#", ""));
    if (textColor) urlObj.searchParams.set("text_color", textColor.replace("#", ""));
    if (primaryColor) urlObj.searchParams.set("primary_color", primaryColor.replace("#", ""));
    
    return urlObj.toString();
  } catch (e) {
    // Fallback if URL is weird
    let urlWithParams = finalUrl;
    if (!urlWithParams.includes("hide_gdpr_banner=1")) {
      urlWithParams += (urlWithParams.includes("?") ? "&" : "?") + "hide_gdpr_banner=1";
    }
    return urlWithParams;
  }
};

export const useCalendly = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // If window.Calendly is already there, we are good
    if (window.Calendly) {
      setIsLoaded(true);
      return;
    }

    // Otherwise, check every 300ms for up to 3 seconds (in case it's still loading)
    let checks = 0;
    const interval = setInterval(() => {
      if (window.Calendly) {
        setIsLoaded(true);
        clearInterval(interval);
      }
      checks++;
      if (checks > 10) clearInterval(interval);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const openPopup = (url: string, options: any = {}) => {
    const finalUrl = formatCalendlyUrl(url);
    
    if (window.Calendly) {
      try {
        window.Calendly.initPopupWidget({
          url: finalUrl,
          ...options,
          backgroundColor: options.backgroundColor || import.meta.env.VITE_CALENDLY_BG_COLOR || "ffffff",
          textColor: options.textColor || import.meta.env.VITE_CALENDLY_TEXT_COLOR || "1e293b",
          primaryColor: options.primaryColor || import.meta.env.VITE_CALENDLY_PRIMARY_COLOR || "0ea5e9",
        });
      } catch (err) {
        console.error("Calendly initPopupWidget error:", err);
        window.open(finalUrl, "_blank");
      }
    } else {
      console.warn("Calendly not yet loaded, using window.open fallback");
      window.open(finalUrl, "_blank");
    }
  };

  return { isLoaded, openPopup, formatCalendlyUrl };
};
