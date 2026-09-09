/**
 * Placeholder product/collection data.
 *
 * Replace the generated items below with real products once photography
 * and copy are ready. Each product needs: name, slug (used for its detail
 * page URL), price, optional originalPrice (for a sale strike-through),
 * and a `tone` index (0-4) that picks a color from the placeholder
 * palette in ProductImage. `images` sets how many gallery placeholders
 * the product detail page renders.
 */

const SIZES = ["S", "M", "L"];

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function makeProducts(count, namePrefix, offset = 0, toneCount = 5) {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1 + offset;
    const hasSale = n % 3 === 0;
    const base = 45000 + ((n * 7) % 12) * 5000;
    const name = `${namePrefix} ${String(n).padStart(2, "0")}`;
    return {
      id: `${namePrefix.toLowerCase()}-${n}`,
      slug: slugify(name),
      name,
      price: base,
      originalPrice: hasSale ? base + 20000 : null,
      tone: (n - 1) % toneCount,
      images: 4,
      sizes: SIZES,
      description:
        "Placeholder product description — replace with real copy covering fabric, fit, and styling notes once this product is finalized.",
    };
  });
}

export const collections = [
  {
    id: "collection-new",
    title: "New Collection",
    products: makeProducts(4, "Look"),
  },
  {
    id: "collection-signature",
    title: "Defined By Us",
    products: makeProducts(8, "Piece"),
  },
  {
    id: "collection-edit",
    title: "The Edit",
    products: makeProducts(4, "Style", 8),
  },
];

export function formatPrice(amount) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export function getAllProducts() {
  return collections.flatMap((collection) => collection.products);
}

export function getProductBySlug(slug) {
  return getAllProducts().find((product) => product.slug === slug);
}

export function getRelatedProducts(product, count = 4) {
  const all = getAllProducts().filter((p) => p.slug !== product.slug);
  return all.slice(0, count);
}
