"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, Plus } from "lucide-react";
import { toast } from "sonner";

import Heading from "@/components/shared/Heading";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import DeleteHabitDialog from "./DeleteHabitDialog";
import { formatFullDate } from "./dates";
import HabitCalendar from "./HabitCalendar";
import HabitForm from "./HabitForm";
import HabitStatsCard from "./HabitStatsCard";
import HabitsSummary from "./HabitsSummary";
import {
  MAX_HABITS,
  addHabit,
  removeHabit,
  toggleDay,
  updateHabit,
} from "./model";
import { buildTracked, currentStreak } from "./stats";
import TodayChecklist from "./TodayChecklist";
import type { DateKey, Habit, HabitInput, TrackedHabit } from "./types";
import { useHabits } from "./use-habits";
import { useToday } from "./use-today";

const SUGGESTIONS = ["شرب الماء", "الرياضة", "القراءة", "النوم مبكرًا"];
const STREAK_MILESTONES = [3, 7, 14, 21, 30, 50, 100, 200, 365];
const SAVE_ERROR = "تعذّر حفظ التغييرات في هذا المتصفح";

type FormTarget = { habitId?: string; suggestedName?: string };

const HabitsSkeleton = () => (
  <div className="flex w-full flex-col gap-4" aria-busy="true">
    <Skeleton className="h-9 w-full" />
    <Skeleton className="h-28 w-full rounded-xl" />
    <Skeleton className="h-16 w-full rounded-xl" />
    <Skeleton className="h-16 w-full rounded-xl" />
  </div>
);

const HabitTracker = ({ userId }: { userId: string }) => {
  const today = useToday();
  const { habits, commit } = useHabits(userId);
  const tracked = useMemo(() => buildTracked(habits), [habits]);

  // Targets are kept after closing so sheet/dialog text doesn't flicker
  // while their exit animation plays.
  const [formOpen, setFormOpen] = useState(false);
  const [formTarget, setFormTarget] = useState<FormTarget>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);

  if (!today) return <HabitsSkeleton />;

  const editing = formTarget.habitId
    ? habits.find((h) => h.id === formTarget.habitId)
    : undefined;
  const atLimit = habits.length >= MAX_HABITS;

  function openAdd(suggestedName?: string) {
    setFormTarget({ suggestedName });
    setFormOpen(true);
  }

  function openEdit(habit: Habit) {
    setFormTarget({ habitId: habit.id });
    setFormOpen(true);
  }

  function openDelete(habit: Habit) {
    setDeleteTarget(habit);
    setDeleteOpen(true);
  }

  function handleSubmit(input: HabitInput) {
    const id = formTarget.habitId;
    const saved = id
      ? commit((current) => updateHabit(current, id, input))
      : commit((current) => addHabit(current, input, today as DateKey));

    if (!saved) {
      toast.error(SAVE_ERROR);
      return;
    }
    toast.success(id ? "تم حفظ التعديلات" : "تمت إضافة العادة");
    setFormOpen(false);
  }

  function handleDelete(habit: Habit) {
    if (!commit((current) => removeHabit(current, habit.id))) {
      toast.error(SAVE_ERROR);
      return;
    }
    toast.success("تم حذف العادة");
    setDeleteOpen(false);
  }

  function handleToggle(t: TrackedHabit, day: DateKey) {
    const now = today as DateKey;
    const completing = !t.done.has(day);

    if (!commit((current) => toggleDay(current, t.habit.id, day))) {
      toast.error(SAVE_ERROR);
      return;
    }

    // Celebrate only a real completion of *today*, not back-filled days.
    if (!completing || day !== now) return;

    const streak = currentStreak(new Set(t.done).add(day), now);
    const allDone = tracked.every(
      (o) => o.habit.id === t.habit.id || o.done.has(now)
    );
    const milestone = STREAK_MILESTONES.includes(streak)
      ? `سلسلة ${streak} يوم على «${t.habit.name}»`
      : undefined;

    if (allDone) {
      toast.success("يوم مثالي! أنجزت كل عاداتك اليوم", {
        description: milestone,
      });
    } else if (milestone) {
      toast.success(milestone, { description: "استمر، أنت تبني عادة حقيقية" });
    }
  }

  return (
    <div dir="rtl" className="flex w-full flex-col gap-4 pb-4">
      <div className="flex w-full items-center justify-between">
        <Heading level={3} className="">
          العادات
        </Heading>
        <Button onClick={() => openAdd()} disabled={atLimit}>
          <Plus /> إضافة عادة
        </Button>
      </div>

      {tracked.length === 0 ? (
        <div className="flex w-full flex-col items-center gap-4 rounded-xl border border-dashed p-8 text-center">
          <CalendarCheck className="size-10 text-muted-foreground" />
          <div className="flex flex-col gap-1">
            <p className="font-medium">لا توجد عادات بعد</p>
            <p className="text-sm text-muted-foreground">
              ابدأ بعادة صغيرة واحدة، والاستمرارية تصنع الباقي
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((name) => (
              <Button
                key={name}
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => openAdd(name)}
              >
                {name}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <HabitsSummary tracked={tracked} today={today} />

          <section className="flex w-full flex-col gap-3">
            <div className="flex items-baseline justify-between gap-2">
              <Heading level={4} className="">
                اليوم
              </Heading>
              <span className="text-xs text-muted-foreground">
                {formatFullDate(today)}
              </span>
            </div>
            <TodayChecklist
              tracked={tracked}
              today={today}
              onToggle={handleToggle}
            />
          </section>

          <section className="flex w-full flex-col gap-3">
            <Heading level={4} className="">
              التقويم
            </Heading>
            <HabitCalendar
              tracked={tracked}
              today={today}
              onToggle={handleToggle}
            />
          </section>

          <section className="flex w-full flex-col gap-3">
            <Heading level={4} className="">
              إحصائيات العادات
            </Heading>
            <ul className="grid w-full gap-3 lg:grid-cols-2">
              {tracked.map((t) => (
                <HabitStatsCard
                  key={t.habit.id}
                  tracked={t}
                  today={today}
                  onEdit={() => openEdit(t.habit)}
                  onDelete={() => openDelete(t.habit)}
                />
              ))}
            </ul>
          </section>
        </>
      )}

      <HabitForm
        open={formOpen}
        onOpenChange={setFormOpen}
        habit={editing}
        suggestedName={formTarget.suggestedName}
        onSubmit={handleSubmit}
      />
      <DeleteHabitDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        habit={deleteTarget}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default HabitTracker;
