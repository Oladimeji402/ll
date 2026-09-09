import { siteConfig } from "@/config/site";
import Reveal from "@/components/ui/Reveal";

export default function Story() {
  return (
    <section className="mx-auto max-w-4xl px-8 py-20 text-center sm:py-28">
      <Reveal className="relative">
        <span
          aria-hidden
          className="absolute -left-1 top-0 hidden h-full w-[3px] bg-[var(--color-accent)] sm:block"
        />
        <span
          aria-hidden
          className="absolute -right-1 top-0 hidden h-full w-[3px] bg-[var(--color-accent)] sm:block"
        />
        <p className="font-serif text-xl italic leading-relaxed text-[var(--color-text)] sm:text-2xl">
          {siteConfig.story.quote}
        </p>
      </Reveal>
    </section>
  );
}
