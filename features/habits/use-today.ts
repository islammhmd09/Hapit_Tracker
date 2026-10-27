"use client";

import { useSyncExternalStore } from "react";

import { todayKey } from "./dates";
import type { DateKey } from "./types";

function subscribe(callback: () => void) {
  // Re-check periodically and when the tab regains attention, so a page left
  // open overnight rolls over to the new day instead of editing yesterday.
  const timer = window.setInterval(callback, 30_000);
  document.addEventListener("visibilitychange", callback);
  window.addEventListener("focus", callback);
  return () => {
    window.clearInterval(timer);
    document.removeEventListener("visibilitychange", callback);
    window.removeEventListener("focus", callback);
  };
}

/** Today's local date, or `null` during server render / before hydration. */
export function useToday(): DateKey | null {
  const today = useSyncExternalStore(subscribe, todayKey, () => "");
  return today || null;
}
