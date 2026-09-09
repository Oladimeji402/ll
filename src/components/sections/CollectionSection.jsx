import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/ui/ProductCard";

export default function CollectionSection({ id, title, products }) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-5 py-14 sm:py-20">
      <Reveal as="div" className="mb-10 flex flex-col items-center gap-6 text-center">
        <h2 className="font-serif text-3xl text-[var(--color-primary)] sm:text-4xl">
          {title}
        </h2>
        <Button href="#" variant="outline">
          View All
        </Button>
      </Reveal>

      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4 sm:gap-x-6">
        {products.map((product, i) => (
          <Reveal key={product.id} delay={(i % 4) * 90}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
