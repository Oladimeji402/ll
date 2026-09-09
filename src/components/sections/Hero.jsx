import { siteConfig } from "@/config/site";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import Button from "@/components/ui/Button";

export default function Hero() {
  const { panels, ctaLabel, ctaHref } = siteConfig.hero;

  return (
    <section className="relative grid h-[70vh] min-h-[420px] grid-cols-3">
      {panels.map((panel, i) => (
        <div key={i} className="group relative h-full overflow-hidden">
          <PlaceholderImage
            tone={panel.tone}
            alt={panel.alt}
            zoomOnHover
            className="scale-100 transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          />
        </div>
      ))}

      <div className="absolute left-1/2 top-1/2 w-[85%] max-w-xs -translate-x-1/2 -translate-y-1/2 sm:w-auto">
        <Button
          href={ctaHref}
          variant="outline"
          className="w-full bg-[var(--color-surface)]/95 backdrop-blur-sm"
        >
          {ctaLabel}
        </Button>
      </div>
    </section>
  );
}
