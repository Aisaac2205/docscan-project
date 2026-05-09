'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { personsApi } from '@/features/persons/api/personsApi';
import type { Person } from '@/features/persons/types';

interface AssignPersonModalProps {
  open: boolean;
  documentName?: string;
  currentPersonId: string | null;
  onClose: () => void;
  onConfirm: (personId: string | null) => Promise<void>;
}

export function AssignPersonModal({
  open,
  documentName,
  currentPersonId,
  onClose,
  onConfirm,
}: AssignPersonModalProps) {
  const [query, setQuery] = useState('');
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search input on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Search debounced
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const data = await personsApi.list({ q: query.trim() || undefined });
        setPersons(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudieron cargar las personas');
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [open, query]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleSelect = async (personId: string | null) => {
    setBusy(true);
    setError(null);
    try {
      await onConfirm(personId);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;
  if (typeof window === 'undefined') return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-person-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <header className="px-5 py-4 border-b border-stone-100">
          <p className="text-xs uppercase tracking-wider font-semibold text-stone-400 mb-0.5">
            Asignar a una persona
          </p>
          <h2 id="assign-person-modal-title" className="text-base font-semibold text-stone-900 truncate">
            {documentName ?? 'Documento'}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Buscá por nombre o CUI. Si no existe, creala primero desde la sección Personas.
          </p>
        </header>

        {/* Search */}
        <div className="px-5 py-3 border-b border-stone-100">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar persona..."
            aria-label="Buscar persona"
            className="w-full h-10 px-3 rounded-lg border border-stone-200 bg-white text-sm text-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700"
          />
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div role="alert" className="m-4 px-3 py-2 bg-stone-100 border border-stone-300 rounded-lg text-sm text-stone-800">
              {error}
            </div>
          )}

          {loading ? (
            <div aria-busy="true" className="p-4 space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-stone-100 animate-pulse" />
              ))}
            </div>
          ) : persons.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-stone-400">
              {query.trim() ? 'No se encontraron personas con ese criterio.' : 'Aún no hay personas registradas.'}
            </p>
          ) : (
            <ul role="listbox" aria-label="Lista de personas">
              {persons.map((p) => {
                const isCurrent = p.id === currentPersonId;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isCurrent}
                      disabled={busy}
                      onClick={() => handleSelect(p.id)}
                      className="w-full text-left px-5 py-3 hover:bg-stone-50 focus-visible:bg-stone-50 focus-visible:outline-none border-b border-stone-100 last:border-b-0 disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-stone-900 truncate">{p.fullName}</p>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {p.cui ? <span className="font-mono">{p.cui}</span> : 'Sin CUI registrado'}
                            {p.email && <span className="ml-2">{p.email}</span>}
                          </p>
                        </div>
                        {isCurrent && (
                          <span className="flex-shrink-0 text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                            Actual
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between px-5 py-3 border-t border-stone-100 bg-stone-50">
          {currentPersonId ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => handleSelect(null)}
              className="text-xs text-stone-600 hover:text-stone-900 underline disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700 rounded-sm"
            >
              Quitar asignación actual
            </button>
          ) : <span />}
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-stone-700 hover:text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700 rounded-sm"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
