import Reveal from "@/components/ui/Reveal";
import { siteConfig } from "@/config/site";

const ICONS = [ReturnIcon, TruckIcon, CheckIcon];

export default function TrustBadges() {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-16 text-center sm:grid-cols-3 sm:py-20">
      {siteConfig.productPage.trustBadges.map((badge, i) => {
        const Icon = ICONS[i % ICONS.length];
        return (
          <Reveal key={badge.heading} delay={i * 100} className="flex flex-col items-center">
            <Icon />
            <h3 className="mt-4 font-serif text-xl text-[var(--color-primary)]">
              {badge.heading}
            </h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-[var(--color-text-muted)]">
              {badge.body}
            </p>
          </Reveal>
        );
      })}
    </section>
  );
}

function ReturnIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 text-[var(--color-primary)]" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 10h11a5 5 0 0 1 0 10H9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 6 4 10l4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 text-[var(--color-primary)]" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 7h11v9H1zM12 10h4l4 3v3h-8z" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="5.5" cy="17.5" r="1.5" />
      <circle cx="16.5" cy="17.5" r="1.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 text-[var(--color-primary)]" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 12l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
