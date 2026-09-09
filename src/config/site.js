/**
 * SITE CONFIG — edit this file to rebrand the whole site.
 *
 * Change the brand name, nav links, hero copy, marquee message, and
 * footer content here. Nothing else needs to change for a basic rebrand.
 * Colors live in `src/app/globals.css` (search for `@theme`).
 * Placeholder product/collection data lives in `src/data/products.js`.
 */

export const siteConfig = {
  // ---- Brand --------------------------------------------------------------
  brandName: "BRAND NAME",
  brandInitial: "B",
  metaTitle: "BRAND NAME — Contemporary Ready-to-Wear",
  metaDescription:
    "Placeholder storefront for a contemporary clothing brand. Replace this copy, the images, and the colors to launch your client's site.",

  // ---- Top announcement marquee -------------------------------------------
  marquee: {
    text: "FREE DELIVERY IN LAGOS",
    repeat: 8,
  },

  // ---- Primary navigation --------------------------------------------------
  navLinks: [
    "New Arrivals",
    "The Signature Edit",
    "Best Sellers",
    "Co-ord Sets",
    "Dresses",
    "Outerwear",
    "Accessories",
    "Sale",
  ],
  navVisibleCount: 6, // links shown before the rest collapse into "More"
  navOverflowLabel: "More",

  // ---- Hero (3-panel split banner) -----------------------------------------
  hero: {
    ctaLabel: "View New Collection",
    ctaHref: "#collection-new",
    panels: [
      { tone: 0, alt: "Model wearing a printed maxi look" },
      { tone: 1, alt: "Model wearing a co-ord set" },
      { tone: 2, alt: "Model wearing a patterned dress" },
    ],
  },

  // ---- Brand story / pull-quote section -------------------------------------
  story: {
    quote:
      "It begins with a single thread. A pattern drawn from culture, a rhythm carried through fabric. From motive to form, the line becomes a language.",
  },

  // ---- Product detail page ----------------------------------------------------
  productPage: {
    shippingNote: "Shipping calculated at checkout.",
    addToCartLabel: "Add to Cart",
    buyNowLabel: "Buy It Now",
    accordion: [
      {
        heading: "Description",
        body: "Placeholder product description — replace with real copy covering fabric, fit, and styling notes once this product is finalized.",
      },
      {
        heading: "Delivery",
        body: "Fast delivery across Lagos, nationwide, and worldwide — 24–48 hrs locally and 7–14 days internationally.",
      },
      {
        heading: "Size Guide",
        body: "Refer to our size chart to find your best fit. Reach out if you need help choosing a size.",
      },
    ],
    relatedHeading: "You May Also Like",
    trustBadges: [
      {
        heading: "Exchanges & Returns",
        body: "Exchange in-store or return within 5 days for store credit. Items must be in original condition. Sale items are final.",
      },
      {
        heading: "Worldwide Shipping",
        body: "Fast delivery across Lagos, nationwide, and worldwide — 24–48 hrs locally and 7–14 days internationally.",
      },
      {
        heading: "Top-Notch Quality",
        body: "Every piece is crafted with care, attention to detail, and the highest standards — made to look good and last.",
      },
    ],
    faqHeading: "Frequently Asked Questions",
    faq: [
      {
        question: "What can I buy from BRAND NAME?",
        answer:
          "Placeholder answer — describe your product range here: ready-to-wear, accessories, made-to-order pieces, and more.",
      },
      {
        question: "What should I wear to a special occasion?",
        answer:
          "Placeholder answer — highlight the collections or pieces best suited for weddings, parties, and other events.",
      },
      {
        question: "Where do you ship to?",
        answer:
          "Placeholder answer — list the regions or countries you currently ship to and typical delivery times.",
      },
    ],
    reviewsHeading: "Customers Are Saying",
    reviewsRating: 4.87,
    reviewsCount: 22,
    reviews: [
      {
        text: "The piece is a very nice and stylish outfit. I get compliments every time I wear it.",
        rating: 5,
        name: "Amara Johnson",
        product: "Look 01",
      },
      {
        text: "Great quality fabric and the fit was true to size. Will definitely order again.",
        rating: 5,
        name: "Chidinma Okafor",
        product: "Piece 03",
      },
      {
        text: "Fast delivery and the packaging was beautiful. Exactly as pictured.",
        rating: 4,
        name: "Zainab Bello",
        product: "Style 09",
      },
    ],
  },

  // ---- Floating UI ------------------------------------------------------------
  discountBadge: "Up to 10% OFF",
  chatBubbleLabel: "Chat with us",

  // ---- Footer -------------------------------------------------------------------
  footer: {
    newsletterHeading: "Join the list",
    newsletterCopy:
      "Be first to know about new drops, restocks, and private sales.",
    columns: [
      {
        heading: "Shop",
        links: ["New Arrivals", "Best Sellers", "Dresses", "Sale"],
      },
      {
        heading: "Help",
        links: ["Track Order", "Shipping & Returns", "Size Guide", "Contact Us"],
      },
      {
        heading: "About",
        links: ["Our Story", "Sustainability", "Careers", "Press"],
      },
    ],
    social: ["Instagram", "TikTok", "Pinterest"],
    copyrightHolder: "BRAND NAME",
  },
};
