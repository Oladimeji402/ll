import PlaceholderImage from "./PlaceholderImage";
import { formatPrice } from "@/data/products";

export default function ProductCard({ product }) {
  return (
    <div className="group">
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-image-bg)]">
        <PlaceholderImage tone={product.tone} alt={product.name} zoomOnHover />

        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-[var(--color-primary)] py-3 text-center transition-transform duration-300 ease-out group-hover:translate-y-0">
          <span className="tracking-nav text-[11px] uppercase text-[var(--color-on-primary)]">
            Quick Add
          </span>
        </div>
      </div>

      <div className="pt-4 text-center">
        <p className="tracking-nav text-[11px] uppercase text-[var(--color-text)]">
          {product.name}
        </p>
        <p className="mt-1 text-sm text-[var(--color-primary)]">
          {product.originalPrice ? (
            <span className="mr-2 text-[var(--color-text-muted)] line-through">
              {formatPrice(product.originalPrice)}
            </span>
          ) : null}
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  );
}
