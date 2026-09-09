import Reveal from "@/components/ui/Reveal";
import Accordion from "@/components/ui/Accordion";
import { siteConfig } from "@/config/site";

export default function Faq() {
  return (
    <section className="bg-[var(--color-bg-alt)] px-5 py-16 sm:py-20">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="font-serif text-3xl text-[var(--color-primary)] sm:text-4xl">
          {siteConfig.productPage.faqHeading}
        </h2>
        <span aria-hidden className="mx-auto mt-4 block h-px w-12 bg-[var(--color-accent)]" />
      </Reveal>

      <Reveal className="mx-auto mt-10 max-w-2xl">
        <Accordion items={siteConfig.productPage.faq} topBorder={false} />
      </Reveal>
    </section>
  );
}
