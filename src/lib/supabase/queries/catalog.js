import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

// Public catalog data (products/collections) rarely changes and carries no
// per-user state, so it's cached across requests via Next's Data Cache —
// short revalidate window as a safety net, plus tags for on-demand
// invalidation once something (e.g. the admin panel) can trigger it.
const REVALIDATE_SECONDS = 60;

function mapProduct(row) {
  // images is the source of truth (what the admin form manages); tone/
  // image_count only remain as a fallback for rows that predate it.
  const gallery = row.images?.length ? row.images : null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.title,
    price: Number(row.price),
    originalPrice: row.compare_at_price ? Number(row.compare_at_price) : null,
    tone: gallery ? gallery[0].tone : row.tone,
    images: gallery ? gallery.length : row.image_count,
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

async function fetchAllProducts() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data.map(mapProduct);
}

export const getAllProducts = unstable_cache(fetchAllProducts, ["catalog", "products", "all"], {
  tags: ["products"],
  revalidate: REVALIDATE_SECONDS,
});

export async function searchProducts(query, limit = 8) {
  // Strip characters meaningful to PostgREST's or=(...) filter grammar so a
  // typed comma/paren can't reshape the query instead of just matching text.
  const term = query.replace(/[,()*]/g, " ").trim();
  if (!term) return [];

  // User-driven search terms aren't cached — unbounded key space, and
  // results should reflect the catalog as of right now.
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .or(`title.ilike.%${term}%,category.ilike.%${term}%,description.ilike.%${term}%`)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data.map(mapProduct);
}

async function fetchProductBySlug(slug) {
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

export const getProductBySlug = unstable_cache(fetchProductBySlug, ["catalog", "products", "by-slug"], {
  tags: ["products"],
  revalidate: REVALIDATE_SECONDS,
});

async function fetchRelatedProducts(slug, count) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("status", "active")
    .neq("slug", slug)
    .order("created_at", { ascending: true })
    .limit(count);

  if (error) throw error;
  return data.map(mapProduct);
}

const getRelatedProductsCached = unstable_cache(fetchRelatedProducts, ["catalog", "products", "related"], {
  tags: ["products"],
  revalidate: REVALIDATE_SECONDS,
});

export function getRelatedProducts(product, count = 4) {
  return getRelatedProductsCached(product.slug, count);
}

async function fetchAllCollections() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("status", "visible")
    .order("position", { ascending: true });

  if (error) throw error;
  return data.map(mapCollection);
}

export const getAllCollections = unstable_cache(fetchAllCollections, ["catalog", "collections", "all"], {
  tags: ["collections"],
  revalidate: REVALIDATE_SECONDS,
});

async function fetchCollectionBySlug(slug) {
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
    .eq("collection_id", collectionRow.id)
    .order("position", { ascending: true });

  if (linksError) throw linksError;

  const products = links
    .map((link) => link.products)
    .filter((product) => product && product.status === "active")
    .map(mapProduct);

  return { ...mapCollection(collectionRow), products };
}

export const getCollectionBySlug = unstable_cache(fetchCollectionBySlug, ["catalog", "collections", "by-slug"], {
  tags: ["collections", "products"],
  revalidate: REVALIDATE_SECONDS,
});

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
