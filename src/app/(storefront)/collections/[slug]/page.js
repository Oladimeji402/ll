import { notFound } from "next/navigation";
import Reveal from "@/components/ui/Reveal";
import CollectionToolbar from "@/components/collection/CollectionToolbar";
import CategoryFavorites from "@/components/sections/CategoryFavorites";
import TrustBadges from "@/components/sections/TrustBadges";
import Faq from "@/components/sections/Faq";
import TestimonialCarousel from "@/components/sections/TestimonialCarousel";
import { getAllCollections, getCollectionBySlug } from "@/lib/supabase/queries/catalog";
import { getCollectionMarketingContent } from "@/lib/collection-content";
import { siteConfig } from "@/config/site";

export async function generateStaticParams() {
  const collections = await getAllCollections();
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) return {};
  return { title: `${collection.title} — ${siteConfig.brandName}` };
}

export default async function CollectionPage({ params }) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const category = { ...collection, ...getCollectionMarketingContent(collection.title) };

  return (
    <main className="flex-1">
      <Reveal as="div" className="mx-auto max-w-3xl px-5 pb-12 pt-16 text-center sm:pt-20">
        <h1 className="font-serif text-4xl uppercase tracking-wide text-[var(--color-primary)] sm:text-5xl">
          {category.title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-[var(--color-text-muted)]">
          {category.description}
        </p>
      </Reveal>

      <CollectionToolbar products={category.products} refineOptions={category.refineOptions} />

      <CategoryFavorites favorites={category.favorites} />
      <TrustBadges />
      <Faq heading={category.faqHeading} items={category.faq} />
      <TestimonialCarousel
        heading={siteConfig.testimonials.heading}
        rating={siteConfig.testimonials.rating}
        count={siteConfig.testimonials.count}
        reviews={siteConfig.testimonials.reviews}
      />
    </main>
  );
}
