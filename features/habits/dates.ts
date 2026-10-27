import type { DateKey } from "./types";

const MS_PER_DAY = 86_400_000;

/** 0 = Sunday … 6 = Saturday. Saturday-first, as in Arabic calendars. */
export const WEEK_START = 6;

// Latin digits, to match the rest of the site (dates, stats, percentages).
const LOCALE = "ar-EG-u-nu-latn";

// Day maths below runs on UTC day numbers, never on local Date objects, so it
// can't be thrown off by daylight-saving shifts or the user's timezone.

export function toDateKey(date: Date): DateKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const todayKey = (): DateKey => toDateKey(new Date());

function toDayNumber(key: DateKey): number {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / MS_PER_DAY;
}

function fromDayNumber(n: number): DateKey {
  return new Date(n * MS_PER_DAY).toISOString().slice(0, 10);
}

export function isDateKey(value: unknown): value is DateKey {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  // Round-trip rejects impossible dates like 2026-02-31.
  return fromDayNumber(toDayNumber(value)) === value;
}

export const addDays = (key: DateKey, n: number): DateKey =>
  fromDayNumber(toDayNumber(key) + n);

/** Whole days from `b` to `a` (positive when `a` is later). */
export const diffDays = (a: DateKey, b: DateKey): number =>
  toDayNumber(a) - toDayNumber(b);

export const weekdayOf = (key: DateKey): number =>
  new Date(toDayNumber(key) * MS_PER_DAY).getUTCDay();

export const dayOfMonth = (key: DateKey): number => Number(key.slice(8, 10));

export function startOfWeek(key: DateKey): DateKey {
  const offset = (weekdayOf(key) - WEEK_START + 7) % 7;
  return addDays(key, -offset);
}

export function weekDays(key: DateKey): DateKey[] {
  const start = startOfWeek(key);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// ---- months ---------------------------------------------------------------

export type YearMonth = { year: number; month: number }; // month: 1–12

export const yearMonthOf = (key: DateKey): YearMonth => ({
  year: Number(key.slice(0, 4)),
  month: Number(key.slice(5, 7)),
});

export const firstOfMonth = ({ year, month }: YearMonth): DateKey =>
  `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-01`;

export function shiftMonth({ year, month }: YearMonth, delta: number): YearMonth {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export const daysInMonth = (ym: YearMonth): number =>
  diffDays(firstOfMonth(shiftMonth(ym, 1)), firstOfMonth(ym));

/** Weeks of 7 cells; `null` pads the days that belong to other months. */
export function monthGrid(ym: YearMonth): (DateKey | null)[][] {
  const first = firstOfMonth(ym);
  const lead = (weekdayOf(first) - WEEK_START + 7) % 7;
  const cells: (DateKey | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: daysInMonth(ym) }, (_, i) => addDays(first, i)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (DateKey | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// ---- formatting (Arabic) --------------------------------------------------

const make = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(LOCALE, { ...options, timeZone: "UTC" });

const WEEKDAY = make({ weekday: "short" });
const DAY_MONTH = make({ day: "numeric", month: "short" });
const MONTH_YEAR = make({ month: "long", year: "numeric" });
const FULL_DATE = make({ weekday: "long", day: "numeric", month: "long" });

const asDate = (key: DateKey) => new Date(toDayNumber(key) * MS_PER_DAY);

export const formatWeekday = (key: DateKey) => WEEKDAY.format(asDate(key));
export const formatDayMonth = (key: DateKey) => DAY_MONTH.format(asDate(key));
export const formatMonthYear = (key: DateKey) => MONTH_YEAR.format(asDate(key));
export const formatFullDate = (key: DateKey) => FULL_DATE.format(asDate(key));
