import { siteConfig } from "@/config/site";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import Button from "@/components/ui/Button";

export default function Hero() {
  const { panels, ctaLabel, ctaHref } = siteConfig.hero;
  const ctaIndex = Math.floor(panels.length / 2);

  return (
    <section className="relative grid h-[70vh] min-h-[420px] grid-cols-3">
      {panels.map((panel, i) => (
        <div key={i} className="group relative h-full overflow-hidden">
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

          {i === ctaIndex ? (
            <div className="absolute left-1/2 top-1/2 w-[85%] max-w-xs -translate-x-1/2 -translate-y-1/2 opacity-100 transition-opacity duration-300 ease-out sm:w-auto md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100">
              <Button
                href={ctaHref}
                variant="outline"
                className="w-full bg-[var(--color-surface)]/95 backdrop-blur-sm"
              >
                {ctaLabel}
              </Button>
            </div>
          ) : null}
        </div>
      ))}
    </section>
  );
}
