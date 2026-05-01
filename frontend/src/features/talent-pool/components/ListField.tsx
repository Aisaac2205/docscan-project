'use client';

import { useState } from 'react';
import { toast } from '@/shared/ui/toast/store';

function normalizeListItem(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

type ListFieldProps = {
  label: string;
  helper: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
};

export function ListField({ label, helper, value, onChange, placeholder }: ListFieldProps) {
  const [draft, setDraft] = useState('');

  const addDraftItem = () => {
    const cleaned = normalizeListItem(draft);
    if (!cleaned) return;
    if (value.length >= 20) {
      toast.info('Llegaste al máximo de 20 puntos en esta lista.');
      return;
    }
    onChange([...value, cleaned]);
    setDraft('');
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, current) => current !== index));
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold text-stone-700">{label}</label>
      <p className="text-[11px] text-stone-400">{helper}</p>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addDraftItem();
            }
          }}
          placeholder={placeholder}
          className="w-full h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-stone-800 input-focus"
        />
        <button
          type="button"
          onClick={addDraftItem}
          className="h-10 px-3 rounded-lg border border-[var(--border)] bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50"
        >
          Agregar
        </button>
      </div>
      <p className="text-[11px] text-stone-400">Presioná Enter o coma para agregar. No se guardan espacios vacíos.</p>

      {value.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {value.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-stone-50 px-2 py-1.5"
            >
              <span className="text-[12px] text-stone-700 break-words">{item}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(index, -1)}
                  disabled={index === 0}
                  className="h-6 w-6 rounded border border-[var(--border)] bg-white text-[11px] text-stone-600 disabled:opacity-30"
                  title="Subir"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 1)}
                  disabled={index === value.length - 1}
                  className="h-6 w-6 rounded border border-[var(--border)] bg-white text-[11px] text-stone-600 disabled:opacity-30"
                  title="Bajar"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="h-6 px-2 rounded border border-[var(--border)] bg-white text-[11px] text-stone-600 hover:text-rose-600"
                  title="Quitar"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
