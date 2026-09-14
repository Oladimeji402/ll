import Marquee from "@/components/layout/Marquee";
import Hero from "@/components/sections/Hero";
import Story from "@/components/sections/Story";
import CategoryShowcase from "@/components/sections/CategoryShowcase";
import CollectionSection from "@/components/sections/CollectionSection";
import CategoryBanner from "@/components/sections/CategoryBanner";
import TrendingStyles from "@/components/sections/TrendingStyles";
import TrustBadges from "@/components/sections/TrustBadges";
import { getAllProducts, getHomepageSections } from "@/lib/supabase/queries/catalog";

export default async function Home() {
  const [allProducts, sections] = await Promise.all([getAllProducts(), getHomepageSections()]);
  const trendingProducts = allProducts.slice(8, 16);

  return (
    <main className="flex-1">
      <Hero />
      <Marquee />
      <Story />
      <CategoryShowcase />

      {sections.map((section) => (
        <CollectionSection
          key={section.id}
          id={section.id}
          slug={section.slug}
          title={section.title}
          products={section.products}
        />
      ))}

      <CategoryBanner />
      <TrendingStyles products={trendingProducts} />
      <TrustBadges />
    </main>
  );
}
