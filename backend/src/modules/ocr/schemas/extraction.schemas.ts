import { z } from 'zod';
import { ExtractionMode } from '../dto/ocr.dto';

// ─── Per-mode schemas ────────────────────────────────────────────────────────
// Each schema reflects exactly what the system prompt asks Gemini to return.
// Fields are optional because Gemini may omit them when the document lacks data.
// `.catchall(z.unknown())` preserves any extra fields Gemini adds without
// breaking validation.

export const InvoiceDataSchema = z
  .object({
    proveedor: z.string().optional(),
    fecha: z.string().optional(),
    total: z.number().optional(),
    nit: z.string().optional(),
    numero_factura: z.string().optional(),
    moneda: z.string().optional(),
    items: z
      .array(
        z.object({
          descripcion: z.string(),
          cantidad: z.number().optional(),
          precio: z.number().optional(),
        }),
      )
      .optional(),
  })
  .catchall(z.unknown());

export const ReceiptDataSchema = z
  .object({
    vendedor: z.string().optional(),
    fecha: z.string().optional(),
    total: z.number().optional(),
    subtotal: z.number().optional(),
    items: z
      .array(
        z.object({
          descripcion: z.string(),
          cantidad: z.number().optional(),
          precio: z.number().optional(),
        }),
      )
      .optional(),
  })
  .catchall(z.unknown());

export const IdCardDataSchema = z
  .object({
    nombre: z.string().optional(),
    documento: z.string().optional(),
    fecha_nacimiento: z.string().optional(),
    direccion: z.string().optional(),
    nacionalidad: z.string().optional(),
  })
  .catchall(z.unknown());

export const GeneralDataSchema = z
  .object({
    tipo_documento: z.string().optional(),
    idioma: z.string().optional(),
    fecha: z.string().optional(),
    partes_involucradas: z.array(z.string()).optional(),
    resumen: z.string().optional(),
    campos_clave: z.record(z.string(), z.unknown()).optional(),
    texto_completo: z.string().optional(),
  })
  .catchall(z.unknown());

// Custom mode: keys are user-defined, values are primitives or null.
export const CustomDataSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean(), z.null()]),
);

// Schema for analyzeDocument response — strict shape, no extra fields expected.
export const AnalyzeResponseSchema = z.object({
  detectedType: z.string(),
  detectedTypeLabel: z.string(),
  confidence: z.number().min(0).max(1),
  description: z.string(),
  suggestedFields: z.array(
    z.object({
      key: z.string(),
      label: z.string(),
      description: z.string().optional(),
    }),
  ),
});

// ─── Schema map keyed by ExtractionMode ─────────────────────────────────────

export const ExtractionSchemas = {
  [ExtractionMode.INVOICE]: InvoiceDataSchema,
  [ExtractionMode.RECEIPT]: ReceiptDataSchema,
  [ExtractionMode.ID_CARD]: IdCardDataSchema,
  [ExtractionMode.GENERAL]: GeneralDataSchema,
  [ExtractionMode.CUSTOM]: CustomDataSchema,
} as const;

// ─── Inferred TypeScript types ───────────────────────────────────────────────

export type InvoiceData = z.infer<typeof InvoiceDataSchema>;
export type ReceiptData = z.infer<typeof ReceiptDataSchema>;
export type IdCardData = z.infer<typeof IdCardDataSchema>;
export type GeneralData = z.infer<typeof GeneralDataSchema>;
export type CustomData = z.infer<typeof CustomDataSchema>;
export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;

export type ExtractedDataByMode = {
  [M in ExtractionMode]: z.infer<(typeof ExtractionSchemas)[M]>;
};
