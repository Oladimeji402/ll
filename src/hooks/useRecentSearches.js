"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "ll-store:recent-searches";
const MAX_RECENT = 6;

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStored(list) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Storage unavailable (private mode, disabled) — recent searches just won't persist.
  }
}

export function useRecentSearches() {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    setRecent(readStored());
  }, []);

  function addRecent(term) {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecent((current) => {
      const next = [trimmed, ...current.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(
        0,
        MAX_RECENT,
      );
      writeStored(next);
      return next;
    });
  }

  function removeRecent(term) {
    setRecent((current) => {
      const next = current.filter((t) => t !== term);
      writeStored(next);
      return next;
    });
  }

  function clearRecent() {
    setRecent([]);
    writeStored([]);
  }

  return { recent, addRecent, removeRecent, clearRecent };
}
