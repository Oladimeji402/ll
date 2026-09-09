import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { siteConfig } from "@/config/site";

export default function CategoryShowcase() {
  const { heading, items } = siteConfig.categoryShowcase;

  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:py-20">
      <Reveal as="h2" className="mb-10 text-center font-serif text-3xl text-[var(--color-primary)] sm:text-4xl">
        {heading}
      </Reveal>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        {items.map((item, i) => (
          <Reveal key={item.label} delay={i * 100}>
            <Link href={item.href} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-image-bg)]">
                <PlaceholderImage
                  tone={item.tone}
                  alt={item.label}
                  zoomOnHover
                  className="transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <p className="tracking-nav mt-4 text-center text-xs uppercase text-[var(--color-text)]">
                {item.label}
              </p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
