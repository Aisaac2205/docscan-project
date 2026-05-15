import { z } from 'zod';
import { ExtractionMode } from '../dto/ocr.dto';

// ─── Per-mode schemas ────────────────────────────────────────────────────────
// Each schema reflects exactly what the system prompt asks Gemini to return.
// Fields use .nullable().optional() because Gemini returns null for missing
// fields, not undefined. `.catchall(z.unknown())` preserves extra fields.

const nullableString = z.string().nullable().optional();
const nullableNumber = z.number().nullable().optional();
const nullableBoolean = z.boolean().nullable().optional();

export const CvDataSchema = z.record(z.string(), z.unknown());

export const IdCardDataSchema = z
  .object({
    primer_nombre: nullableString,
    otros_nombres: nullableString,
    primer_apellido: nullableString,
    segundo_apellido: nullableString,
    cui: nullableString,
    fecha_nacimiento: nullableString,
    fecha_emision: nullableString,
    fecha_vencimiento: nullableString,
    genero: nullableString,
    estado_civil: nullableString,
    municipio_vecindad: nullableString,
    departamento_vecindad: nullableString,
  })
  .catchall(z.unknown());

export const FiscalSocialDataSchema = z
  .object({
    nit: nullableString,
    nombre_razon_social: nullableString,
    estado_contribuyente: nullableString,
    regimen_fiscal: nullableString,
    direccion_fiscal: nullableString,
    numero_igss: nullableString,
    numero_patronal: nullableString,
  })
  .catchall(z.unknown());

export const MedicalCertDataSchema = z
  .object({
    nombre_paciente: nullableString,
    nombre_medico: nullableString,
    numero_colegiado: nullableString,
    tiene_sello: nullableBoolean,
    tiene_firma: nullableBoolean,
    diagnostico: nullableString,
    fecha_emision: nullableString,
    fecha_inicio_reposo: nullableString,
    fecha_fin_reposo: nullableString,
    dias_reposo: nullableNumber,
  })
  .catchall(z.unknown());

export const BackgroundCheckTipoEmisorSchema = z
  .enum(['penal', 'policial'])
  .nullable()
  .optional();

export const BackgroundCheckDataSchema = z
  .object({
    tipo_documento: nullableString,
    // 'penal' = Organismo Judicial, 'policial' = PNC. null cuando OCR no logra
    // clasificar — el slot queda en "sin clasificar" hasta acción manual.
    tipo_emisor: BackgroundCheckTipoEmisorSchema,
    datos_ciudadano: z.object({
      nombre_completo: nullableString,
      cui_dpi: nullableString,
    }).optional(),
    resultado: z.object({
      tiene_antecedentes: nullableBoolean,
      delito_indicado: nullableString,
    }).optional(),
    validacion: z.object({
      fecha_emision: nullableString,
      numero_boleta_o_recibo: nullableString,
      codigo_validacion: nullableString,
    }).optional(),
    _metadata: z.object({
      confidence_score: nullableNumber,
      requiere_revision_manual: nullableBoolean,
    }).optional(),
  })
  .catchall(z.unknown());

export const GeneralDataSchema = z
  .object({
    tipo_documento: nullableString,
    idioma: nullableString,
    fecha: nullableString,
    partes_involucradas: z.array(z.string()).nullable().optional(),
    resumen: nullableString,
    campos_clave: z.record(z.string(), z.unknown()).nullable().optional(),
    texto_completo: nullableString,
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
  [ExtractionMode.CV]:           CvDataSchema,
  [ExtractionMode.ID_CARD]:      IdCardDataSchema,
  [ExtractionMode.FISCAL_SOCIAL]: FiscalSocialDataSchema,
  [ExtractionMode.MEDICAL_CERT]: MedicalCertDataSchema,
  [ExtractionMode.BACKGROUND_CHECK]: BackgroundCheckDataSchema,
  [ExtractionMode.GENERAL]:      GeneralDataSchema,
  [ExtractionMode.CUSTOM]:       CustomDataSchema,
} as const;

// ─── Inferred TypeScript types ───────────────────────────────────────────────

export type CvData = z.infer<typeof CvDataSchema>;
export type IdCardData = z.infer<typeof IdCardDataSchema>;
export type FiscalSocialData = z.infer<typeof FiscalSocialDataSchema>;
export type MedicalCertData = z.infer<typeof MedicalCertDataSchema>;
export type BackgroundCheckData = z.infer<typeof BackgroundCheckDataSchema>;
export type GeneralData = z.infer<typeof GeneralDataSchema>;
export type CustomData = z.infer<typeof CustomDataSchema>;
export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;

export type ExtractedDataByMode = {
  [M in ExtractionMode]: z.infer<(typeof ExtractionSchemas)[M]>;
};
