"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FileDrop({ onFiles, multiple = true, className, label = "Drag and drop images, or browse" }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(fileList) {
    const files = Array.from(fileList ?? []);
    if (files.length) onFiles(files);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed px-6 py-10 text-center transition-colors",
        dragging ? "border-[var(--color-primary)] bg-[var(--admin-surface-alt)]" : "border-[var(--admin-border)] hover:bg-[var(--admin-surface-alt)]",
        className,
      )}
    >
      <UploadCloud className="h-6 w-6 text-[var(--admin-text-muted)]" strokeWidth={1.5} />
      <p className="text-sm text-[var(--admin-text)]">{label}</p>
      <p className="text-xs text-[var(--admin-text-muted)]">PNG or JPG, up to 10MB each</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
