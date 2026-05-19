import { cn } from '@/shared/lib/cn';

interface PdfIconProps {
  size?: number;
  className?: string;
}

/**
 * Ícono PDF propio. Fill --color-fg-secondary sobre cualquier surface —
 * intencionalmente NO rojo Adobe. Pensado para usarse dentro de un
 * cuadrado con bg --color-surface-card-hover.
 */
export function PdfIcon({ size = 20, className }: PdfIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={cn('text-fg-secondary', className)}
    >
      <path
        d="M4.5 2.5h7L15.5 6.5V17a.5.5 0 0 1-.5.5H4.5a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M11.5 2.5V6.5h4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <text
        x="10"
        y="14"
        textAnchor="middle"
        fontFamily="ui-sans-serif, system-ui"
        fontSize="4.5"
        fontWeight="600"
        fill="currentColor"
      >
        PDF
      </text>
    </svg>
  );
}
