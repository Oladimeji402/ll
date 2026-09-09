"use client";

import { useEffect, useState } from "react";

/**
 * Tracks whether the page has scrolled past `threshold` and which
 * direction the user last scrolled. Used to shrink/hide the sticky header.
 */
export function useScrollPosition(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);
  const [direction, setDirection] = useState("up");

  useEffect(() => {
    let lastY = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > threshold);
      setDirection(y > lastY && y > threshold ? "down" : "up");
      lastY = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return { scrolled, direction };
}
