'use client';

import { useEffect, useRef, useState } from 'react';
import { personsApi } from '../api/personsApi';
import type { Person } from '../types';

interface PersonPickerProps {
  value: string | null;
  onChange: (personId: string | null, person: Person | null) => void;
  placeholder?: string;
  allowClear?: boolean;
  ariaLabel?: string;
}

export function PersonPicker({
  value,
  onChange,
  placeholder = 'Buscar persona por nombre o CUI...',
  allowClear = true,
  ariaLabel = 'Seleccionar persona',
}: PersonPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [persons, setPersons] = useState<Person[]>([]);
  const [selected, setSelected] = useState<Person | null>(null);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) { setSelected(null); return; }
    if (selected?.id === value) return;
    let cancelled = false;
    personsApi.getOne(value).then((p) => { if (!cancelled) setSelected(p); }).catch(() => {});
    return () => { cancelled = true; };
  }, [value, selected?.id]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const data = await personsApi.list({
          q: query.trim() || undefined,
          pageSize: 20,
        });
        setPersons(data.items);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [query, open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = (p: Person) => {
    setSelected(p);
    onChange(p.id, p);
    setOpen(false);
    setQuery('');
  };

  const handleClear = () => {
    setSelected(null);
    onChange(null, null);
    setQuery('');
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-2 h-10 px-3 rounded-md border border-border bg-surface-card text-body-sm text-left focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]"
      >
        <span className={selected ? 'text-fg-primary' : 'text-fg-tertiary'}>
          {selected ? selected.fullName : 'Sin asignar'}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="text-fg-tertiary">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-30 mt-1 w-full bg-surface-card border border-border rounded-md shadow-sm overflow-hidden"
        >
          <div className="p-2 border-b border-border-subtle">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full h-9 px-2 text-body-sm rounded-md bg-surface-sunken border border-border text-fg-primary placeholder:text-fg-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <p className="px-3 py-3 text-caption text-fg-tertiary">Buscando...</p>
            ) : persons.length === 0 ? (
              <p className="px-3 py-3 text-caption text-fg-tertiary">Sin resultados.</p>
            ) : (
              <ul>
                {persons.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected?.id === p.id}
                      onClick={() => handleSelect(p)}
                      className="w-full text-left px-3 py-2 text-body-sm hover:bg-surface-sunken focus-visible:bg-surface-sunken focus-visible:outline-none"
                    >
                      <p className="text-fg-primary font-medium">{p.fullName}</p>
                      {p.cui && (
                        <p className="text-caption text-fg-tertiary font-mono">{p.cui}</p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {allowClear && selected && (
            <div className="border-t border-border-subtle p-2">
              <button
                type="button"
                onClick={handleClear}
                className="w-full text-left px-2 py-1.5 text-caption text-fg-tertiary hover:text-fg-primary rounded-md hover:bg-surface-sunken"
              >
                Quitar asignación
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
