import { AlertTriangle } from "lucide-react";
import Button from "./Button";

export default function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this. Please try again.",
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--admin-danger-bg)] text-[var(--admin-danger)]">
        <AlertTriangle className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h3 className="font-serif text-base text-[var(--admin-text)]">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-[var(--admin-text-muted)]">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
