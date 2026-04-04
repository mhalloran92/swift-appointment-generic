import { useScrollFadeIn } from "@/hooks/use-scroll-fade-in";
import { Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const testimonials = [
  {
    quote:
      "Three weeks in and the chronic lower back pain I'd dealt with for years is almost completely gone.",
    name: "Sarah",
    detail: "34, Marketing Director",
    tag: "Lower back pain · 6 weeks",
    featured: true,
  },
  {
    quote:
      "Dr. Jeffery Kamzik gave me a clear plan from day one. No guesswork, just steady improvement.",
    name: "Mark",
    detail: "42, Software Engineer",
    tag: "Neck & shoulder pain · 8 visits",
  },
  {
    quote:
      "I can finally sit through a full workday without pain. Should have come here months ago.",
    name: "Elena",
    detail: "29, Financial Analyst",
    tag: "Desk-related tension · 4 weeks",
  },
];

export default function TestimonialsSection() {
  const { ref, isVisible } = useScrollFadeIn();

  return (
    <section id="testimonials" className="py-24 md:py-32" ref={ref}>
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Patient Results</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Real experiences from people who committed to a structured treatment plan.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`group relative rounded-xl border border-border bg-card/90 p-6 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 ${isVisible ? "animate-fade-in-up" : "opacity-0"
                }`}
              style={{ animationDelay: isVisible ? `${i * 150}ms` : "0ms" }}
            >
              <Quote className="w-5 h-5 text-primary/40 mb-4" />
              {t.featured && (
                <Badge
                  variant="secondary"
                  className="mb-3 w-fit text-[11px] uppercase tracking-wide rounded-full"
                >
                  Featured story
                </Badge>
              )}
              <p className="text-xs font-medium text-primary mb-2">{t.tag}</p>
              <p className="text-sm leading-relaxed text-secondary-foreground mb-6 flex-1">
                "{t.quote}"
              </p>
              <div className="mt-auto">
                <p className="font-medium text-sm">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
