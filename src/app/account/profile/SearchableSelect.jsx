"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function SearchableSelect({ name, label, options, value, onChange, placeholder, disabled }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const match = options.find((o) => o.value === value);
    setQuery(match ? match.label : (value ?? ""));
  }, [value, options]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
    return pool.slice(0, 50);
  }, [query, options]);

  return (
    <div className="relative" ref={ref}>
      <label className="block">
        <span className="text-sm text-[var(--color-text)]">{label}</span>
        <input
          type="text"
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            onChange("");
          }}
          className="mt-2 w-full border border-[var(--color-line)] bg-transparent px-4 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] disabled:opacity-60"
        />
      </label>
      <input type="hidden" name={name} value={value ?? ""} />

      {open && !disabled && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto border border-[var(--color-line)] bg-[var(--color-surface)] shadow-lg">
          {filtered.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setQuery(option.label);
                  setOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)]"
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
