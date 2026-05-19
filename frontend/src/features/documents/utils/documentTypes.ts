/**
 * Mapping UI ↔ backend para tipos de documento del listado. Solo los
 * valores que el OCR realmente produce hoy (E.2 — pasaporte, contrato,
 * factura y certificado quedan afuera hasta que tengan prompt OCR).
 */
export type DocumentTypeValue =
  | 'cv'
  | 'id_card'
  | 'background_check'
  | 'medical_cert'
  | 'fiscal_social'
  | 'general';

export interface DocumentTypeOption {
  value: DocumentTypeValue;
  label: string;
  /** Texto corto para el tag en la tabla. */
  short: string;
}

export const DOCUMENT_TYPE_OPTIONS: readonly DocumentTypeOption[] = [
  { value: 'cv', label: 'CV', short: 'CV' },
  { value: 'id_card', label: 'DPI', short: 'DPI' },
  { value: 'background_check', label: 'Antecedentes', short: 'Antecedentes' },
  { value: 'medical_cert', label: 'Constancia médica', short: 'Constancia' },
  { value: 'fiscal_social', label: 'Fiscal/Social', short: 'Fiscal/Social' },
  { value: 'general', label: 'General', short: 'General' },
] as const;

const VALUE_TO_OPTION = new Map<string, DocumentTypeOption>(
  DOCUMENT_TYPE_OPTIONS.map((opt) => [opt.value, opt]),
);

/**
 * Devuelve la opción para un value del backend, o `null` si es un valor
 * desconocido (ej: `"document"` histórico, `"custom"`). El caller decide
 * cómo mostrarlo (típicamente "—" o el value crudo).
 */
export function getDocumentTypeOption(value: string | null | undefined): DocumentTypeOption | null {
  if (!value) return null;
  return VALUE_TO_OPTION.get(value) ?? null;
}

export function getDocumentTypeLabel(value: string | null | undefined): string {
  const opt = getDocumentTypeOption(value);
  return opt?.label ?? 'Sin clasificar';
}

export function getDocumentTypeShort(value: string | null | undefined): string {
  const opt = getDocumentTypeOption(value);
  return opt?.short ?? 'Sin tipo';
}
