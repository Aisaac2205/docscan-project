'use client';

import { useState } from 'react';
import { documentsAssignApi } from '../../api/personsApi';
import type { BackgroundData, BackgroundSection, BackgroundTipoEmisor } from '../../types';
import { ProfileSection } from './ProfileSection';
import { ProfileField } from './ProfileField';

interface BackgroundPanelProps {
  data: BackgroundSection;
  onClassified?: () => void | Promise<void>;
}

export function BackgroundPanel({ data, onClassified }: BackgroundPanelProps) {
  return (
    <div className="space-y-4">
      <SingleBackgroundCard
        title="Antecedentes Penales"
        description="Documento emitido por el Organismo Judicial."
        data={data.penal}
      />
      <SingleBackgroundCard
        title="Antecedentes Policíacos"
        description="Documento emitido por la Policía Nacional Civil."
        data={data.policial}
      />
      {data.unclassified.length > 0 && (
        <UnclassifiedList items={data.unclassified} onClassified={onClassified} />
      )}
    </div>
  );
}

function SingleBackgroundCard({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: BackgroundData | null;
}) {
  return (
    <ProfileSection
      title={title}
      description={description}
      source={data?._source ?? null}
      empty={!data}
    >
      {data && (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <ProfileField label="Nombre completo" value={data.nombre_completo} />
          <ProfileField label="CUI / DPI" value={data.cui_dpi} />
          <ProfileField label="¿Tiene antecedentes?" value={data.tiene_antecedentes} />
          <ProfileField label="Delito indicado" value={data.delito_indicado} />
          <ProfileField label="Fecha de emisión" value={data.fecha_emision} />
          <ProfileField label="Boleta / Recibo" value={data.numero_boleta_o_recibo} />
          <ProfileField label="Código de validación" value={data.codigo_validacion} />
        </dl>
      )}
    </ProfileSection>
  );
}

function UnclassifiedList({
  items,
  onClassified,
}: {
  items: BackgroundData[];
  onClassified?: () => void | Promise<void>;
}) {
  return (
    <section
      aria-label="Antecedentes sin clasificar"
      className="bg-warning-bg border border-warning-border border-dashed rounded-md p-4"
    >
      <p className="text-body-sm text-warning-fg font-medium mb-1">
        {items.length === 1
          ? 'Hay 1 documento de antecedentes sin clasificar.'
          : `Hay ${items.length} documentos de antecedentes sin clasificar.`}
      </p>
      <p className="text-caption text-fg-secondary mb-3">
        El sistema no pudo determinar el emisor. Indicá si corresponde a antecedentes penales o policíacos.
      </p>
      <ul className="space-y-2">
        {items.map((bg) => (
          <UnclassifiedItem
            key={bg._source.documentId}
            item={bg}
            onClassified={onClassified}
          />
        ))}
      </ul>
    </section>
  );
}

function UnclassifiedItem({
  item,
  onClassified,
}: {
  item: BackgroundData;
  onClassified?: () => void | Promise<void>;
}) {
  const [submitting, setSubmitting] = useState<BackgroundTipoEmisor | null>(null);
  const [error, setError] = useState<string | null>(null);

  const classify = async (tipo: BackgroundTipoEmisor) => {
    setSubmitting(tipo);
    setError(null);
    try {
      await documentsAssignApi.classifyBackground(item._source.documentId, tipo);
      await onClassified?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo clasificar el documento.');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <li className="bg-surface-card border border-border rounded-md p-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="min-w-0">
          <p className="text-body-sm text-fg-primary truncate">{item._source.documentName}</p>
          {item.fecha_emision && (
            <p className="text-caption text-fg-tertiary">Emitido: {item.fecha_emision}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={submitting !== null}
            onClick={() => classify('penal')}
            className="px-3 py-1.5 text-button-sm rounded-md border border-border bg-surface-card text-fg-primary hover:border-border-strong disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
          >
            {submitting === 'penal' ? 'Clasificando...' : 'Es Penal'}
          </button>
          <button
            type="button"
            disabled={submitting !== null}
            onClick={() => classify('policial')}
            className="px-3 py-1.5 text-button-sm rounded-md border border-border bg-surface-card text-fg-primary hover:border-border-strong disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
          >
            {submitting === 'policial' ? 'Clasificando...' : 'Es Policíaco'}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-caption text-danger-fg">
          {error}
        </p>
      )}
    </li>
  );
}
