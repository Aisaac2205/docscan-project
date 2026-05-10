import React from 'react';
import type {
  RenderedField, PrimitiveField, ListField, ObjectField, ArrayField,
} from '../types/extracted-field.types';

interface ExtractedFieldsPanelProps {
  fields: RenderedField[];
}

export function ExtractedFieldsPanel({ fields }: ExtractedFieldsPanelProps) {
  return (
    <div className="space-y-8">
      {fields.map((rendered) => (
        <FieldDispatch key={rendered.key} rendered={rendered} />
      ))}
    </div>
  );
}

// ─── Leaf components ──────────────────────────────────────────────────────────

function DataFieldView({ label, field }: { label: string; field: PrimitiveField }) {
  const isVeryLong = field.value.length > 400;

  return (
    <div>
      <p className="text-overline text-overline-uppercase text-fg-tertiary mb-1.5">
        {label}
      </p>
      <p className={`text-body text-fg-primary whitespace-pre-wrap break-words leading-relaxed bg-surface-sunken rounded-md px-3.5 py-2.5 ${isVeryLong ? 'max-h-60 overflow-y-auto' : ''}`}>
        {field.value}
      </p>
    </div>
  );
}

function ListFieldView({ label, field }: { label: string; field: ListField }) {
  const isLongList = field.items.length > 3 || field.items.join('').length > 100;

  return (
    <div>
      <p className="text-overline text-overline-uppercase text-fg-tertiary mb-2">
        {label}
      </p>
      {isLongList ? (
        <div className="bg-surface-sunken rounded-md px-3.5 py-3 space-y-1.5">
          {field.items.map((item, i) => (
            <div key={i} className="flex gap-2 text-body text-fg-primary leading-relaxed">
              <span className="text-fg-tertiary flex-shrink-0 select-none mt-0.5">•</span>
              <span className="break-words">{item}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-body text-fg-primary bg-surface-sunken rounded-md px-3.5 py-2.5">
          {field.items.join(', ')}
        </p>
      )}
    </div>
  );
}

// ─── Section components ───────────────────────────────────────────────────────

function ObjectSectionView({ label, field }: { label: string; field: ObjectField }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <p className="text-overline text-overline-uppercase text-fg-secondary whitespace-nowrap">
          {label}
        </p>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="space-y-5 pl-2 lg:pl-4 border-l-2 border-border-subtle">
        {field.fields.map((nested) => (
          <FieldDispatch key={nested.key} rendered={nested} />
        ))}
      </div>
    </div>
  );
}

function ArraySectionView({ label, field }: { label: string; field: ArrayField }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <p className="text-overline text-overline-uppercase text-fg-secondary whitespace-nowrap">
          {label}
        </p>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="space-y-6">
        {field.rows.map((row, i) => (
          <div key={i} className="pl-2 lg:pl-4 border-l-2 border-border-subtle">
            <p className="text-overline text-overline-uppercase text-fg-tertiary mb-3">
              Ítem {i + 1}
            </p>
            <div className="space-y-5">
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
