/**
 * Placeholder product/collection data.
 *
 * Replace the generated items below with real products once photography
 * and copy are ready. Each product needs: name, price, optional
 * originalPrice (for a sale strike-through), and a `tone` index (0-4)
 * that picks a color from the placeholder palette in ProductImage.
 */

function makeProducts(count, namePrefix, offset = 0, toneCount = 5) {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1 + offset;
    const hasSale = n % 3 === 0;
    const base = 45000 + ((n * 7) % 12) * 5000;
    return {
      id: `${namePrefix.toLowerCase()}-${n}`,
      name: `${namePrefix} ${String(n).padStart(2, "0")}`,
      price: base,
      originalPrice: hasSale ? base + 20000 : null,
      tone: (n - 1) % toneCount,
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
