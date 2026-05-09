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
        <div className="h-32 rounded-xl bg-stone-100 animate-pulse" />
        <div className="h-48 rounded-xl bg-stone-100 animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div role="alert" className="px-4 py-3 bg-stone-100 border border-stone-300 rounded-xl text-sm text-stone-800">
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
          className="text-sm text-stone-700 hover:text-stone-900 underline disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700 rounded-sm"
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
