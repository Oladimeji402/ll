import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingBadge from "@/components/layout/FloatingBadge";
import ChatBubble from "@/components/layout/ChatBubble";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import RelatedProducts from "@/components/sections/RelatedProducts";
import CustomerReviews from "@/components/sections/CustomerReviews";
import TrustBadges from "@/components/sections/TrustBadges";
import Faq from "@/components/sections/Faq";
import { getAllProducts, getProductBySlug, getRelatedProducts } from "@/lib/supabase/queries/catalog";

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return { title: `${product.name} — ${product.name}` };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  return (
    <>
      <Header />

      <main className="flex-1">
        <div className="grid lg:grid-cols-2">
          <ProductGallery product={product} />
          <ProductInfo product={product} />
        </div>

        <RelatedProducts products={related} />
        <CustomerReviews product={product} />
        <TrustBadges />
        <Faq />
      </main>

      <Footer />

      <FloatingBadge />
      <ChatBubble />
    </>
  );
}
