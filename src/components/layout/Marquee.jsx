import { siteConfig } from "@/config/site";

export default function Marquee() {
  const { text, repeat } = siteConfig.marquee;
  const items = Array.from({ length: repeat });

  const track = (
    <div className="flex shrink-0 items-center">
      {items.map((_, i) => (
        <span
          key={i}
          className="tracking-nav mx-6 flex items-center gap-3 text-xs uppercase text-[var(--color-on-primary)] sm:text-sm"
        >
          <TruckIcon />
          {text}
        </span>
      ))}
    </div>
  );

  return (
    <div className="overflow-hidden bg-[var(--color-primary)] py-3">
      <div className="marquee-track flex w-max">
        {track}
        {track}
      </div>
    </div>
  );
}

function TruckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M1 7h11v9H1zM12 10h4l4 3v3h-8z"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="5.5" cy="17.5" r="1.5" />
      <circle cx="16.5" cy="17.5" r="1.5" />
    </svg>
  );
}
