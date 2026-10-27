"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import {
  DEFAULT_HABIT_COLOR,
  HABIT_COLOR_KEYS,
  HABIT_COLORS,
  type HabitColor,
} from "./colors";
import { MAX_NAME_LENGTH } from "./model";
import type { Habit, HabitInput } from "./types";

type HabitFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Habit being edited. Omit to create a new one. */
  habit?: Habit;
  /** Pre-filled name for a new habit (empty-state suggestions). */
  suggestedName?: string;
  onSubmit: (input: HabitInput) => void;
};

type BodyProps = Pick<HabitFormProps, "habit" | "suggestedName" | "onSubmit">;

// Rendered only while the sheet is open, so its state starts fresh each time.
const HabitFormBody = ({ habit, suggestedName, onSubmit }: BodyProps) => {
  const [name, setName] = useState(habit?.name ?? suggestedName ?? "");
  const [color, setColor] = useState<HabitColor>(
    habit?.color ?? DEFAULT_HABIT_COLOR
  );
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("اكتب اسم العادة");
      return;
    }
    onSubmit({ name: trimmed, color });
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-col gap-5 px-4 pb-6"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="habit-name" className="text-sm font-semibold">
          اسم العادة
        </Label>
        <Input
          id="habit-name"
          dir="auto"
          value={name}
          maxLength={MAX_NAME_LENGTH}
          placeholder="مثال: قراءة 10 صفحات"
          aria-invalid={error ? true : undefined}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setName(event.target.value);
            if (error) setError(null);
          }}
        />
        {error && (
          <span className="text-sm text-red-500" dir="auto">
            {error}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-sm font-semibold">اللون</Label>
        <div role="radiogroup" aria-label="اللون" className="flex flex-wrap gap-3">
          {HABIT_COLOR_KEYS.map((key) => {
            const palette = HABIT_COLORS[key];
            const selected = key === color;
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={palette.label}
                title={palette.label}
                onClick={() => setColor(key)}
                className={cn(
                  "flex size-9 items-center justify-center rounded-full transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none",
                  palette.solid,
                  selected
                    ? "ring-2 ring-foreground ring-offset-2 ring-offset-popover"
                    : "opacity-70 hover:opacity-100"
                )}
              >
                {selected && <Check className="size-4" />}
              </button>
            );
          })}
        </div>
      </div>

      <Button type="submit" size="lg">
        {habit ? "حفظ التعديلات" : "إضافة"}
      </Button>
    </form>
  );
};

const HabitForm = ({
  open,
  onOpenChange,
  habit,
  suggestedName,
  onSubmit,
}: HabitFormProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent
      side="bottom"
      dir="rtl"
      className="mx-auto max-w-lg rounded-t-xl"
    >
      <SheetHeader>
        <SheetTitle>{habit ? "تعديل العادة" : "عادة جديدة"}</SheetTitle>
        <SheetDescription>اختر اسمًا ولونًا يسهّل عليك تمييزها.</SheetDescription>
      </SheetHeader>
      <HabitFormBody
        habit={habit}
        suggestedName={suggestedName}
        onSubmit={onSubmit}
      />
    </SheetContent>
  </Sheet>
);

export default HabitForm;
