# Clothing Brand Site

A Next.js (App Router) clone of a contemporary clothing-brand storefront:
sticky/shrinking header, 3-panel hero with CTA, infinite-scroll delivery
marquee, animated brand-story pull-quote, scroll-reveal product
collections with hover "Quick Add", floating discount badge, and a
floating chat bubble.

All imagery is placeholder (SVG panels) so the layout and animations can
be reviewed before real photography is ready.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Rebranding for a client

Two files cover almost everything:

- **`src/config/site.js`** — brand name, nav links, hero copy, marquee
  message, story quote, footer content, discount badge text.
- **`src/app/globals.css`** — color theme, at the top under `:root`
  (`--color-primary`, `--color-accent`, `--color-bg`, etc.) and the
  placeholder image palette (`--tone-0` … `--tone-4`).

Product/collection data (names, prices, placeholder tones) lives in
`src/data/products.js` — replace with real data or wire up a CMS/store
API later.

## Replacing placeholder images

Placeholder panels are rendered by `src/components/ui/PlaceholderImage.jsx`.
Swap it for a real `next/image` where it's used (`Hero.jsx`, `ProductCard.jsx`)
once photography is available — the surrounding containers already
control sizing/aspect ratio, so no other layout changes are needed.

## Structure

```
src/
  app/            # routes, layout, global styles
  components/
    layout/       # Header, Marquee, Footer, floating UI
    sections/     # Hero, Story, CollectionSection
    ui/           # ProductCard, PlaceholderImage, Reveal, Button
  config/         # site.js — brand/content config
  data/           # products.js — placeholder product data
  hooks/          # useScrollPosition
  lib/            # utils
```
