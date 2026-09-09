import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { siteConfig } from "@/config/site";

export default function CategoryBanner() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2">
      {siteConfig.categoryBanner.map((panel, i) => (
        <Reveal key={panel.label} delay={i * 100} className="group relative aspect-[4/5] overflow-hidden sm:aspect-auto sm:h-[70vh] sm:min-h-[420px]">
          <PlaceholderImage
            tone={panel.tone}
            alt={panel.label}
            zoomOnHover
            className="transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <Link
            href={panel.href}
            className="tracking-nav absolute bottom-8 left-8 border border-[var(--color-text)] bg-[var(--color-surface)]/95 px-6 py-3 text-xs uppercase text-[var(--color-text)] backdrop-blur-sm transition-colors hover:bg-[var(--color-text)] hover:text-[var(--color-surface)]"
          >
            {panel.label}
          </Link>
        </Reveal>
      ))}
    </section>
  );
}
