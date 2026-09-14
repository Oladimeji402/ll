/**
 * Templated marketing copy for a collection page (refine options, "why
 * customers love this" blurb, FAQ) — not real content yet, just enough to
 * keep the page from looking empty. Replace with real copy per collection
 * once it's written; consider moving this into the collections table then.
 */

const OCCASIONS = [
  "Celebrations and special occasions",
  "Luxury vacations",
  "Birthday events",
  "Brunches and social occasions",
  "Date nights",
  "Elevated everyday fashion",
];

const REFINE_OPTIONS = ["Best Selling", "New In", "Dresses", "Co-ord Sets", "Outerwear", "Accessories"];

export function getCollectionMarketingContent(title) {
  return {
    refineOptions: REFINE_OPTIONS,
    favorites: {
      heading: "Why These Styles Are Favorites",
      intro: `Our ${title.toLowerCase()} pieces are loved for their flattering silhouettes, premium fabrics, and versatile designs — customer favorites perfect for:`,
      occasionsHeading: "Customers Choose These Pieces For:",
      occasions: OCCASIONS,
    },
    faqHeading: "Frequently Asked Questions",
    faq: [
      {
        question: `What can I buy from LL's ${title} collection?`,
        answer: `Placeholder answer — describe what's included in the ${title} range: ready-to-wear, accessories, made-to-order pieces, and more.`,
      },
      {
        question: "What should I wear to a special occasion?",
        answer: "Placeholder answer — highlight the pieces best suited for weddings, parties, and other events.",
      },
      {
        question: "What are the latest fashion trends?",
        answer: "Placeholder answer — summarize the current trends this collection reflects.",
      },
    ],
  };
}
