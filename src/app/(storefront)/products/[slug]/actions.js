"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitReview(productId, review) {
  const supabase = await createClient();

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    rating: review.rating,
    author_name: review.name,
    author_email: review.email,
    body: review.body,
  });

  if (error) {
    return { error: "Couldn't submit your review. Please try again." };
  }

  return { success: true };
}
