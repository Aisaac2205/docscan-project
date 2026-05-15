'use client';

import { CircleCheck, CircleAlert, Upload, Link2 } from 'lucide-react';
import { Heading } from '@/shared/components/Layout';
import type { RequiredSlot } from '../types';
import { PersonCompletenessRing } from './PersonCompletenessRing';

interface PersonRequiredDocsChecklistProps {
  done: number;
  total: number;
  slots: RequiredSlot[];
  onLinkDocument?: () => void;
  onUploadDocument?: () => void;
}

export function PersonRequiredDocsChecklist({
  done,
  total,
  slots,
  onLinkDocument,
  onUploadDocument,
}: PersonRequiredDocsChecklistProps) {
  const required = slots.filter((s) => s.required);

  return (
    <section
      aria-label="Documentos requeridos"
      className="bg-surface-card border border-border rounded-md p-4 md:p-5"
    >
      <header className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <PersonCompletenessRing done={done} total={total} size={44} strokeWidth={4} />
          <div>
            <Heading level={4} as="h3" className="text-fg-primary">
              Documentos requeridos
            </Heading>
            <p className="text-caption text-fg-secondary mt-0.5">
              {done === total
                ? 'Todos los documentos requeridos están cargados.'
                : `Faltan ${total - done} de ${total}.`}
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {onLinkDocument && (
            <button
              type="button"
              onClick={onLinkDocument}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-button-sm border border-border bg-surface-card text-fg-primary hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
            >
              <Link2 width={14} height={14} aria-hidden="true" />
              Vincular
            </button>
          )}
          {onUploadDocument && (
            <button
              type="button"
              onClick={onUploadDocument}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-button-sm bg-fg-primary text-fg-inverse hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
            >
              <Upload width={14} height={14} aria-hidden="true" />
              Subir
            </button>
          )}
        </div>
      </header>

      <ul className="space-y-1.5">
        {required.map((slot) => (
          <li
            key={slot.id}
            className="flex items-center justify-between gap-3 px-3 py-2 rounded-sm hover:bg-surface-sunken"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {slot.satisfied ? (
                <CircleCheck
                  width={18}
                  height={18}
                  className="text-success-fg flex-shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <CircleAlert
                  width={18}
                  height={18}
                  className="text-fg-disabled flex-shrink-0"
                  aria-hidden="true"
                />
              )}
              <span
                className={
                  slot.satisfied
                    ? 'text-body-sm text-fg-primary truncate'
                    : 'text-body-sm text-fg-secondary truncate'
                }
              >
                {slot.label}
              </span>
            </div>
            <span className="text-caption text-fg-tertiary flex-shrink-0">
              {slot.satisfied ? 'Cargado' : 'Falta'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
