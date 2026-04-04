export const scrollToSection = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;

  const header = document.querySelector<HTMLElement>("header");
  const headerOffset = header?.getBoundingClientRect().height ?? 0;

  const rect = el.getBoundingClientRect();
  const offsetTop = rect.top + window.scrollY - headerOffset;

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  window.scrollTo({
    top: offsetTop,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
};

