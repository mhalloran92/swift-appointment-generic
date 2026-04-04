import { useScrollFadeIn } from "@/hooks/use-scroll-fade-in";
import { siteConfig } from "@/config/site-config";

export default function TrustSection() {
  const { ref, isVisible } = useScrollFadeIn();

  return (
    <section id="trust" className="py-24 md:py-32 bg-secondary/20" ref={ref}>
      <div className="container">
        <div
          className={`grid md:grid-cols-2 gap-12 md:gap-16 items-center ${isVisible ? "animate-fade-in" : "opacity-0"
            }`}
        >
          {/* Portrait / provider card */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-64 h-80 md:w-80 md:h-96 rounded-2xl bg-card/90 border border-border shadow-sm overflow-hidden flex items-end justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/15 via-primary/5 to-transparent" />

              <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 border border-border/60 backdrop-blur-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {siteConfig.author.initials}
                </div>
                <span className="text-xs font-medium text-foreground">{siteConfig.author.name}</span>
              </div>

              <img
                src={siteConfig.author.image}
                alt={siteConfig.author.name}
                className="w-full h-full object-cover"
              />

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 via-background/80 to-transparent px-5 pb-5 pt-10">
                <p className="text-sm font-semibold text-foreground">{siteConfig.author.title}</p>
                <p className="text-xs text-muted-foreground">
                  {siteConfig.author.bio}
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-6">
            <p className="text-primary font-medium text-sm tracking-wide uppercase mb-2">
              Meet {siteConfig.author.name.split(' ')[0]}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{siteConfig.author.name}</h2>
            <p className="text-muted-foreground mb-8">
              {siteConfig.author.fullBio}
            </p>

            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground mb-2">
                  Credentials & background
                </p>
                <ul className="space-y-1.5 text-sm text-secondary-foreground">
                  {siteConfig.credentials.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                {siteConfig.approach.map(({ title, text }) => (
                  <div key={title} className="flex gap-4 items-start">
                    <div className="mt-1 w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-bold text-xs">{title[0]}</span>
                    </div>
                    <p className="text-sm text-secondary-foreground leading-relaxed">
                      <span className="font-semibold">{title}:</span> {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
