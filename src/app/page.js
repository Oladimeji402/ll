import Header from "@/components/layout/Header";
import Marquee from "@/components/layout/Marquee";
import Footer from "@/components/layout/Footer";
import FloatingBadge from "@/components/layout/FloatingBadge";
import ChatBubble from "@/components/layout/ChatBubble";
import Hero from "@/components/sections/Hero";
import Story from "@/components/sections/Story";
import CollectionSection from "@/components/sections/CollectionSection";
import { collections } from "@/data/products";

export default function Home() {
  return (
    <>
      <Header />

      <main className="flex-1">
        <Hero />
        <Marquee />
        <Story />

        {collections.map((collection) => (
          <CollectionSection
            key={collection.id}
            id={collection.id}
            title={collection.title}
            products={collection.products}
          />
        ))}
      </main>

      <Footer />

      <FloatingBadge />
      <ChatBubble />
    </>
  );
}
