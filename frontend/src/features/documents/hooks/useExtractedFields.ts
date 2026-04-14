import { useMemo } from 'react';
import type { FieldValue, RenderedField } from '../types/extracted-field.types';

// ─── Utilidades puras ────────────────────────────────────────────────────────

function formatLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function isNullish(v: unknown): boolean {
  return v === null || v === undefined || v === '';
}

function isPrimitive(v: unknown): v is string | number | boolean {
  return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean';
}

function isArrayOfPrimitives(v: unknown): v is (string | number | boolean)[] {
  return Array.isArray(v) && v.length > 0 && v.every(isPrimitive);
}

function isArrayOfObjects(v: unknown): v is Record<string, unknown>[] {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    v.every((item) => typeof item === 'object' && item !== null && !Array.isArray(item))
  );
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// ─── Clasificación ───────────────────────────────────────────────────────────

function classifyValue(value: unknown): FieldValue | null {
  if (isNullish(value)) return null;

  if (isPrimitive(value)) {
    return { type: 'primitive', value: String(value) };
  }

  if (isArrayOfPrimitives(value)) {
    return { type: 'list', items: value.map(String) };
  }

  if (isArrayOfObjects(value)) {
    const rows = value
      .map((item) => classifyFields(item))
      .filter((row) => row.length > 0);
    return rows.length > 0 ? { type: 'array', rows } : null;
  }

  if (isPlainObject(value)) {
    const fields = classifyFields(value);
    return fields.length > 0 ? { type: 'object', fields } : null;
  }

  // Fallback: tipos inesperados como JSON legible
  return { type: 'primitive', value: JSON.stringify(value) };
}

function classifyFields(obj: Record<string, unknown>): RenderedField[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    // Omitir campos internos (_confidence, _metadata, etc.) y valores vacíos
    if (key.startsWith('_') || isNullish(value)) return [];

    const classified = classifyValue(value);
    if (!classified) return [];

    return [{ key, label: formatLabel(key), value: classified }];
  });
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useExtractedFields(extracted: Record<string, unknown> | null): RenderedField[] {
  return useMemo(() => {
    if (!extracted) return [];
    return classifyFields(extracted);
  }, [extracted]);
}
