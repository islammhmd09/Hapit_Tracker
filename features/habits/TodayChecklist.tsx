import { Check, Flame } from "lucide-react";

import { cn } from "@/lib/utils";

import { HABIT_COLORS } from "./colors";
import { currentStreak } from "./stats";
import type { DateKey, TrackedHabit } from "./types";

type TodayChecklistProps = {
  tracked: TrackedHabit[];
  today: DateKey;
  onToggle: (tracked: TrackedHabit, day: DateKey) => void;
};

const TodayChecklist = ({ tracked, today, onToggle }: TodayChecklistProps) => (
  <ul className="flex w-full flex-col gap-2">
    {tracked.map((t) => {
      const palette = HABIT_COLORS[t.habit.color];
      const done = t.done.has(today);
      const streak = currentStreak(t.done, today);
      const atRisk = streak > 0 && !done;

      return (
        <li key={t.habit.id}>
          <button
            type="button"
            aria-pressed={done}
            onClick={() => onToggle(t, today)}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl border p-3 text-start transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.99] motion-reduce:transition-none",
              done ? cn(palette.soft, palette.border) : "hover:bg-muted/50"
            )}
          >
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full transition-all motion-reduce:transition-none",
                done ? palette.solid : cn("border-2", palette.border)
              )}
            >
              {done && <Check className="size-5" />}
            </span>

            <span className="flex min-w-0 flex-1 flex-col">
              <span
                dir="auto"
                className={cn(
                  "truncate text-base font-medium",
                  done && "text-muted-foreground"
                )}
              >
                {t.habit.name}
              </span>
              {atRisk && (
                <span className="text-xs text-muted-foreground">
                  أنجزها اليوم للحفاظ على سلسلتك
                </span>
              )}
            </span>

            {streak > 0 && (
              <span
                className="flex items-center gap-1 text-sm font-semibold text-amber-600 tabular-nums dark:text-amber-400"
                title={`سلسلة ${streak} يوم`}
              >
                <Flame
                  className={cn("size-4", streak >= 7 && "fill-current")}
                />
                {streak}
              </span>
            )}
          </button>
        </li>
      );
    })}
  </ul>
);

export default TodayChecklist;
