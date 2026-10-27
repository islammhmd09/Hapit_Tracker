"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  addDays,
  firstOfMonth,
  formatDayMonth,
  formatMonthYear,
  shiftMonth,
  weekDays,
  yearMonthOf,
} from "./dates";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import type { DateKey, TrackedHabit } from "./types";

type Mode = "week" | "month";

type HabitCalendarProps = {
  tracked: TrackedHabit[];
  today: DateKey;
  onToggle: (tracked: TrackedHabit, day: DateKey) => void;
};

const MODES: { value: Mode; label: string }[] = [
  { value: "week", label: "أسبوعي" },
  { value: "month", label: "شهري" },
];

const HabitCalendar = ({ tracked, today, onToggle }: HabitCalendarProps) => {
  const [mode, setMode] = useState<Mode>("week");
  const [anchor, setAnchor] = useState<DateKey>(today);

  const week = weekDays(anchor);
  const ym = yearMonthOf(anchor);
  const currentYm = yearMonthOf(today);

  const nextStart =
    mode === "week"
      ? addDays(week[0], 7)
      : firstOfMonth(shiftMonth(ym, 1));
  // Nothing to show in the future, so don't let the user wander there.
  const canGoNext = nextStart <= today;

  const isCurrent =
    mode === "week"
      ? week.includes(today)
      : ym.year === currentYm.year && ym.month === currentYm.month;

  const label =
    mode === "week"
      ? `${formatDayMonth(week[0])} – ${formatDayMonth(week[6])}`
      : formatMonthYear(firstOfMonth(ym));

  const go = (direction: -1 | 1) =>
    setAnchor(
      mode === "week"
        ? addDays(week[0], direction * 7)
        : firstOfMonth(shiftMonth(ym, direction))
    );

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          {MODES.map((m) => (
            <Button
              key={m.value}
              size="sm"
              variant={mode === m.value ? "default" : "outline"}
              aria-pressed={mode === m.value}
              className="rounded-full"
              onClick={() => setMode(m.value)}
            >
              {m.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {/* RTL: "previous" sits on the right and points right */}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="الفترة السابقة"
            onClick={() => go(-1)}
          >
            <ChevronRight />
          </Button>
          <span
            className="min-w-32 text-center text-sm font-medium"
            aria-live="polite"
          >
            {label}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="الفترة التالية"
            disabled={!canGoNext}
            onClick={() => go(1)}
          >
            <ChevronLeft />
          </Button>
        </div>
      </div>

      {!isCurrent && (
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => setAnchor(today)}
        >
          العودة إلى اليوم
        </Button>
      )}

      {mode === "week" ? (
        <WeekView
          tracked={tracked}
          today={today}
          anchor={anchor}
          onToggle={onToggle}
        />
      ) : (
        <MonthView
          tracked={tracked}
          today={today}
          anchor={anchor}
          onToggle={onToggle}
        />
      )}
    </div>
  );
};

export default HabitCalendar;
