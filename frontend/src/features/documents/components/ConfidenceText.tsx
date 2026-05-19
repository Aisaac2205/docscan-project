import { cn } from '@/shared/lib/cn';
import {
  formatConfidencePercent,
  getConfidenceLevel,
  type ConfidenceLevel,
} from '../utils/getConfidenceLevel';

interface ConfidenceTextProps {
  confidence: number | null | undefined;
  className?: string;
}

const LEVEL_CLASS: Record<ConfidenceLevel, string> = {
  high: 'text-success-fg',
  medium: 'text-warning-fg',
  low: 'text-danger-fg',
  unknown: 'text-fg-tertiary',
};

/**
 * Texto coloreado por umbral. NO es un badge — solo color del texto. El
 * borde 85 coincide con el filtro "Revisión" (medium + low).
 */
export function ConfidenceText({ confidence, className }: ConfidenceTextProps) {
  const level = getConfidenceLevel(confidence);
  const text = formatConfidencePercent(confidence);
  return (
    <span className={cn('font-medium tabular-nums', LEVEL_CLASS[level], className)}>
      {text ?? '—'}
    </span>
  );
}
