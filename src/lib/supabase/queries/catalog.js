import { createPublicClient } from "@/lib/supabase/public";

function mapProduct(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.title,
    price: Number(row.price),
    originalPrice: row.compare_at_price ? Number(row.compare_at_price) : null,
    tone: row.tone,
    images: row.image_count,
    sizes: row.sizes,
    description: row.description,
  };
}

function mapCollection(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    tone: row.tone,
  };
}

export async function getAllProducts() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data.map(mapProduct);
}

export async function getProductBySlug(slug) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProduct(data) : null;
}

export async function getRelatedProducts(product, count = 4) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .neq("slug", product.slug)
    .order("created_at", { ascending: true })
    .limit(count);

  if (error) throw error;
  return data.map(mapProduct);
}

export async function getAllCollections() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("status", "visible")
    .order("position", { ascending: true });

  if (error) throw error;
  return data.map(mapCollection);
}

export async function getCollectionBySlug(slug) {
  const supabase = createPublicClient();
  const { data: collectionRow, error: collectionError } = await supabase
    .from("collections")
    .select("*")
    .eq("status", "visible")
    .eq("slug", slug)
    .maybeSingle();

  if (collectionError) throw collectionError;
  if (!collectionRow) return null;

  const { data: links, error: linksError } = await supabase
    .from("product_collections")
    .select("products(*)")
    .eq("collection_id", collectionRow.id);

  if (linksError) throw linksError;

  const products = links
    .map((link) => link.products)
    .filter((product) => product && product.status === "active")
    .map(mapProduct);

  return { ...mapCollection(collectionRow), products };
}

// The 3 curated homepage sections — mapped positionally onto fixed anchor
// ids the Hero CTA already links to (#collection-new etc).
const HOMEPAGE_SECTION_SLUGS = [
  { anchorId: "collection-new", slug: "new-arrivals" },
  { anchorId: "collection-signature", slug: "the-signature-edit" },
  { anchorId: "collection-edit", slug: "best-sellers" },
];

const HOMEPAGE_SECTION_PRODUCT_LIMIT = 8;

export async function getHomepageSections() {
  const sections = await Promise.all(
    HOMEPAGE_SECTION_SLUGS.map(async ({ anchorId, slug }) => {
      const collection = await getCollectionBySlug(slug);
      if (!collection) return null;
      return {
        id: anchorId,
        slug: collection.slug,
        title: collection.title,
        products: collection.products.slice(0, HOMEPAGE_SECTION_PRODUCT_LIMIT),
      };
    }),
  );
  return sections.filter(Boolean);
}
