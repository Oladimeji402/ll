"use client";

import { useEffect, useState } from "react";

/**
 * Gates rendering of persisted (localStorage-backed) state until after the
 * client has mounted, so the server-rendered/first-client-render markup
 * always agrees and we never get a hydration mismatch from state that only
 * exists in the browser (e.g. the cart).
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
