import { z } from 'zod';
import { ExtractionMode } from '../dto/ocr.dto';

// ─── Per-mode schemas ────────────────────────────────────────────────────────
// Each schema reflects exactly what the system prompt asks Gemini to return.
// Fields are optional because Gemini may omit them when the document lacks data.
// `.catchall(z.unknown())` preserves any extra fields Gemini adds without
// breaking validation.

export const CvDataSchema = z
  .object({
    // Datos personales
    nombre_completo: z.string().optional(),
    correo: z.string().optional(),
    telefono: z.string().optional(),
    ubicacion: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    portafolio: z.string().optional(),
    // Experiencia laboral
    experiencia: z
      .array(
        z.object({
          empresa: z.string().optional(),
          cargo: z.string().optional(),
          fecha_inicio: z.string().optional(),
          fecha_fin: z.string().optional(),
          responsabilidades: z.array(z.string()).optional(),
        }),
      )
      .optional(),
    // Educación
    educacion: z
      .array(
        z.object({
          institucion: z.string().optional(),
          titulo: z.string().optional(),
          fecha_inicio: z.string().optional(),
          fecha_fin: z.string().optional(),
        }),
      )
      .optional(),
    // Habilidades
    habilidades_tecnicas: z.array(z.string()).optional(),
    idiomas: z.array(z.string()).optional(),
    certificaciones: z.array(z.string()).optional(),
  })
  .catchall(z.unknown());

export const IdCardDataSchema = z
  .object({
    primer_nombre: z.string().optional(),
    otros_nombres: z.string().optional(),
    primer_apellido: z.string().optional(),
    segundo_apellido: z.string().optional(),
    cui: z.string().optional(),
    fecha_nacimiento: z.string().optional(),
    fecha_emision: z.string().optional(),
    fecha_vencimiento: z.string().optional(),
    genero: z.string().optional(),
    estado_civil: z.string().optional(),
    municipio_vecindad: z.string().optional(),
    departamento_vecindad: z.string().optional(),
  })
  .catchall(z.unknown());

export const FiscalSocialDataSchema = z
  .object({
    // SAT / RTU
    nit: z.string().optional(),
    nombre_razon_social: z.string().optional(),
    estado_contribuyente: z.string().optional(), // Activo, Suspendido, etc.
    regimen_fiscal: z.string().optional(),
    direccion_fiscal: z.string().optional(),
    // IGSS
    numero_igss: z.string().optional(),
    numero_patronal: z.string().optional(),
  })
  .catchall(z.unknown());

export const MedicalCertDataSchema = z
  .object({
    // Paciente
    nombre_paciente: z.string().optional(),
    // Médico
    nombre_medico: z.string().optional(),
    numero_colegiado: z.string().optional(), // Colegio de Médicos y Cirujanos de Guatemala
    tiene_sello: z.boolean().optional(),
    tiene_firma: z.boolean().optional(),
    // Diagnóstico y reposo
    diagnostico: z.string().optional(),
    fecha_emision: z.string().optional(),
    fecha_inicio_reposo: z.string().optional(),
    fecha_fin_reposo: z.string().optional(),
    dias_reposo: z.number().optional(),
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
  [ExtractionMode.CV]:           CvDataSchema,
  [ExtractionMode.ID_CARD]:      IdCardDataSchema,
  [ExtractionMode.FISCAL_SOCIAL]: FiscalSocialDataSchema,
  [ExtractionMode.MEDICAL_CERT]: MedicalCertDataSchema,
  [ExtractionMode.GENERAL]:      GeneralDataSchema,
  [ExtractionMode.CUSTOM]:       CustomDataSchema,
} as const;

// ─── Inferred TypeScript types ───────────────────────────────────────────────

export type CvData = z.infer<typeof CvDataSchema>;
export type IdCardData = z.infer<typeof IdCardDataSchema>;
export type FiscalSocialData = z.infer<typeof FiscalSocialDataSchema>;
export type MedicalCertData = z.infer<typeof MedicalCertDataSchema>;
export type GeneralData = z.infer<typeof GeneralDataSchema>;
export type CustomData = z.infer<typeof CustomDataSchema>;
export type AnalyzeResponse = z.infer<typeof AnalyzeResponseSchema>;

export type ExtractedDataByMode = {
  [M in ExtractionMode]: z.infer<(typeof ExtractionSchemas)[M]>;
};
