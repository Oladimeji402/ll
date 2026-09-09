import Link from "next/link";
import PlaceholderImage from "./PlaceholderImage";
import { formatPrice } from "@/data/products";
import { cn } from "@/lib/utils";

export default function ProductCard({ product, theme = "light" }) {
  const isDark = theme === "dark";

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-image-bg)]">
        {/* Default: front-facing shot */}
        <PlaceholderImage
          tone={product.tone}
          alt={product.name}
          variant="front"
          fill
          className="opacity-100 transition-opacity duration-500 ease-out group-hover:opacity-0"
        />
        {/* Revealed on hover: side-profile shot */}
        <PlaceholderImage
          tone={product.tone}
          alt={`${product.name} — side view`}
          variant="side"
          fill
          className="opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
        />

        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-[var(--color-primary)] py-3 text-center transition-transform duration-300 ease-out group-hover:translate-y-0">
          <span className="tracking-nav text-[11px] uppercase text-[var(--color-on-primary)]">
            Quick Add
          </span>
        </div>
      </div>

      <div className="pt-4 text-center">
        <p
          className={cn(
            "tracking-nav text-[11px] uppercase",
            isDark ? "text-[var(--color-on-primary)]" : "text-[var(--color-text)]",
          )}
        >
          {product.name}
        </p>
        <p
          className={cn(
            "mt-1 text-sm",
            isDark ? "text-[var(--color-accent)]" : "text-[var(--color-primary)]",
          )}
        >
          {product.originalPrice ? (
            <span
              className={cn(
                "mr-2 line-through",
                isDark ? "text-[var(--color-on-primary)]/60" : "text-[var(--color-text-muted)]",
              )}
            >
              {formatPrice(product.originalPrice)}
            </span>
          ) : null}
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
