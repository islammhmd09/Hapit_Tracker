import { CalendarCheck, Flame, Pencil, Trash2, Trophy } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { HABIT_COLORS } from "./colors";
import ProgressBar from "./ProgressBar";
import { getHabitStats, percentOf } from "./stats";
import type { DateKey, TrackedHabit } from "./types";

type HabitStatsCardProps = {
  tracked: TrackedHabit;
  today: DateKey;
  onEdit: () => void;
  onDelete: () => void;
};

const MiniStat = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) => (
  <div className="flex flex-col items-center gap-0.5 rounded-lg border p-2">
    <span className="flex items-center gap-1 text-lg font-semibold tabular-nums">
      {icon}
      {value}
    </span>
    <span className="text-[11px] text-muted-foreground">{label}</span>
  </div>
);

const HabitStatsCard = ({
  tracked,
  today,
  onEdit,
  onDelete,
}: HabitStatsCardProps) => {
  const { habit } = tracked;
  const palette = HABIT_COLORS[habit.color];
  const stats = getHabitStats(tracked, today);
  const percent = percentOf(stats.last30);

  return (
    <li className="flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn("size-3 shrink-0 rounded-full", palette.bar)} />
          <h4 dir="auto" className="truncate font-medium">
            {habit.name}
          </h4>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`تعديل ${habit.name}`}
            onClick={onEdit}
          >
            <Pencil />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive"
            aria-label={`حذف ${habit.name}`}
            onClick={onDelete}
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <MiniStat
          icon={
            <Flame
              className={cn(
                "size-4 text-amber-600 dark:text-amber-400",
                stats.current >= 7 && "fill-current"
              )}
            />
          }
          label="السلسلة الحالية"
          value={stats.current}
        />
        <MiniStat
          icon={<Trophy className="size-4 text-amber-600 dark:text-amber-400" />}
          label="أفضل سلسلة"
          value={stats.best}
        />
        <MiniStat
          icon={<CalendarCheck className={cn("size-4", palette.text)} />}
          label="أيام الإنجاز"
          value={stats.total}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>آخر 30 يومًا</span>
          <span className="tabular-nums">
            {percent !== null
              ? `${percent}% · ${stats.last30.done} من ${stats.last30.total}`
              : "–"}
          </span>
        </div>
        <ProgressBar
          value={percent ?? 0}
          barClassName={palette.bar}
          label={`نسبة إنجاز ${habit.name} آخر 30 يومًا`}
        />
      </div>
    </li>
  );
};

export default HabitStatsCard;
