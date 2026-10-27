import { Check, Trophy } from "lucide-react";

import { cn } from "@/lib/utils";

import { HABIT_COLORS } from "./colors";
import {
  dayOfMonth,
  formatFullDate,
  formatWeekday,
  weekDays,
} from "./dates";
import ProgressBar from "./ProgressBar";
import { percentOf, rangeProgress } from "./stats";
import type { DateKey, TrackedHabit } from "./types";

type WeekViewProps = {
  tracked: TrackedHabit[];
  today: DateKey;
  /** Any day inside the week to show. */
  anchor: DateKey;
  onToggle: (tracked: TrackedHabit, day: DateKey) => void;
};

const DayToggle = ({
  tracked: t,
  day,
  today,
  onToggle,
}: {
  tracked: TrackedHabit;
  day: DateKey;
  today: DateKey;
  onToggle: WeekViewProps["onToggle"];
}) => {
  const palette = HABIT_COLORS[t.habit.color];
  const done = t.done.has(day);
  const future = day > today;
  const isToday = day === today;

  return (
    <button
      type="button"
      disabled={future}
      aria-pressed={done}
      aria-label={`${t.habit.name}، ${formatFullDate(day)}`}
      onClick={() => onToggle(t, day)}
      className={cn(
        "mx-auto flex size-9 items-center justify-center rounded-full transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none",
        done
          ? palette.solid
          : future
            ? "border border-dashed opacity-40"
            : isToday
              ? cn("border-2", palette.border)
              : cn("bg-muted hover:bg-muted/70", day < t.start && "opacity-50"),
        done &&
          isToday &&
          "ring-2 ring-foreground/20 ring-offset-2 ring-offset-background"
      )}
    >
      {done && <Check className="size-4" />}
    </button>
  );
};

const WeekView = ({ tracked, today, anchor, onToggle }: WeekViewProps) => {
  const days = weekDays(anchor);
  const week = rangeProgress(tracked, days[0], days[6], today);
  const weekPercent = percentOf(week);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-2 rounded-xl border p-3">
        <div className="flex items-center justify-between text-sm">
          <span>تقدّم الأسبوع</span>
          <span dir="ltr" className="text-muted-foreground tabular-nums">
            {week.total > 0 ? `${week.done} / ${week.total}` : "–"}
          </span>
        </div>
        <ProgressBar
          value={weekPercent ?? 0}
          barClassName="bg-primary"
          label="تقدّم الأسبوع"
        />
      </div>

      {/* Same horizontal inset as the cards below (padding + 1px border) */}
      <div className="grid grid-cols-7 px-[calc(var(--spacing)*3+1px)]">
        {days.map((day) => (
          <div
            key={day}
            className="flex flex-col items-center gap-1 text-[11px] text-muted-foreground sm:text-xs"
          >
            <span>{formatWeekday(day)}</span>
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full tabular-nums",
                day === today &&
                  "bg-primary/10 font-semibold text-primary dark:text-sidebar-primary"
              )}
            >
              {dayOfMonth(day)}
            </span>
          </div>
        ))}
      </div>

      {tracked.map((t) => {
        const palette = HABIT_COLORS[t.habit.color];
        const count = days.filter((d) => t.done.has(d)).length;
        const perfect = count === 7;

        return (
          <div
            key={t.habit.id}
            className="flex flex-col gap-3 rounded-xl border p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={cn("size-2.5 shrink-0 rounded-full", palette.bar)}
                />
                <span dir="auto" className="truncate text-sm font-medium">
                  {t.habit.name}
                </span>
              </div>
              <span
                className={cn(
                  "flex shrink-0 items-center gap-1 text-sm font-semibold tabular-nums",
                  perfect ? "text-amber-600 dark:text-amber-400" : palette.text
                )}
                title={perfect ? "أسبوع مثالي" : undefined}
              >
                {perfect && <Trophy className="size-4" />}
                <span dir="ltr">{count} / 7</span>
              </span>
            </div>

            <div className="grid grid-cols-7">
              {days.map((day) => (
                <DayToggle
                  key={day}
                  tracked={t}
                  day={day}
                  today={today}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekView;
