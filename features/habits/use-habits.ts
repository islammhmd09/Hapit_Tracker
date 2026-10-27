"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import { parseHabits, serializeHabits, storageKey } from "./model";
import type { Habit } from "./types";

// Tiny external store over localStorage. `useSyncExternalStore` keeps the
// first client render identical to the server's (no hydration mismatch), and
// the native `storage` event keeps several open tabs in sync.

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Storage blocked (private mode / policy): behave as if empty.
    return null;
  }
}

/**
 * Habits for one user, persisted in this browser. Data is keyed by user id, so
 * friends sharing a device never see each other's habits.
 *
 * `commit` re-reads storage before applying the change (so two tabs can't
 * overwrite each other with stale state) and returns whether it was saved.
 */
export function useHabits(userId: string) {
  const key = storageKey(userId);

  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null
  );
  const habits = useMemo(() => parseHabits(raw), [raw]);

  const commit = useCallback(
    (update: (current: Habit[]) => Habit[]): boolean => {
      try {
        const next = update(parseHabits(readRaw(key)));
        window.localStorage.setItem(key, serializeHabits(next));
        listeners.forEach((listener) => listener());
        return true;
      } catch {
        // Quota exceeded or storage unavailable.
        return false;
      }
    },
    [key]
  );

  return { habits, commit };
}
