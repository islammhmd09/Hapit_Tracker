type ProgressRingProps = {
  /** 0–100 */
  value: number;
  size?: number;
  label?: string;
};

const STROKE = 5;

// Same ring as the site's PercentCompleted, sized up for the summary. It
// stays on the brand colour while in progress (an empty ring at the start of
// the day shouldn't read as a red failure) and turns green once complete.
const ProgressRing = ({ value, size = 64, label }: ProgressRingProps) => {
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, value));
  const complete = clamped >= 100;

  return (
    <span
      role="img"
      aria-label={label ?? `${clamped}%`}
      className={`relative inline-flex shrink-0 items-center justify-center ${
        complete
          ? "text-green-600 dark:text-green-400"
          : "text-primary dark:text-sidebar-primary"
      }`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          className="stroke-current transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none"
        />
      </svg>

      {/* dir=ltr keeps "50%" from flipping to "%50" inside RTL pages */}
      <span
        dir="ltr"
        className="absolute text-sm leading-none font-semibold tabular-nums"
      >
        {clamped}%
      </span>
    </span>
  );
};

export default ProgressRing;
