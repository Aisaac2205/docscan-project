'use client';

import Link from 'next/link';
import { Heading } from '@/shared/components/Layout';
import type { Document } from '../types/document.types';
import { AssignPersonButton } from './AssignPersonButton';

interface InboxItemProps {
  doc: Document;
  onAssigned: (id: string) => void;
}

const DOC_TYPE_LABEL: Record<string, string> = {
  id_card: 'DPI / Pasaporte',
  fiscal_social: 'RTU / NIT',
  background_check: 'Antecedentes',
  medical_cert: 'Constancia médica',
  cv: 'Currículum',
  general: 'Documento general',
  custom: 'Personalizado',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'Procesando',
  completed: 'Procesado',
  failed: 'Falló',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getCuiHint(extractedData: Document['extractedData']): string | null {
  if (!extractedData) return null;
  const root = extractedData as Record<string, unknown>;
  const direct = typeof root.cui === 'string' ? root.cui : null;
  if (direct) return direct;
  const ciudadano = root.datos_ciudadano as Record<string, unknown> | undefined;
  const fromBg = typeof ciudadano?.cui_dpi === 'string' ? ciudadano.cui_dpi : null;
  if (fromBg) return fromBg;
  const fromFiscal = typeof root.cui_dpi === 'string' ? root.cui_dpi : null;
  return fromFiscal;
}

function getNameHint(extractedData: Document['extractedData']): string | null {
  if (!extractedData) return null;
  const root = extractedData as Record<string, unknown>;
  if (typeof root.nombre_paciente === 'string') return root.nombre_paciente;
  if (typeof root.nombre_completo === 'string') return root.nombre_completo;
  if (typeof root.nombre_razon_social === 'string') return root.nombre_razon_social;
  const ciudadano = root.datos_ciudadano as Record<string, unknown> | undefined;
  if (typeof ciudadano?.nombre_completo === 'string') return ciudadano.nombre_completo;
  const parts = [
    typeof root.primer_nombre === 'string' ? root.primer_nombre : '',
    typeof root.primer_apellido === 'string' ? root.primer_apellido : '',
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : null;
}

export function InboxItem({ doc, onAssigned }: InboxItemProps) {
  const cuiHint = getCuiHint(doc.extractedData);
  const nameHint = getNameHint(doc.extractedData);
  const docType = DOC_TYPE_LABEL[doc.documentType ?? 'general'] ?? doc.documentType ?? 'Documento';

  return (
    <article className="bg-surface-card border border-border rounded-lg p-4 md:p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <Heading level={4} as="h3" className="text-fg-primary truncate">
            <Link
              href={`/documents/${doc.id}`}
              className="hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] rounded-sm block"
            >
              {doc.originalName}
            </Link>
          </Heading>
          <p className="text-caption text-fg-secondary mt-0.5">
            {docType}
            <span className="mx-1.5 text-fg-tertiary">·</span>
            {formatDate(doc.createdAt)}
            <span className="mx-1.5 text-fg-tertiary">·</span>
            {STATUS_LABEL[doc.status] ?? doc.status}
          </p>
        </div>
      </div>

      {(nameHint || cuiHint) && (
        <div className="bg-surface-sunken border border-border rounded-md px-3 py-2 mb-3">
          <p className="text-overline text-overline-uppercase text-fg-tertiary mb-1">
            Datos detectados en el documento
          </p>
          <div className="text-caption text-fg-secondary space-y-0.5">
            {nameHint && <p>Nombre: <span className="font-medium text-fg-primary">{nameHint}</span></p>}
            {cuiHint && <p>CUI: <span className="font-mono text-fg-primary">{cuiHint}</span></p>}
          </div>
          <p className="text-overline text-fg-tertiary mt-1.5">
            Verificá si corresponde antes de asignar.
          </p>
        </div>
      )}

      <div>
        <p className="text-overline text-overline-uppercase text-fg-tertiary mb-1.5">
          Asignar a
        </p>
        <div className="max-w-sm">
          <AssignPersonButton
            documentId={doc.id}
            documentName={doc.originalName}
            currentPersonId={null}
            onAssigned={(pid) => { if (pid) onAssigned(doc.id); }}
          />
        </div>
      </div>
    </article>
  );
}
