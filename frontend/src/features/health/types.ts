export type HealthStatus = 'pending' | 'validated' | 'registered' | 'rejected';

export interface HealthRecord {
  id: string;
  originalName: string;
  filePath: string;
  status: string;
  createdAt: string;
  personId: string | null;
  personName: string | null;
  healthStatus: HealthStatus;
  registeredInPayroll: boolean;
  notes: string | null;
  validatedAt: string | null;
  nombre_paciente: string | null;
  nombre_medico: string | null;
  numero_colegiado: string | null;
  diagnostico: string | null;
  fecha_emision: string | null;
  fecha_inicio_reposo: string | null;
  fecha_fin_reposo: string | null;
  dias_reposo: number | null;
  tiene_sello: boolean | null;
  tiene_firma: boolean | null;
  institucion_emisora: string | null;
}

export interface UpdateStatusPayload {
  status: HealthStatus;
  notes?: string;
}

/** Top-3 sugerencias de empleado por similitud OCR. Backend filtra score>=40. */
export interface PersonSuggestion {
  id: string;
  fullName: string;
  cui: string | null;
  /** 0-100 — qué tan parecido al `nombre_paciente` extraído. */
  score: number;
  /** Texto OCR original, para mostrar transparencia "OCR: Juan Perez". */
  ocrMatchedText: string | null;
}

// Patch parcial de campos editables desde el drawer.
export interface UpdateRecordPayload {
  nombre_paciente?: string | null;
  nombre_medico?: string | null;
  numero_colegiado?: string | null;
  diagnostico?: string | null;
  fecha_emision?: string | null;
  fecha_inicio_reposo?: string | null;
  fecha_fin_reposo?: string | null;
  dias_reposo?: number | null;
  tiene_sello?: boolean | null;
  tiene_firma?: boolean | null;
  institucion_emisora?: string | null;
  notes?: string | null;
}
