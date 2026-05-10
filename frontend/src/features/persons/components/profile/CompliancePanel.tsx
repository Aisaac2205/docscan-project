'use client';

import { useCompliance } from '@/features/compliance/hooks/useCompliance';
import { ValidationSummary } from '@/features/compliance/components/ValidationSummary';
import { ValidationList } from '@/features/compliance/components/ValidationList';

interface CompliancePanelProps {
  personId: string;
}

export function CompliancePanel({ personId }: CompliancePanelProps) {
  const { data, loading, revalidating, error, revalidate } = useCompliance(personId);

  if (loading && !data) {
    return (
      <div aria-busy="true" className="space-y-4">
        <div className="h-32 rounded-md bg-surface-sunken animate-pulse" />
        <div className="h-48 rounded-md bg-surface-sunken animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div role="alert" className="px-4 py-3 bg-danger-bg border border-danger-border rounded-md text-body-sm text-danger-fg">
        {error ?? 'No se pudo cargar la verificación.'}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
        <button
          onClick={revalidate}
          disabled={revalidating}
          className="text-body-sm text-fg-link hover:underline disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] rounded-sm"
        >
          {revalidating ? 'Verificando...' : 'Re-verificar'}
        </button>
      </div>

      <ValidationSummary
        validations={data.validations}
        totalDocs={data.summary.pass + data.summary.warning + data.summary.fail}
      />

      <ValidationList validations={data.validations} />
    </div>
  );
}
