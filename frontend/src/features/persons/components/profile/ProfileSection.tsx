import { ReactNode } from 'react';
import type { FieldSource } from '../../types';

interface ProfileSectionProps {
  title: string;
  description?: string;
  source?: FieldSource | null;
  empty?: boolean;
  emptyMessage?: string;
  children?: ReactNode;
  actions?: ReactNode;
}

export function ProfileSection({
  title,
  description,
  source,
  empty,
  emptyMessage = 'Aún no se ha cargado un documento que aporte estos datos.',
  children,
  actions,
}: ProfileSectionProps) {
  return (
    <section
      aria-label={title}
      className="bg-white border border-stone-200 rounded-xl p-4 md:p-5"
    >
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm md:text-base font-semibold text-stone-900">{title}</h3>
          {description && (
            <p className="text-xs text-stone-500 mt-0.5">{description}</p>
          )}
          {source && (
            <p className="text-[11px] text-stone-400 mt-1">
              Datos extraídos de {source.documentName}.
            </p>
          )}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </header>

      {empty ? (
        <p className="text-sm text-stone-400 italic">{emptyMessage}</p>
      ) : (
        children
      )}
    </section>
  );
}
