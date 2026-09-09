import { cn } from "@/lib/utils";

const TONE_VARS = ["--tone-0", "--tone-1", "--tone-2", "--tone-3", "--tone-4"];

/**
 * Stand-in for a real product/hero photo. Renders a soft tinted panel with
 * a simple garment icon so the layout reads correctly before real
 * photography is dropped in — just swap this for a Next <Image> once you
 * have assets, keeping the same container classes for sizing.
 */
export default function PlaceholderImage({
  tone = 0,
  alt = "",
  className,
  zoomOnHover = false,
  label,
}) {
  const toneVar = TONE_VARS[tone % TONE_VARS.length];

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        className,
      )}
      style={{ backgroundColor: `var(${toneVar})` }}
      role="img"
      aria-label={alt}
    >
      <svg
        viewBox="0 0 64 64"
        className={cn(
          "h-[38%] w-[38%] text-black/20 transition-transform duration-700 ease-out",
          zoomOnHover && "group-hover:scale-110",
        )}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          d="M24 8 L20 14 L10 18 L14 28 L20 25 L20 56 L44 56 L44 25 L50 28 L54 18 L44 14 L40 8 C40 8 37 12 32 12 C27 12 24 8 24 8 Z"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      {label ? (
        <span className="tracking-nav absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] uppercase text-black/30">
          {label}
        </span>
      ) : null}
    </div>
  );
}
