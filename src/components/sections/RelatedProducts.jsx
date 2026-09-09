import Reveal from "@/components/ui/Reveal";
import ProductCard from "@/components/ui/ProductCard";
import { siteConfig } from "@/config/site";

export default function RelatedProducts({ products }) {
  if (!products.length) return null;

  return (
    <section className="bg-[var(--color-primary)] px-5 py-16 sm:py-20">
      <Reveal as="h2" className="mb-10 text-center font-serif text-2xl text-[var(--color-on-primary)] sm:text-3xl">
        {siteConfig.productPage.relatedHeading}
      </Reveal>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4 sm:gap-x-6">
        {products.map((product, i) => (
          <Reveal key={product.id} delay={(i % 4) * 90}>
            <ProductCard product={product} theme="dark" />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
