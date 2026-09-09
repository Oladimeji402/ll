/**
 * Category (collection listing) pages — one per nav link, generated from
 * `siteConfig.navLinks` so every nav item automatically gets a working
 * page at /collections/[slug]. Replace the templated copy and swap the
 * product selection logic for a real category/tag filter once products
 * carry real category data.
 */

import { siteConfig } from "@/config/site";
import { slugify } from "@/lib/utils";
import { getAllProducts } from "./products";

const OCCASIONS = [
  "Celebrations and special occasions",
  "Luxury vacations",
  "Birthday events",
  "Brunches and social occasions",
  "Date nights",
  "Elevated everyday fashion",
];

const REFINE_OPTIONS = [
  "Best Selling",
  "New In",
  "Dresses",
  "Co-ord Sets",
  "Outerwear",
  "Accessories",
];

function buildCategory(name, index) {
  const all = getAllProducts();
  const start = (index * 5) % all.length;
  const products = Array.from({ length: 12 }, (_, i) => all[(start + i) % all.length]);

  return {
    slug: slugify(name),
    title: name,
    description: `Explore our ${name.toLowerCase()} collection — celebrated for exceptional craftsmanship and timeless style, from statement pieces to everyday essentials. This edit defines modern luxury.`,
    products,
    refineOptions: REFINE_OPTIONS,
    favorites: {
      heading: "Why These Styles Are Favorites",
      intro: `Our ${name.toLowerCase()} pieces are loved for their flattering silhouettes, premium fabrics, and versatile designs — customer favorites perfect for:`,
      occasionsHeading: "Customers Choose These Pieces For:",
      occasions: OCCASIONS,
    },
    faqHeading: "Frequently Asked Questions",
    faq: [
      {
        question: `What can I buy from LL's ${name} collection?`,
        answer: `Placeholder answer — describe what's included in the ${name} range: ready-to-wear, accessories, made-to-order pieces, and more.`,
      },
      {
        question: "What should I wear to a special occasion?",
        answer:
          "Placeholder answer — highlight the pieces best suited for weddings, parties, and other events.",
      },
      {
        question: "What are the latest fashion trends?",
        answer:
          "Placeholder answer — summarize the current trends this collection reflects.",
      },
    ],
  };
}

export function getAllCategories() {
  return siteConfig.navLinks.map((name, i) => buildCategory(name, i));
}

export function getCategoryBySlug(slug) {
  return getAllCategories().find((category) => category.slug === slug);
}
