import { addDays, diffDays } from "./dates";
import type { DateKey, Habit, TrackedHabit } from "./types";

/**
 * The first day a habit counts toward stats: its creation day, or an earlier
 * day the user back-filled. Without this, back-filling would give rates > 100%.
 */
export function trackingStart(habit: Habit): DateKey {
  const first = habit.doneDates[0];
  return first && first < habit.createdAt ? first : habit.createdAt;
}

export function buildTracked(habits: Habit[]): TrackedHabit[] {
  return habits.map((habit) => ({
    habit,
    done: new Set(habit.doneDates),
    start: trackingStart(habit),
  }));
}

/**
 * Consecutive days ending today. A streak is not broken until the day is
 * over, so if today isn't done yet it is counted up to yesterday.
 */
export function currentStreak(
  done: ReadonlySet<DateKey>,
  today: DateKey
): number {
  let cursor = done.has(today) ? today : addDays(today, -1);
  let count = 0;
  while (done.has(cursor)) {
    count++;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export function bestStreak(dates: Iterable<DateKey>): number {
  const sorted = [...new Set(dates)].sort();
  let best = 0;
  let run = 0;
  let previous: DateKey | null = null;

  for (const key of sorted) {
    run = previous !== null && diffDays(key, previous) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = key;
  }
  return best;
}

export type Progress = { done: number; total: number };

export const percentOf = ({ done, total }: Progress): number | null =>
  total > 0 ? Math.round((done / total) * 100) : null;

/** Completion over `[from, to]`, ignoring future days and days before `start`. */
export function habitProgress(
  { done, start }: Pick<TrackedHabit, "done" | "start">,
  from: DateKey,
  to: DateKey,
  today: DateKey
): Progress {
  const first = from > start ? from : start;
  const last = to < today ? to : today;
  if (first > last) return { done: 0, total: 0 };

  const total = diffDays(last, first) + 1;
  let count = 0;
  for (let i = 0; i < total; i++) {
    if (done.has(addDays(first, i))) count++;
  }
  return { done: count, total };
}

/** Habits done on one day, among habits that already existed that day. */
export function dayProgress(tracked: TrackedHabit[], key: DateKey): Progress {
  let done = 0;
  let total = 0;
  for (const t of tracked) {
    if (t.start > key) continue;
    total++;
    if (t.done.has(key)) done++;
  }
  return { done, total };
}

export function rangeProgress(
  tracked: TrackedHabit[],
  from: DateKey,
  to: DateKey,
  today: DateKey
): Progress {
  let done = 0;
  let total = 0;
  for (const t of tracked) {
    const p = habitProgress(t, from, to, today);
    done += p.done;
    total += p.total;
  }
  return { done, total };
}

export type HabitStats = {
  current: number;
  best: number;
  total: number;
  doneToday: boolean;
  /** Has a running streak that today's check-off would extend. */
  atRisk: boolean;
  last30: Progress;
};

export function getHabitStats(t: TrackedHabit, today: DateKey): HabitStats {
  const current = currentStreak(t.done, today);
  const doneToday = t.done.has(today);
  return {
    current,
    best: bestStreak(t.done),
    total: t.done.size,
    doneToday,
    atRisk: current > 0 && !doneToday,
    last30: habitProgress(t, addDays(today, -29), today, today),
  };
}
