import React from 'react';
import type {
  RenderedField, PrimitiveField, ListField, ObjectField, ArrayField,
} from '../types/extracted-field.types';

interface ExtractedFieldsPanelProps {
  fields: RenderedField[];
}

export function ExtractedFieldsPanel({ fields }: ExtractedFieldsPanelProps) {
  return (
    <section className="animate-slide-up">
      <div className="mb-4 px-1">
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-[0.18em]">
          Datos extraídos
        </p>
        <p className="mt-1 text-xs text-stone-500">Salida estructurada de OCR (Gemini)</p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-white overflow-hidden">
        {fields.map((rendered) => (
          <FieldDispatch key={rendered.key} rendered={rendered} />
        ))}
      </div>
    </section>
  );
}

// ─── Leaf components ──────────────────────────────────────────────────────────

function DataFieldView({ label, field }: { label: string; field: PrimitiveField }) {
  const isLong = field.value.length > 80 || field.value.includes('\n');
  const isVeryLong = field.value.length > 400;

  return (
    <div className="px-4 py-3 border-b border-[var(--border)] last:border-b-0">
      <div className={`flex gap-4 ${isLong ? 'flex-col' : 'items-start'}`}>
        <p className="text-[11px] leading-5 font-medium text-stone-500 uppercase tracking-wide min-w-40">
          {label}
        </p>
        <p className={`text-sm text-stone-800 whitespace-pre-wrap break-words leading-relaxed ${isVeryLong ? 'max-h-40 overflow-y-auto pr-1' : ''}`}>
          {field.value}
        </p>
      </div>
    </div>
  );
}

function ListFieldView({ label, field }: { label: string; field: ListField }) {
  const isLongList = field.items.length > 3 || field.items.join('').length > 100;

  return (
    <div className="px-4 py-3 border-b border-[var(--border)] last:border-b-0">
      <p className="text-[11px] font-medium text-stone-500 uppercase tracking-wide mb-2">{label}</p>
      {isLongList ? (
        <ul className="space-y-1">
          {field.items.map((item, i) => (
            <li key={i} className="text-sm text-stone-800 flex gap-1.5 leading-relaxed">
              <span className="text-stone-300 flex-shrink-0 select-none">•</span>
              <span className="break-words">{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-stone-800 break-words">{field.items.join(', ')}</p>
      )}
    </div>
  );
}

// ─── Section components ───────────────────────────────────────────────────────

function ObjectSectionView({ label, field }: { label: string; field: ObjectField }) {
  return (
    <div className="border-b border-[var(--border)] last:border-b-0">
      <div className="px-4 py-2.5 bg-stone-50/80 border-b border-[var(--border)]">
        <p className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">{label}</p>
      </div>
      <div className="pl-4">
        {field.fields.map((nested) => (
          <FieldDispatch key={nested.key} rendered={nested} />
        ))}
      </div>
    </div>
  );
}

function ArraySectionView({ label, field }: { label: string; field: ArrayField }) {
  return (
    <div className="border-b border-[var(--border)] last:border-b-0">
      <div className="px-4 py-2.5 bg-stone-50/80 border-b border-[var(--border)]">
        <p className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider">{label}</p>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {field.rows.map((row, i) => (
          <div key={i} className="py-2.5">
            <p className="px-4 text-[10px] font-medium text-stone-400 uppercase tracking-wider mb-1.5">
              Ítem {i + 1}
            </p>
            <div className="pl-4">
              {row.map((nested) => (
                <FieldDispatch key={nested.key} rendered={nested} />
              ))}
            </div>
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
