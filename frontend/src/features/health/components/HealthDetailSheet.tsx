'use client';

import { Sheet, SheetContent } from '@/shared/components/ui/Sheet';
import type { HealthRecord } from '../types';
import { HealthRecordCard } from './HealthRecordCard';

interface HealthDetailSheetProps {
  record: HealthRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Drawer lateral (md+) / bottom-sheet (mobile) con el detalle editable de una
 * constancia. Sólo presenta data — no hace fetching. El record viene por prop.
 */
export function HealthDetailSheet({ record, open, onOpenChange }: HealthDetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        title={record?.personName ?? record?.nombre_paciente ?? 'Constancia médica'}
        description={record ? `Subida ${new Date(record.createdAt).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })}` : undefined}
        size="md"
      >
        {record && <HealthRecordCard record={record} />}
      </SheetContent>
    </Sheet>
  );
}
