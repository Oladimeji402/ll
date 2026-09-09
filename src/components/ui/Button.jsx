import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-dark)]",
  outline:
    "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-text)] hover:bg-[var(--color-text)] hover:text-[var(--color-surface)]",
};

export default function Button({
  as: Tag = "a",
  variant = "outline",
  className,
  children,
  ...rest
}) {
  return (
    <Tag
      className={cn(
        "tracking-nav inline-flex items-center justify-center px-7 py-3 text-xs uppercase transition-colors duration-300",
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
