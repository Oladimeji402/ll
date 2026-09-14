import { createPublicClient } from "@/lib/supabase/public";

export async function getProductReviews(productId) {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("reviews_public")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const reviews = data.map((row) => ({
    id: row.id,
    rating: row.rating,
    authorName: row.author_name,
    body: row.body,
    createdAt: row.created_at,
  }));

  const count = reviews.length;
  const average = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const starCount = reviews.filter((r) => r.rating === stars).length;
    return { stars, percent: count ? Math.round((starCount / count) * 100) : 0 };
  });

  return { reviews, count, average: Math.round(average * 10) / 10, breakdown };
}
