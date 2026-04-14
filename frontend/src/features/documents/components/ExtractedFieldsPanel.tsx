import React from 'react';
import type {
  RenderedField, PrimitiveField, ListField, ObjectField, ArrayField,
} from '../types/extracted-field.types';

interface ExtractedFieldsPanelProps {
  fields: RenderedField[];
}

export function ExtractedFieldsPanel({ fields }: ExtractedFieldsPanelProps) {
  return (
    <div className="border-t border-[var(--border)] px-3 sm:px-4 pb-3 sm:pb-4 pt-3 animate-slide-up">
      <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-2.5">
        Datos extraídos — Gemini OCR
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {fields.map((rendered) => (
          <FieldDispatch key={rendered.key} rendered={rendered} />
        ))}
      </div>
    </div>
  );
}

// ─── Leaf components ──────────────────────────────────────────────────────────

function DataFieldView({ label, field }: { label: string; field: PrimitiveField }) {
  const isLong = field.value.length > 80 || field.value.includes('\n');
  const isVeryLong = field.value.length > 400;

  return (
    <div className={`rounded-md px-3 py-2 border border-[var(--border)] ${isLong ? 'col-span-full' : ''}`}>
      <p className="text-[10px] font-medium text-stone-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-sm text-stone-800 whitespace-pre-wrap break-words leading-relaxed ${!isLong ? 'font-medium' : ''} ${isVeryLong ? 'max-h-40 overflow-y-auto' : ''}`}>
        {field.value}
      </p>
    </div>
  );
}

function ListFieldView({ label, field }: { label: string; field: ListField }) {
  const isLongList = field.items.length > 3 || field.items.join('').length > 100;

  return (
    <div className={`rounded-md px-3 py-2 border border-[var(--border)] ${isLongList ? 'col-span-full' : ''}`}>
      <p className="text-[10px] font-medium text-stone-400 uppercase tracking-wide mb-1">{label}</p>
      {isLongList ? (
        <ul className="space-y-0.5">
          {field.items.map((item, i) => (
            <li key={i} className="text-sm text-stone-800 flex gap-1.5">
              <span className="text-stone-300 flex-shrink-0 select-none">•</span>
              <span className="break-words">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm font-medium text-stone-800 break-words">{field.items.join(', ')}</p>
      )}
    </div>
  );
}

// ─── Section components ───────────────────────────────────────────────────────

function ObjectSectionView({ label, field }: { label: string; field: ObjectField }) {
  return (
    <div className="col-span-full border border-[var(--border)] rounded-md overflow-hidden">
      <div className="px-3 py-1.5 bg-stone-50 border-b border-[var(--border)]">
        <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">{label}</p>
      </div>
      <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {field.fields.map((nested) => (
          <FieldDispatch key={nested.key} rendered={nested} />
        ))}
      </div>
    </div>
  );
}

function ArraySectionView({ label, field }: { label: string; field: ArrayField }) {
  return (
    <div className="col-span-full border border-[var(--border)] rounded-md overflow-hidden">
      <div className="px-3 py-1.5 bg-stone-50 border-b border-[var(--border)]">
        <p className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">{label}</p>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {field.rows.map((row, i) => (
          <div key={i} className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {row.map((nested) => (
              <FieldDispatch key={nested.key} rendered={nested} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

function FieldDispatch({ rendered }: { rendered: RenderedField }) {
  switch (rendered.value.type) {
    case 'primitive':
      return <DataFieldView label={rendered.label} field={rendered.value} />;
    case 'list':
      return <ListFieldView label={rendered.label} field={rendered.value} />;
    case 'object':
      return <ObjectSectionView label={rendered.label} field={rendered.value} />;
    case 'array':
      return <ArraySectionView label={rendered.label} field={rendered.value} />;
  }
}
