import { cn } from "@/lib/utils";

type ProgressBarProps = {
  /** 0–100 */
  value: number;
  /** Fill colour class, e.g. "bg-primary" */
  barClassName: string;
  label: string;
};

const ProgressBar = ({ value, barClassName, label }: ProgressBarProps) => {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className="h-2 w-full overflow-hidden rounded-full bg-muted"
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none",
          barClassName
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};

export default ProgressBar;
