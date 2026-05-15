'use client';

import type { SparklineSeries } from '../api/dashboardApi';

interface MiniSparklineProps {
  /** 7 raw data points — oldest to newest (left to right) */
  readonly values: SparklineSeries;
  readonly label?: string;
}

const BAR_COUNT = 7;
const HEIGHT = 28;
const GAP = 2;

/**
 * MiniSparkline — pure inline SVG, no chart library.
 *
 * Renders 7 bars scaled to the max value in the array.
 * - Most recent bar (index 6): `var(--color-chart-1)` (brand-500)
 * - Previous bars (index 0-5): `var(--color-chart-6-muted)` (brand-200 muted)
 *
 * Intentionally has no axes, labels, tooltips, or legends.
 */
export function MiniSparkline({ values, label }: MiniSparklineProps) {
  const max = Math.max(...values, 1); // avoid division by zero

  // Compute bar width dynamically based on available space
  // We use a fixed viewBox and let SVG scale naturally.
  const totalWidth = 100;
  const barWidth = (totalWidth - GAP * (BAR_COUNT - 1)) / BAR_COUNT;

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${HEIGHT}`}
      aria-label={label ?? 'Tendencia 7 días'}
      role="img"
      style={{ width: '100%', height: `${HEIGHT}px`, display: 'block' }}
      preserveAspectRatio="none"
    >
      {values.map((val, i) => {
        const barHeight = Math.max((val / max) * HEIGHT, 2); // min 2px so bar is always visible
        const x = i * (barWidth + GAP);
        const y = HEIGHT - barHeight;
        const isLatest = i === BAR_COUNT - 1;

        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            rx={1.5}
            fill={
              isLatest
                ? 'var(--color-chart-1)'
                : 'var(--color-chart-6-muted)'
            }
          />
        );
      })}
    </svg>
  );
}
