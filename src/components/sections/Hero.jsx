import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import Button from "@/components/ui/Button";

export default function Hero() {
  const { panels, ctaLabel, ctaHref } = siteConfig.hero;
  const ctaIndex = Math.floor(panels.length / 2);

  return (
    <section className="relative grid grid-cols-1 sm:grid-cols-3 sm:h-[70vh] sm:min-h-[420px]">
      {panels.map((panel, i) => (
        <div key={i} className="group relative aspect-[3/4] overflow-hidden sm:aspect-auto sm:h-full">
          {/* Default: front-facing shot */}
          <PlaceholderImage
            tone={panel.tone}
            alt={panel.alt}
            variant="front"
            fill
            className="opacity-100 transition-opacity duration-700 ease-out group-hover:opacity-0"
          />
          {/* Revealed on hover: alternate shot */}
          <PlaceholderImage
            tone={panel.tone}
            alt={`${panel.alt} — alternate view`}
            variant="side"
            fill
            className="opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
          />

          <div
            className={cn(
              "absolute left-1/2 top-1/2 w-[85%] max-w-xs -translate-x-1/2 -translate-y-1/2 opacity-100 transition-opacity duration-300 ease-out sm:w-auto md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100",
              // On mobile the panels stack, so only the featured panel shows
              // the CTA by default — otherwise it repeats once per panel.
              // Desktop hover reveals it on whichever panel is hovered.
              i !== ctaIndex && "hidden md:block",
            )}
          >
            <Button
              href={ctaHref}
              variant="outline"
              className="w-full bg-[var(--color-surface)]/95 backdrop-blur-sm"
            >
              {ctaLabel}
            </Button>
          </div>
        </div>
      ))}
    </section>
  );
}
