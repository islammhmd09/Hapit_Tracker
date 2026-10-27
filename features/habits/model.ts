import {
  DEFAULT_HABIT_COLOR,
  isHabitColor,
} from "./colors";
import { isDateKey } from "./dates";
import type { DateKey, Habit, HabitInput } from "./types";

export const MAX_HABITS = 20;
export const MAX_NAME_LENGTH = 40;

const STORAGE_VERSION = 1;

export const storageKey = (userId: string) =>
  `mujahideen:habits:v${STORAGE_VERSION}:${userId}`;

export function serializeHabits(habits: Habit[]): string {
  return JSON.stringify({ version: STORAGE_VERSION, habits });
}

/**
 * Reads whatever is in localStorage and keeps only what is valid. Anything
 * hand-edited or corrupted is dropped or repaired rather than crashing the page.
 */
export function parseHabits(raw: string | null): Habit[] {
  if (!raw) return [];

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }

  const list = (data as { habits?: unknown } | null)?.habits;
  if (!Array.isArray(list)) return [];

  const seen = new Set<string>();
  const habits: Habit[] = [];

  for (const item of list) {
    if (typeof item !== "object" || item === null) continue;
    const h = item as Record<string, unknown>;

    const name = typeof h.name === "string" ? h.name.trim() : "";
    if (typeof h.id !== "string" || !h.id || seen.has(h.id) || !name) continue;
    seen.add(h.id);

    const doneDates = Array.isArray(h.doneDates)
      ? [...new Set(h.doneDates.filter(isDateKey))].sort()
      : [];

    habits.push({
      id: h.id,
      name: name.slice(0, MAX_NAME_LENGTH),
      color: isHabitColor(h.color) ? h.color : DEFAULT_HABIT_COLOR,
      createdAt: isDateKey(h.createdAt) ? h.createdAt : (doneDates[0] ?? ""),
      doneDates,
    });
  }

  // A habit with no valid creation date and no history has nothing to anchor to.
  return habits.filter((h) => h.createdAt !== "");
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// ---- pure updates (each returns a new array) -------------------------------

export function addHabit(
  habits: Habit[],
  input: HabitInput,
  today: DateKey
): Habit[] {
  if (habits.length >= MAX_HABITS) return habits;
  return [
    ...habits,
    {
      id: newId(),
      name: input.name.trim().slice(0, MAX_NAME_LENGTH),
      color: input.color,
      createdAt: today,
      doneDates: [],
    },
  ];
}

export const updateHabit = (
  habits: Habit[],
  id: string,
  input: HabitInput
): Habit[] =>
  habits.map((h) =>
    h.id === id
      ? {
          ...h,
          name: input.name.trim().slice(0, MAX_NAME_LENGTH),
          color: input.color,
        }
      : h
  );

export const removeHabit = (habits: Habit[], id: string): Habit[] =>
  habits.filter((h) => h.id !== id);

export const toggleDay = (
  habits: Habit[],
  id: string,
  key: DateKey
): Habit[] =>
  habits.map((h) => {
    if (h.id !== id) return h;
    const doneDates = h.doneDates.includes(key)
      ? h.doneDates.filter((d) => d !== key)
      : [...h.doneDates, key].sort();
    return { ...h, doneDates };
  });
