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

// Modelos locales a veces inyectan strings de metadata jammed dentro de
// arrays — ej. "_confidence_score_estimateed_by_system_expert_..._0.98"
// metido como elemento más en un array de objetos legítimos. Las filtramos
// con la misma heurística que aplicamos a las keys: prefijo "_" + letra.
function isMetaLeakString(v: unknown): boolean {
  return typeof v === 'string' && /^_[a-z]/i.test(v.trim());
}

function classifyValue(value: unknown): FieldValue | null {
  if (isNullish(value)) return null;

  if (isPrimitive(value)) {
    return { type: 'primitive', value: String(value) };
  }

  if (Array.isArray(value)) {
    return classifyArray(value);
  }

  if (isPlainObject(value)) {
    const fields = classifyFields(value);
    return fields.length > 0 ? { type: 'object', fields } : null;
  }

  // Tipos inesperados (Date, Map, etc.) — JSON legible como último recurso.
  return { type: 'primitive', value: JSON.stringify(value) };
}

/**
 * Clasifica un array según su contenido. Maneja 3 casos:
 *   1. Homogéneo de primitivos → ListField (chips/líneas)
 *   2. Homogéneo de objetos    → ArrayField (filas con campos)
 *   3. Heterogéneo (mixto)     → ArrayField clasificando elemento por elemento.
 *      Esto cubre cuando el modelo devuelve `[{...obj}, "_confidence_..."]`
 *      después de filtrar las strings de metadata.
 */
function classifyArray(value: unknown[]): FieldValue | null {
  const items = value.filter((v) => !isMetaLeakString(v) && !isNullish(v));
  if (items.length === 0) return null;

  if (isArrayOfPrimitives(items)) {
    return { type: 'list', items: items.map(String) };
  }

  if (isArrayOfObjects(items)) {
    const rows = items
      .map((item) => classifyFields(item))
      .filter((row) => row.length > 0);
    return rows.length > 0 ? { type: 'array', rows } : null;
  }

  const rows: RenderedField[][] = items.flatMap((item, i) => {
    if (isPlainObject(item)) {
      const fields = classifyFields(item);
      return fields.length > 0 ? [fields] : [];
    }
    const classified = classifyValue(item);
    if (!classified) return [];
    return [[{ key: `__item_${i}`, label: 'Elemento', value: classified }]];
  });
  return rows.length > 0 ? { type: 'array', rows } : null;
}

function classifyFields(obj: Record<string, unknown>): RenderedField[] {
  const fields = Object.entries(obj).flatMap(([key, value]) => {
    // Omitir campos internos (_confidence, _metadata, etc.), valores vacíos,
    // y strings de metadata-leak guardadas como valor (modelos locales).
    if (key.startsWith('_') || isNullish(value) || isMetaLeakString(value)) {
      return [];
    }

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
