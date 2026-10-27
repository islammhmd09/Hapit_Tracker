"use client";

import { Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { Habit } from "./types";

type DeleteHabitDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: Habit | null;
  onConfirm: (habit: Habit) => void;
};

const DeleteHabitDialog = ({
  open,
  onOpenChange,
  habit,
  onConfirm,
}: DeleteHabitDialogProps) => {
  const days = habit?.doneDates.length ?? 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm" dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>حذف العادة؟</AlertDialogTitle>
          <AlertDialogDescription>
            {habit && days > 0
              ? `سيتم حذف «${habit.name}» وسجلّ ${days} يوم نهائيًا، ولا يمكن استعادته.`
              : `سيتم حذف «${habit?.name ?? ""}» نهائيًا.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">إلغاء</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="cursor-pointer"
            onClick={() => habit && onConfirm(habit)}
          >
            <Trash2 /> حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteHabitDialog;
