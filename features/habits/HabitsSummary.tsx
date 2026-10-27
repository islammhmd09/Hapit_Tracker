import { addDays } from "./dates";
import ProgressRing from "./ProgressRing";
import {
  currentStreak,
  dayProgress,
  percentOf,
  rangeProgress,
} from "./stats";
import type { DateKey, TrackedHabit } from "./types";

const Tile = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) => (
  <div className="flex flex-col gap-1 rounded-xl border p-4">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="text-2xl font-semibold tabular-nums">{value}</span>
    {hint && <span className="truncate text-xs text-muted-foreground">{hint}</span>}
  </div>
);

function encouragement(done: number, total: number): string {
  if (total === 0) return "";
  if (done === total) return "يوم مثالي! أنجزت كل عاداتك اليوم";
  if (done === 0) return "ابدأ بأول خطوة اليوم";
  return `تبقّى ${total - done} للوصول إلى يوم مثالي`;
}

type HabitsSummaryProps = {
  tracked: TrackedHabit[];
  today: DateKey;
};

const HabitsSummary = ({ tracked, today }: HabitsSummaryProps) => {
  const todayStats = dayProgress(tracked, today);
  const percent = percentOf(todayStats) ?? 0;

  const last30 = rangeProgress(tracked, addDays(today, -29), today, today);
  const last30Percent = percentOf(last30);

  let topStreak = 0;
  let topStreakName: string | undefined;
  for (const t of tracked) {
    const streak = currentStreak(t.done, today);
    if (streak > topStreak) {
      topStreak = streak;
      topStreakName = t.habit.name;
    }
  }

  return (
    <div className="grid w-full grid-cols-2 gap-3">
      <div className="col-span-2 flex items-center gap-4 rounded-xl border p-4">
        <ProgressRing
          value={percent}
          label={`${todayStats.done} من ${todayStats.total} عادات منجزة اليوم`}
        />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-xs text-muted-foreground">تقدّم اليوم</span>
          <span dir="ltr" className="text-start text-2xl font-semibold tabular-nums">
            {todayStats.done} / {todayStats.total}
          </span>
          <span className="text-sm text-muted-foreground">
            {encouragement(todayStats.done, todayStats.total)}
          </span>
        </div>
      </div>

      <Tile
        label="أطول سلسلة حالية"
        value={topStreak > 0 ? `${topStreak} يوم` : "–"}
        hint={topStreakName ?? "ابدأ سلسلتك اليوم"}
      />
      <Tile
        label="الإنجاز آخر 30 يومًا"
        value={last30Percent !== null ? `${last30Percent}%` : "–"}
        hint={
          last30.total > 0 ? `${last30.done} من ${last30.total}` : undefined
        }
      />
    </div>
  );
};

export default HabitsSummary;
