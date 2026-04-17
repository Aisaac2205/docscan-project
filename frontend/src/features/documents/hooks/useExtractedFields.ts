import { useMemo } from 'react';
import type { FieldValue, RenderedField } from '../types/extracted-field.types';

// ─── Utilidades puras ────────────────────────────────────────────────────────

function formatLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeKey(key: string): string {
  return key
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
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
  const fields = Object.entries(obj).flatMap(([key, value]) => {
    // Omitir campos internos (_confidence, _metadata, etc.) y valores vacíos
    if (key.startsWith('_') || isNullish(value)) return [];

    const classified = classifyValue(value);
    if (!classified) return [];

    return [{ key, label: formatLabel(key), value: classified }];
  });

  return fields.sort((a, b) => {
    const aKey = normalizeKey(a.key);
    const bKey = normalizeKey(b.key);

    const aIsSummary = /(resumen|summary|overview|sintesis)/.test(aKey);
    const bIsSummary = /(resumen|summary|overview|sintesis)/.test(bKey);
    if (aIsSummary !== bIsSummary) return aIsSummary ? -1 : 1;

    const typeRank = (type: FieldValue['type']) => {
      if (type === 'primitive' || type === 'list') return 0;
      if (type === 'object') return 1;
      return 2; // array
    };

    const byType = typeRank(a.value.type) - typeRank(b.value.type);
    if (byType !== 0) return byType;

    const rankByBusinessKey = (key: string) => {
      if (/(titulo|tipo|documento)/.test(key)) return 0;
      if (/(fecha|date|emision)/.test(key)) return 1;
      if (/(emisor|issuer|proveedor|sender)/.test(key)) return 2;
      if (/(receptor|cliente|receiver|buyer)/.test(key)) return 3;
      if (/(total|subtotal|monto|importe|amount)/.test(key)) return 4;
      return 5;
    };

    const byBusinessKey = rankByBusinessKey(aKey) - rankByBusinessKey(bKey);
    if (byBusinessKey !== 0) return byBusinessKey;

    return a.label.localeCompare(b.label, 'es', { sensitivity: 'base' });
  });
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useExtractedFields(extracted: Record<string, unknown> | null): RenderedField[] {
  return useMemo(() => {
    if (!extracted) return [];
    return classifyFields(extracted);
  }, [extracted]);
}
