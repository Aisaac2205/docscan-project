'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Search, UserCircle, UserPlus, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { usePersons } from '@/features/persons/hooks/usePersons';
import { useAssignHealthPerson } from '../hooks/useAssignHealthPerson';
import { usePersonSuggestions } from '../hooks/usePersonSuggestions';
import type { HealthRecord, PersonSuggestion } from '../types';

interface HealthEmployeeSectionProps {
  record: HealthRecord;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function initialOf(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

function scoreToTone(score: number): string {
  // 90+  → success (confianza alta)
  // 70-89 → info (probable)
  // 40-69 → warning (revisá manual)
  if (score >= 90) return 'text-success-fg bg-success-bg border-success-border';
  if (score >= 70) return 'text-info-fg bg-info-bg border-info-border';
  return 'text-warning-fg bg-warning-bg border-warning-border';
}

function buildPrefillUrl(record: HealthRecord): string {
  const params = new URLSearchParams({ from: 'health-record', recordId: record.id });
  if (record.nombre_paciente) params.set('fullName', record.nombre_paciente);
  return `/persons?${params.toString()}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// LinkedView — constancia ya vinculada
// ─────────────────────────────────────────────────────────────────────────────

function LinkedView({
  record,
  onUnlink,
  busy,
}: {
  record: HealthRecord;
  onUnlink: () => void;
  busy: boolean;
}) {
  const name = record.personName ?? '—';
  return (
    <div className="rounded-lg border border-border bg-surface-card p-4 flex items-center gap-3">
      <span
        aria-hidden="true"
        className="w-10 h-10 rounded-full bg-surface-sunken text-fg-secondary font-medium flex items-center justify-center shrink-0"
      >
        {initialOf(name)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-medium text-fg-primary truncate">{name}</p>
        {record.personId && (
          <Link
            href={`/persons/${record.personId}`}
            className="inline-flex items-center gap-1 text-caption text-fg-link hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] rounded-sm"
          >
            Ver perfil del empleado
            <ExternalLink width={11} height={11} aria-hidden="true" />
          </Link>
        )}
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={onUnlink}
        className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-caption text-fg-tertiary hover:text-fg-secondary hover:bg-surface-sunken disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
        aria-label="Cambiar empleado vinculado"
      >
        <X width={12} height={12} aria-hidden="true" />
        Cambiar
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SuggestionRow — fila individual de sugerencia OCR
// ─────────────────────────────────────────────────────────────────────────────

function SuggestionRow({
  suggestion,
  index,
  onSelect,
  busy,
}: {
  suggestion: PersonSuggestion;
  index: number;
  onSelect: (id: string) => void;
  busy: boolean;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => onSelect(suggestion.id)}
      style={{ animation: `fadeSlideUp 240ms ease-out ${index * 30}ms both` }}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-md border border-border bg-surface-card',
        'text-left hover:bg-surface-card-hover hover:border-border-strong transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]',
      )}
    >
      <span
        aria-hidden="true"
        className="w-8 h-8 rounded-full bg-surface-sunken text-fg-secondary text-caption font-medium flex items-center justify-center shrink-0"
      >
        {initialOf(suggestion.fullName)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-body-sm text-fg-primary truncate">{suggestion.fullName}</p>
        {suggestion.ocrMatchedText && suggestion.ocrMatchedText !== suggestion.fullName && (
          <p className="text-caption text-fg-tertiary truncate">
            OCR: {suggestion.ocrMatchedText}
          </p>
        )}
      </div>
      <span
        className={cn(
          'inline-flex items-center text-caption font-medium px-2 py-0.5 rounded-full border shrink-0',
          scoreToTone(suggestion.score),
        )}
        aria-label={`${suggestion.score} por ciento de coincidencia`}
      >
        {suggestion.score}%
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SearchCombobox — búsqueda manual contra /persons
// ─────────────────────────────────────────────────────────────────────────────

function SearchCombobox({
  onSelect,
  busy,
  excludeId,
}: {
  onSelect: (id: string) => void;
  busy: boolean;
  excludeId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const inputId = useId();
  const listId = useId();
  const { persons, loading, setQuery, query } = usePersons({ pageSize: 8 });

  const results = useMemo(
    () => persons.filter((p) => p.id !== excludeId),
    [persons, excludeId],
  );
  const showList = open && query.trim().length > 0;

  return (
    <div className="relative">
      <label htmlFor={inputId} className="block text-overline text-overline-uppercase text-fg-tertiary mb-1">
        Buscar empleado en nómina
      </label>
      <div className="relative">
        <Search
          width={14}
          height={14}
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-tertiary pointer-events-none"
        />
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          placeholder="Nombre o CUI…"
          value={query}
          disabled={busy}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-surface-card text-body-sm text-fg-primary placeholder:text-fg-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)] disabled:opacity-50"
        />
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-10 mt-1 w-full max-h-64 overflow-y-auto rounded-md border border-border bg-surface-elevated shadow-md"
        >
          {loading && (
            <li className="px-3 py-2 text-caption text-fg-tertiary">Buscando…</li>
          )}
          {!loading && results.length === 0 && (
            <li className="px-3 py-2 text-caption text-fg-tertiary">
              Sin resultados. Probá otro nombre o creá un empleado nuevo.
            </li>
          )}
          {results.map((p) => (
            <li key={p.id} role="option" aria-selected={false}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // evita blur antes del click
                  onSelect(p.id);
                  setOpen(false);
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-surface-card-hover focus-visible:bg-surface-card-hover focus-visible:outline-none"
              >
                <span
                  aria-hidden="true"
                  className="w-6 h-6 rounded-full bg-surface-sunken text-fg-secondary text-caption font-medium flex items-center justify-center shrink-0"
                >
                  {initialOf(p.fullName)}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-body-sm text-fg-primary truncate">{p.fullName}</span>
                  {p.cui && (
                    <span className="block text-caption text-fg-tertiary truncate">CUI {p.cui}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UnlinkedView — sin empleado asignado
// ─────────────────────────────────────────────────────────────────────────────

function UnlinkedView({
  record,
  onLink,
  busy,
}: {
  record: HealthRecord;
  onLink: (personId: string) => void;
  busy: boolean;
}) {
  const { suggestions, loading } = usePersonSuggestions(record.id, true);
  const liveId = useId();

  return (
    <div className="rounded-lg border border-border border-l-2 border-l-accent-500 bg-surface-card p-4 space-y-4">
      <header className="flex items-start gap-2">
        <UserCircle width={18} height={18} aria-hidden="true" className="text-accent-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-body-sm font-medium text-fg-primary">Sin empleado asignado</p>
          <p className="text-caption text-fg-tertiary">
            Vinculá esta constancia antes de validarla.
          </p>
        </div>
      </header>

      {/* Sugerencias OCR */}
      {(loading || suggestions.length > 0) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-overline text-overline-uppercase text-fg-tertiary">
              Sugerencias del OCR
            </span>
            <span id={liveId} aria-live="polite" className="sr-only">
              {loading
                ? 'Buscando sugerencias'
                : `${suggestions.length} sugerencias encontradas`}
            </span>
          </div>
          {loading && (
            <div className="rounded-md border border-border bg-surface-card px-3 py-2 text-caption text-fg-tertiary">
              Buscando coincidencias…
            </div>
          )}
          <div className="space-y-1.5">
            {suggestions.map((s, i) => (
              <SuggestionRow
                key={s.id}
                suggestion={s}
                index={i}
                onSelect={onLink}
                busy={busy}
              />
            ))}
          </div>
        </div>
      )}

      {/* Búsqueda manual */}
      <SearchCombobox onSelect={onLink} busy={busy} excludeId={null} />

      {/* Crear empleado prefilled */}
      <div className="pt-1 border-t border-border-subtle">
        <Link
          href={buildPrefillUrl(record)}
          className="inline-flex items-center gap-1.5 text-caption text-fg-secondary hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] rounded-sm"
        >
          <UserPlus width={12} height={12} aria-hidden="true" />
          ¿No es nadie de la nómina? Crear empleado nuevo
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root — composición linked/unlinked + manejo de mutación
// ─────────────────────────────────────────────────────────────────────────────

export function HealthEmployeeSection({ record }: HealthEmployeeSectionProps) {
  const assign = useAssignHealthPerson();
  const [forceUnlinkedView, setForceUnlinkedView] = useState(false);

  // Reset "cambiar" mode cuando cambia el record (ej: navegás a otro drawer).
  useEffect(() => {
    setForceUnlinkedView(false);
  }, [record.id]);

  const handleLink = async (personId: string) => {
    await assign.mutateAsync({ recordId: record.id, personId });
    setForceUnlinkedView(false);
  };

  const handleUnlink = () => {
    setForceUnlinkedView(true);
  };

  const showLinked = record.personId !== null && !forceUnlinkedView;
  const busy = assign.isPending;

  return (
    <section aria-label="Empleado vinculado" className="space-y-2">
      {showLinked ? (
        <LinkedView record={record} onUnlink={handleUnlink} busy={busy} />
      ) : (
        <UnlinkedView record={record} onLink={handleLink} busy={busy} />
      )}

      {assign.error && (
        <div
          role="alert"
          className="px-3 py-2 bg-danger-bg border border-danger-border rounded-md text-caption text-danger-fg"
        >
          {assign.error.message}
        </div>
      )}
    </section>
  );
}
