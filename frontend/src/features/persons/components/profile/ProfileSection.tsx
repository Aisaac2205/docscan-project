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
      className="bg-surface-card border border-border rounded-md p-4 md:p-5"
    >
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-h4 text-fg-primary">{title}</h3>
          {description && (
            <p className="text-caption text-fg-secondary mt-0.5">{description}</p>
          )}
          {source && (
            <p className="text-overline text-fg-tertiary mt-1">
              Datos extraídos de {source.documentName}.
            </p>
          )}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </header>

      {empty ? (
        <p className="text-body-sm text-fg-tertiary italic">{emptyMessage}</p>
      ) : (
        children
      )}
    </section>
  );
}
