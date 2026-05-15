import { User } from 'lucide-react';

interface EmptyDetailStateProps {
  title?: string;
  description?: string;
}

export function EmptyDetailState({
  title = 'Seleccioná una persona',
  description = 'Elegí a alguien de la lista para ver su ficha completa.',
}: EmptyDetailStateProps) {
  return (
    <div
      role="status"
      className="h-full min-h-[20rem] flex flex-col items-center justify-center text-center p-8"
    >
      <User
        aria-hidden="true"
        className="text-fg-disabled mb-4"
        width={48}
        height={48}
        strokeWidth={1.5}
      />
      <p className="text-body-sm text-fg-secondary font-medium">{title}</p>
      <p className="text-caption text-fg-tertiary mt-1 max-w-xs">{description}</p>
    </div>
  );
}
