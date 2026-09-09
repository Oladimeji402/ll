"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { slugify } from "@/lib/utils";
import Reveal from "@/components/ui/Reveal";

export default function Footer() {
  const { footer, brandName } = siteConfig;

  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-bg-alt)]">
      <Reveal className="mx-auto max-w-7xl px-5 pb-8 pt-10 text-center sm:pb-10 sm:pt-16">
        <h2 className="font-serif text-xl text-[var(--color-primary)] sm:text-2xl">
          {footer.newsletterHeading}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-text-muted)]">
          {footer.newsletterCopy}
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mx-auto mt-5 flex max-w-md flex-col gap-3 sm:mt-6 sm:flex-row"
        >
          <input
            type="email"
            required
            placeholder="Email address"
            className="w-full border border-[var(--color-text)] bg-transparent px-4 py-3 text-sm outline-none placeholder:text-[var(--color-text-muted)]"
          />
          <button
            type="submit"
            className="tracking-nav whitespace-nowrap bg-[var(--color-primary)] px-6 py-3 text-xs uppercase text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary-dark)]"
          >
            Subscribe
          </button>
        </form>
      </Reveal>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 border-t border-[var(--color-line)] px-5 py-8 text-center sm:gap-10 sm:py-12 sm:text-left md:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <p className="font-serif text-xl text-[var(--color-primary)]">
            {brandName}
          </p>
          <div className="mt-4 flex justify-center gap-4 sm:justify-start">
            {footer.social.map((s) => (
              <a
                key={s}
                href="#"
                className="tracking-nav text-[10px] uppercase text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
              >
                {s}
              </a>
            ))}
          </div>
        </div>

        {footer.columns.map((col) => (
          <div key={col.heading}>
            <p className="tracking-nav text-xs uppercase text-[var(--color-text)]">
              {col.heading}
            </p>
            <ul className="mt-3 flex flex-col gap-2 sm:mt-4 sm:gap-3">
              {col.links.map((link) => (
                <li key={link}>
                  {col.heading === "Shop" ? (
                    <Link
                      href={`/collections/${slugify(link)}`}
                      className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
                    >
                      {link}
                    </Link>
                  ) : (
                    <a
                      href="#"
                      className="text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
                    >
                      {link}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-[var(--color-line)] px-5 py-4 text-center text-xs text-[var(--color-text-muted)] sm:py-6">
        &copy; {new Date().getFullYear()} {footer.copyrightHolder}. All rights
        reserved.
      </div>
    </footer>
  );
}
