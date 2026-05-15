interface PersonCompletenessRingProps {
  done: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

/**
 * SVG progress ring: fills counterclockwise from 0 to done/total.
 * Color uses --color-success-fg when complete, --color-brand-500 while progressing.
 * Track uses --color-surface-sunken so the ring sits softly on cards.
 */
export function PersonCompletenessRing({
  done,
  total,
  size = 36,
  strokeWidth = 4,
  showLabel = true,
}: PersonCompletenessRingProps) {
  const safeTotal = total > 0 ? total : 1;
  const fraction = Math.max(0, Math.min(1, done / safeTotal));
  const complete = done >= total && total > 0;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - fraction);
  const stroke = complete ? 'var(--color-success-fg)' : 'var(--color-brand-500)';

  return (
    <div
      role="img"
      aria-label={`Completitud ${done} de ${total}`}
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-surface-sunken)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 240ms ease-out' }}
        />
      </svg>
      {showLabel && (
        <span className="absolute text-overline text-fg-primary font-medium tabular-nums">
          {done}/{total}
        </span>
      )}
    </div>
  );
}
