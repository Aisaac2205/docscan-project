// Unión discriminada que modela TODOS los valores posibles de un campo extraído por OCR.
// Ningún componente maneja `unknown` — la clasificación ocurre en useExtractedFields.

export interface PrimitiveField {
  type: 'primitive';
  value: string;
}

export interface ListField {
  type: 'list';
  items: string[];
}

export interface ObjectField {
  type: 'object';
  fields: RenderedField[];
}

export interface ArrayField {
  type: 'array';
  rows: RenderedField[][];
}

export type FieldValue = PrimitiveField | ListField | ObjectField | ArrayField;

export interface RenderedField {
  key: string;
  label: string;
  value: FieldValue;
}
