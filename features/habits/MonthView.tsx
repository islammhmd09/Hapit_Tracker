"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { HABIT_COLORS } from "./colors";
import {
  addDays,
  daysInMonth,
  dayOfMonth,
  firstOfMonth,
  formatFullDate,
  formatWeekday,
  monthGrid,
  weekDays,
  yearMonthOf,
} from "./dates";
import {
  dayProgress,
  habitProgress,
  percentOf,
  rangeProgress,
} from "./stats";
import type { DateKey, TrackedHabit } from "./types";

type MonthViewProps = {
  tracked: TrackedHabit[];
  today: DateKey;
  /** Any day inside the month to show. */
  anchor: DateKey;
  onToggle: (tracked: TrackedHabit, day: DateKey) => void;
};

/** Shade by how many habits were completed that day (brand colour). */
function heatClass(ratio: number | null, future: boolean): string {
  if (future || ratio === null) return "text-muted-foreground/40";
  if (ratio === 0) return "bg-muted text-muted-foreground";
  if (ratio < 0.5) return "bg-primary/20";
  if (ratio < 1) return "bg-primary/50";
  return "bg-primary font-semibold text-primary-foreground";
}

const TODAY_RING =
  "ring-2 ring-foreground/40 ring-offset-1 ring-offset-background";

const Legend = () => (
  <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
    <span>أقل</span>
    {["bg-muted", "bg-primary/20", "bg-primary/50", "bg-primary"].map((c) => (
      <span key={c} className={cn("size-3.5 rounded-[4px]", c)} />
    ))}
    <span>أكثر</span>
  </div>
);

const MonthView = ({ tracked, today, anchor, onToggle }: MonthViewProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Derived, so deleting the selected habit quietly falls back to "all".
  const selected = tracked.find((t) => t.habit.id === selectedId) ?? null;
  const palette = selected ? HABIT_COLORS[selected.habit.color] : null;

  const ym = yearMonthOf(anchor);
  const weeks = monthGrid(ym);
  const monthFirst = firstOfMonth(ym);
  const monthLast = addDays(monthFirst, daysInMonth(ym) - 1);

  const progress = selected
    ? habitProgress(selected, monthFirst, monthLast, today)
    : rangeProgress(tracked, monthFirst, monthLast, today);
  const percent = percentOf(progress);

  let perfectDays = 0;
  if (!selected) {
    for (let i = 0; i < daysInMonth(ym); i++) {
      const day = addDays(monthFirst, i);
      if (day > today) break;
      const p = dayProgress(tracked, day);
      if (p.total > 0 && p.done === p.total) perfectDays++;
    }
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div
        role="group"
        aria-label="عرض حسب العادة"
        className="flex gap-2 overflow-x-auto pb-1"
      >
        <Button
          size="sm"
          variant={selected ? "outline" : "default"}
          aria-pressed={!selected}
          className="shrink-0 rounded-full"
          onClick={() => setSelectedId(null)}
        >
          الكل
        </Button>
        {tracked.map((t) => {
          const p = HABIT_COLORS[t.habit.color];
          const active = selected?.habit.id === t.habit.id;
          return (
            <Button
              key={t.habit.id}
              size="sm"
              variant="outline"
              aria-pressed={active}
              className={cn(
                "shrink-0 rounded-full",
                active && cn(p.soft, p.border)
              )}
              onClick={() => setSelectedId(t.habit.id)}
            >
              <span className={cn("size-2.5 rounded-full", p.bar)} />
              {t.habit.name}
            </Button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 rounded-xl border p-3">
        <div className="grid grid-cols-7 text-center text-[11px] text-muted-foreground sm:text-xs">
          {weekDays(monthFirst).map((d) => (
            <span key={d}>{formatWeekday(d)}</span>
          ))}
        </div>

        {/* Wrapper keeps rows tight so a streak reads as one continuous bar */}
        <div className="flex flex-col gap-1">
          {weeks.map((week, row) => (
            <div
              key={row}
              className={cn("grid grid-cols-7", !selected && "gap-1")}
            >
              {week.map((day, col) => {
                if (day === null) return <div key={`pad-${row}-${col}`} />;

                const future = day > today;
                const isToday = day === today;

                if (!selected || !palette) {
                  const p = dayProgress(tracked, day);
                  const ratio = p.total > 0 ? p.done / p.total : null;
                  return (
                    <div
                      key={day}
                      role="img"
                      aria-label={`${formatFullDate(day)}: ${p.done} من ${p.total}`}
                      title={`${p.done} من ${p.total}`}
                      className={cn(
                        "flex h-10 items-center justify-center rounded-lg text-sm tabular-nums",
                        heatClass(ratio, future),
                        isToday && TODAY_RING
                      )}
                    >
                      {dayOfMonth(day)}
                    </div>
                  );
                }

                const done = selected.done.has(day);
                const prev = col > 0 ? week[col - 1] : null;
                const next = col < 6 ? week[col + 1] : null;
                const joinPrev = done && prev !== null && selected.done.has(prev);
                const joinNext = done && next !== null && selected.done.has(next);

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={future}
                    aria-pressed={done}
                    aria-label={`${selected.habit.name}، ${formatFullDate(day)}`}
                    onClick={() => onToggle(selected, day)}
                    className={cn(
                      "flex h-10 items-center justify-center text-sm tabular-nums transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none",
                      // Logical corners: in RTL the "start" side is the earlier day
                      joinPrev ? "rounded-s-none" : "rounded-s-lg",
                      joinNext ? "rounded-e-none" : "rounded-e-lg",
                      done
                        ? palette.solid
                        : future
                          ? "text-muted-foreground/40"
                          : "hover:bg-muted",
                      isToday && !done && cn("border-2", palette.border),
                      isToday && done && TODAY_RING
                    )}
                  >
                    {dayOfMonth(day)}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-muted-foreground">
          {selected ? (
            <>
              أنجزت{" "}
              <span className="font-medium text-foreground tabular-nums">
                {progress.done}
              </span>{" "}
              من {progress.total} يوم
              {percent !== null && ` (${percent}%)`}
            </>
          ) : (
            <>
              أيام مثالية:{" "}
              <span className="font-medium text-foreground tabular-nums">
                {perfectDays}
              </span>
              {percent !== null && ` · متوسط الإنجاز ${percent}%`}
            </>
          )}
        </p>
        {!selected && <Legend />}
      </div>
    </div>
  );
};

export default MonthView;
