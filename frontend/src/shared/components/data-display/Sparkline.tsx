import { cn } from '@/shared/lib/cn';

export type SparklineVariant = 'line' | 'bar';

export interface SparklineProps {
  data: number[];
  variant?: SparklineVariant;
  /** CSS color (token o hex). Default: var(--color-chart-1). */
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  ariaLabel?: string;
  /** Anima el mount una sola vez. Default: true. Reduced-motion lo anula via globals. */
  animate?: boolean;
}

/**
 * SVG-inline sparkline. Sin librería externa.
 * - `line`: polyline simple.
 * - `bar`: una barra por dato, scaleY 0→1 con stagger 30ms.
 * Si no hay al menos 2 puntos, no renderiza nada (no inventa una serie).
 */
export function Sparkline({
  data,
  variant = 'line',
  color = 'var(--color-chart-1)',
  width = 72,
  height = 24,
  className,
  ariaLabel = 'tendencia',
  animate = true,
}: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data, 0);
  const max = Math.max(...data);
  const range = max - min || 1;

  if (variant === 'bar') {
    const gap = 1;
    const barWidth = Math.max(1, (width - gap * (data.length - 1)) / data.length);
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={ariaLabel}
        className={cn('overflow-visible', className)}
        preserveAspectRatio="none"
      >
        {data.map((value, i) => {
          const norm = (value - min) / range;
          const h = Math.max(1.5, norm * height);
          const x = i * (barWidth + gap);
          const y = height - h;
          const style = animate
            ? {
                transformOrigin: `${x + barWidth / 2}px ${height}px`,
                transformBox: 'view-box' as const,
                animation: `barRise 250ms ease-out ${i * 30}ms both`,
              }
            : undefined;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={h}
              rx={1}
              fill={color}
              style={style}
            />
          );
        })}
      </svg>
    );
  }

  const stepX = data.length > 1 ? width / (data.length - 1) : width;
  const points = data
    .map((value, i) => {
      const x = i * stepX;
      const y = height - ((value - min) / range) * height;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      className={cn('overflow-visible', className)}
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

Sparkline.displayName = 'Sparkline';
