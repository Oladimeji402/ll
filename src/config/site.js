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
