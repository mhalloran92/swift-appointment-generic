import { useScrollFadeIn } from "@/hooks/use-scroll-fade-in";
import { Badge } from "@/components/ui/badge";
import { MapPin, Stethoscope, UserCheck, AlertTriangle, ArrowRight } from "lucide-react";

const visitSteps = [
  {
    label: "Step 1",
    title: "Conversation & history",
    description: "We start with your goals, health history, and what’s been limiting you day to day.",
  },
  {
    label: "Step 2",
    title: "Assessment & testing",
    description: "Posture, movement, and hands-on assessment to understand what’s driving your pain.",
  },
  {
    label: "Step 3",
    title: "Treatment & plan",
    description:
      "Same-day care when appropriate, plus a clear, realistic plan for follow-up visits or home work.",
  },
];

export default function LogisticsSection() {
  const { ref, isVisible } = useScrollFadeIn();

  return (
    <section id="logistics" className="py-24 md:py-32 bg-secondary/20" ref={ref}>
      <div className={`container max-w-5xl ${isVisible ? "animate-fade-in" : "opacity-0"}`}>
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What to Expect</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A private, professional clinic environment focused entirely on your recovery.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left column */}
          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold mb-1">Location</p>
                <p className="text-sm text-muted-foreground">
                  Pittsburgh, Pennsylvania · Private, appointment-based clinic setting.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Stethoscope className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold mb-3">Your First Visit</p>
                <ol className="space-y-3 text-sm text-muted-foreground">
                  {visitSteps.map((step) => (
                    <li key={step.title} className="flex gap-3">
                      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-primary/40 bg-primary/5 text-[11px] font-medium text-primary">
                        {step.label}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{step.title}</p>
                        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <UserCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold mb-3">Best For</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Desk-related pain",
                    "Athletic overuse or strain",
                    "Chronic neck or back pain",
                    "Post-injury rehab (non-surgical)",
                  ].map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[11px] px-3 py-1 rounded-full">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-9 h-9 rounded-md bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-semibold mb-2">Not Ideal For</p>
                <p className="text-sm text-muted-foreground mb-2">
                  Emergency or high-risk situations that require immediate medical care.
                </p>
                <div className="inline-flex items-center gap-2 rounded-full bg-background/90 px-3 py-1 text-xs text-destructive border border-destructive/40">
                  <ArrowRight className="w-3 h-3" />
                  <span>Call 911 or visit your nearest ER for chest pain, major trauma, or fractures.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
