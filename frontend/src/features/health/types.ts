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
