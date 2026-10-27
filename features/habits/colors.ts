export const HABIT_COLOR_KEYS = [
  "brand",
  "emerald",
  "amber",
  "orange",
  "rose",
  "pink",
  "violet",
  "indigo",
] as const;

export type HabitColor = (typeof HABIT_COLOR_KEYS)[number];

type Palette = {
  label: string;
  /** Filled surface + readable foreground (done cells, check circles). */
  solid: string;
  soft: string;
  border: string;
  text: string;
  bar: string;
};

// Full literal class names on purpose: Tailwind only generates classes it can
// find as plain text in the source, so never build these with template strings.
// "brand" maps to the site's own `primary` token, so the default habit colour
// always follows the site theme.
export const HABIT_COLORS: Record<HabitColor, Palette> = {
  brand: {
    label: "الأساسي",
    solid: "bg-primary text-primary-foreground",
    soft: "bg-primary/10",
    border: "border-primary",
    text: "text-primary dark:text-sidebar-primary",
    bar: "bg-primary",
  },
  emerald: {
    label: "أخضر",
    solid: "bg-emerald-500 text-white",
    soft: "bg-emerald-500/10",
    border: "border-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
  },
  amber: {
    label: "كهرماني",
    solid: "bg-amber-500 text-amber-950",
    soft: "bg-amber-500/10",
    border: "border-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    bar: "bg-amber-500",
  },
  orange: {
    label: "برتقالي",
    solid: "bg-orange-500 text-white",
    soft: "bg-orange-500/10",
    border: "border-orange-500",
    text: "text-orange-600 dark:text-orange-400",
    bar: "bg-orange-500",
  },
  rose: {
    label: "وردي غامق",
    solid: "bg-rose-500 text-white",
    soft: "bg-rose-500/10",
    border: "border-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    bar: "bg-rose-500",
  },
  pink: {
    label: "وردي",
    solid: "bg-pink-500 text-white",
    soft: "bg-pink-500/10",
    border: "border-pink-500",
    text: "text-pink-600 dark:text-pink-400",
    bar: "bg-pink-500",
  },
  violet: {
    label: "بنفسجي",
    solid: "bg-violet-500 text-white",
    soft: "bg-violet-500/10",
    border: "border-violet-500",
    text: "text-violet-600 dark:text-violet-400",
    bar: "bg-violet-500",
  },
  indigo: {
    label: "نيلي",
    solid: "bg-indigo-500 text-white",
    soft: "bg-indigo-500/10",
    border: "border-indigo-500",
    text: "text-indigo-600 dark:text-indigo-400",
    bar: "bg-indigo-500",
  },
};

export const DEFAULT_HABIT_COLOR: HabitColor = "brand";

export function isHabitColor(value: unknown): value is HabitColor {
  return (
    typeof value === "string" &&
    (HABIT_COLOR_KEYS as readonly string[]).includes(value)
  );
}
