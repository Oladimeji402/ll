import Reveal from "@/components/ui/Reveal";

export default function CategoryFavorites({ favorites }) {
  const { heading, intro, occasionsHeading, occasions } = favorites;

  return (
    <section className="bg-[var(--color-bg-alt)] px-5 py-16 text-center sm:py-20">
      <Reveal className="mx-auto max-w-3xl">
        <h2 className="font-serif text-3xl text-[var(--color-primary)] sm:text-4xl">{heading}</h2>
        <span aria-hidden className="mx-auto mt-4 block h-px w-12 bg-[var(--color-accent)]" />
        <p className="mt-6 text-[var(--color-text)]">{intro}</p>

        <p className="tracking-nav mt-10 text-xs uppercase text-[var(--color-text)]">
          {occasionsHeading}
        </p>
        <span aria-hidden className="mx-auto mt-4 block h-px w-full max-w-md bg-[var(--color-line)]" />

        <ul className="mx-auto mt-6 grid max-w-md grid-cols-1 gap-x-10 gap-y-3 text-left sm:grid-cols-2">
          {occasions.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-[var(--color-text)]">
              <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--color-primary)]" />
              {item}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
