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
  brandName: "LL",
  metaTitle: "LL — Contemporary Ready-to-Wear",
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

  // ---- Category showcase (image tiles under a heading) ----------------------
  categoryShowcase: {
    heading: "Find The Perfect Piece",
    items: [
      { label: "Dresses", tone: 0, href: "#" },
      { label: "Outerwear", tone: 2, href: "#" },
      { label: "Sets", tone: 4, href: "#" },
    ],
  },

  // ---- Category banner (large 2-panel split with CTA) ------------------------
  categoryBanner: [
    { label: "Shop Dresses", tone: 3, href: "#" },
    { label: "Shop Matching Sets", tone: 1, href: "#" },
  ],

  // ---- Trending styles (horizontal scrolling product rail) -------------------
  trending: {
    heading: "Trending Styles",
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
        question: "What can I buy from LL?",
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
    // Placeholder "customer reviews" widget — shaped to drop in a real
    // reviews app (Judge.me, Loox, Okendo, …) later without a redesign.
    customerReviews: {
      heading: "Customer Reviews",
      average: 0,
      count: 0,
      breakdown: [
        { stars: 5, percent: 0 },
        { stars: 4, percent: 0 },
        { stars: 3, percent: 0 },
        { stars: 2, percent: 0 },
        { stars: 1, percent: 0 },
      ],
      writeReviewLabel: "Write a Review",
      searchPlaceholder: "Search reviews",
      sortLabel: "Most Relevant",
      filterLabel: "All Ratings",
      mediaFilterLabel: "With Media",
      emptyStateText: "No reviews yet",
      // Two-step "write a review" modal: pick a star rating, then the form.
      writeReviewForm: {
        emailLabel: "Your email",
        emailPlaceholder: "user@example.com",
        nameLabel: "Display name",
        namePlaceholder: "Jane D",
        reviewLabel: "Review",
        reviewPlaceholder: "What would you tell your friends",
        mediaLabel: "Media",
        mediaHint: "Reviews with media are found to be more helpful",
        doneLabel: "Done",
      },
    },
  },

  // ---- Testimonial carousel (used on collection pages) -----------------------
  testimonials: {
    heading: "Customers Are Saying",
    rating: 4.87,
    count: 22,
    reviews: [
      {
        text: "Nice Fabric & Style",
        rating: 5,
        name: "Anonymous",
      },
      {
        text: "The piece is a very nice and stylish outfit. I get compliments every time I wear it.",
        rating: 5,
        name: "Amara Johnson",
      },
      {
        text: "Great quality fabric and the fit was true to size. Will definitely order again.",
        rating: 4,
        name: "Chidinma Okafor",
      },
    ],
  },

  // ---- Floating UI ------------------------------------------------------------
  discountBadge: "Up to 10% OFF",
  chatBubbleLabel: "Chat with us",

  // ---- Chat panel (opens from the floating chat bubble) ----------------------
  // A small tabbed widget: Home (sign up + featured collection), Orders and
  // Account (both a sign-in prompt — no accounts exist yet, so both point to
  // the same placeholder form), and Chat (the AI assistant).
  chat: {
    heading: "Chat",
    emailPlaceholder: "Email",
    signInLabel: "Sign In",
    home: {
      heading: "Earn rewards, track orders, and save your shopping history",
    },
    orders: {
      heading: "Sign in to view your orders",
    },
    account: {
      heading: "Sign in to view your account",
    },
    assistantName: "Aria",
    assistantRole: "AI Assistant",
    greeting: [
      "Hi 👋 Welcome to LL!",
      "Looking for something specific or need help with your order? We're here to help. 💬",
      "Tell us what you need, and we'll be happy to assist you.",
    ],
    consentText:
      "By starting this chat, you consent to us recording this conversation to improve your experience.",
    inputPlaceholder: "Ask a question",
  },

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
    copyrightHolder: "LL",
  },
};
