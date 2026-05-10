'use client';

import { useState } from 'react';
import { useDocumentStore } from '../store';
import { AssignPersonModal } from './AssignPersonModal';

interface AssignPersonButtonProps {
  documentId: string;
  documentName?: string;
  currentPersonId: string | null;
  currentPersonName?: string | null;
  compact?: boolean;
  onAssigned?: (personId: string | null) => void;
}

export function AssignPersonButton({
  documentId,
  documentName,
  currentPersonId,
  currentPersonName,
  compact = false,
  onAssigned,
}: AssignPersonButtonProps) {
  const { assignToPerson } = useDocumentStore();
  const [open, setOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(true);
  };

  const triggerClass = `inline-flex items-center gap-1.5 ${compact ? 'text-caption' : 'text-body-sm'} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] rounded-sm`;

  const trigger = currentPersonId && currentPersonName ? (
    <button
      type="button"
      onClick={handleClick}
      className={`${triggerClass} text-fg-secondary hover:text-fg-primary underline-offset-2 hover:underline`}
      aria-label={`Cambiar persona asignada (actual: ${currentPersonName})`}
    >
      <PersonIcon />
      <span className="truncate max-w-[160px]">{currentPersonName}</span>
    </button>
  ) : (
    <button
      type="button"
      onClick={handleClick}
      className={`${triggerClass} text-fg-tertiary hover:text-fg-primary`}
      aria-label="Asignar este documento a una persona"
    >
      <PersonIcon />
      <span>Sin asignar</span>
    </button>
  );

  return (
    <>
      {trigger}
      <AssignPersonModal
        open={open}
        documentName={documentName}
        currentPersonId={currentPersonId}
        onClose={() => setOpen(false)}
        onConfirm={async (personId) => {
          await assignToPerson(documentId, personId);
          onAssigned?.(personId);
        }}
      />
    </>
  );
}

function PersonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 11c0-2 2-3.5 4.5-3.5S11 9 11 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
