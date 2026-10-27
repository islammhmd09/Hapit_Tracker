import type { HabitColor } from "./colors";

/** Calendar day as "YYYY-MM-DD" in the user's local time. */
export type DateKey = string;

export type Habit = {
  id: string;
  name: string;
  color: HabitColor;
  createdAt: DateKey;
  /** Days the habit was completed. Always unique and sorted ascending. */
  doneDates: DateKey[];
};

export type HabitInput = {
  name: string;
  color: HabitColor;
};

/** A habit plus values derived once per render, so views don't recompute. */
export type TrackedHabit = {
  habit: Habit;
  done: ReadonlySet<DateKey>;
  /** First day this habit counts toward stats. */
  start: DateKey;
};
