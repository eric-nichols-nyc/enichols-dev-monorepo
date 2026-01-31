"use client";

import { useSyncExternalStore } from "react";

/**
 * Matches a media query and returns whether it matches. Uses useSyncExternalStore
 * so the value is read synchronously during render on the client, avoiding
 * layout shift from a delayed useEffect update.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
