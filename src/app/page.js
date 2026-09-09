import Header from "@/components/layout/Header";
import Marquee from "@/components/layout/Marquee";
import Footer from "@/components/layout/Footer";
import FloatingBadge from "@/components/layout/FloatingBadge";
import ChatBubble from "@/components/layout/ChatBubble";
import Hero from "@/components/sections/Hero";
import Story from "@/components/sections/Story";
import CategoryShowcase from "@/components/sections/CategoryShowcase";
import CollectionSection from "@/components/sections/CollectionSection";
import CategoryBanner from "@/components/sections/CategoryBanner";
import TrendingStyles from "@/components/sections/TrendingStyles";
import TrustBadges from "@/components/sections/TrustBadges";
import { collections, getAllProducts } from "@/data/products";

export default function Home() {
  const trendingProducts = getAllProducts().slice(8, 16);

  return (
    <>
      <Header />

      <main className="flex-1">
        <Hero />
        <Marquee />
        <Story />
        <CategoryShowcase />

        {collections.map((collection) => (
          <CollectionSection
            key={collection.id}
            id={collection.id}
            title={collection.title}
            products={collection.products}
          />
        ))}

        <CategoryBanner />
        <TrendingStyles products={trendingProducts} />
        <TrustBadges />
      </main>

      <Footer />

      <FloatingBadge />
      <ChatBubble />
    </>
  );
}
