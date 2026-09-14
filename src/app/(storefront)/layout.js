import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FloatingBadge from "@/components/layout/FloatingBadge";
import ChatBubble from "@/components/layout/ChatBubble";

// Header/Footer/ChatBubble live here (not in each page) so client-side
// navigation between storefront pages keeps them mounted instead of
// remounting — their own data fetches (search picks, featured collection)
// then run once per session instead of once per page.
export default function StorefrontLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <FloatingBadge />
      <ChatBubble />
    </>
  );
}
