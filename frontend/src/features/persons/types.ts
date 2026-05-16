export type PersonRole = 'candidate' | 'employee';
export type PersonStatus = 'active' | 'hired' | 'archived' | 'rejected';

export interface Person {
  id: string;
  userId: string;
  fullName: string;
  cui: string | null;
  email: string | null;
  phone: string | null;
  role: PersonRole;
  status: PersonStatus;
  notes: string | null;
  profileOverrides: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface FieldSource {
  documentId: string;
  documentName: string;
  documentType: string;
  extractedAt: string;
}

export interface IdentityData {
  primer_nombre: string | null;
  otros_nombres: string | null;
  primer_apellido: string | null;
  segundo_apellido: string | null;
  cui: string | null;
  fecha_nacimiento: string | null;
  fecha_emision: string | null;
  fecha_vencimiento: string | null;
  genero: string | null;
  estado_civil: string | null;
  municipio_vecindad: string | null;
  departamento_vecindad: string | null;
  _source: FieldSource | null;
}

export interface FiscalData {
  nit: string | null;
  nombre_completo: string | null;
  cui: string | null;
  fecha_nacimiento: string | null;
  fecha_vencimiento_cui: string | null;
  sexo: string | null;
  nacionalidad: string | null;
  estado_civil: string | null;
  sector_economico: string | null;
  participa_camara_empresarial: boolean | null;
  participa_gremial: boolean | null;

  actividad_economica_codigo: string | null;
  actividad_economica_descripcion: string | null;
  actividad_economica_clasificacion: string | null;

  establecimiento_nombre: string | null;
  establecimiento_actividad: string | null;
  establecimiento_fecha_inicio: string | null;
  establecimiento_estado: string | null;
  establecimiento_clasificacion: string | null;
  establecimiento_tipo: string | null;

  tipo_contribuyente: string | null;
  regimen_fiscal: string | null;
  periodo_impositivo: string | null;
  forma_calculo_iva: string | null;
  estatus_iva: string | null;
  iva_fecha_desde: string | null;

  es_emisor_fel: boolean | null;
  fel_fecha_desde: string | null;

  fecha_ultima_actualizacion: string | null;
  vigente_hasta: string | null;

  _source: FieldSource | null;
}

export type BackgroundTipoEmisor = 'penal' | 'policial';

export interface BackgroundData {
  tipo_emisor: BackgroundTipoEmisor | null;
  tiene_antecedentes: boolean | null;
  delito_indicado: string | null;
  fecha_emision: string | null;
  numero_boleta_o_recibo: string | null;
  codigo_validacion: string | null;
  cui_dpi: string | null;
  nombre_completo: string | null;
  _source: FieldSource;
}

export interface BackgroundSection {
  penal: BackgroundData | null;
  policial: BackgroundData | null;
  unclassified: BackgroundData[];
}

export interface MedicalEntry {
  documentId: string;
  documentName: string;
  fecha_emision: string | null;
  fecha_inicio_reposo: string | null;
  fecha_fin_reposo: string | null;
  dias_reposo: number | null;
  diagnostico: string | null;
  nombre_medico: string | null;
  numero_colegiado: string | null;
  tiene_sello: boolean | null;
  tiene_firma: boolean | null;
  healthStatus: string;
  registeredInPayroll: boolean;
  createdAt: string;
}

export interface CvData {
  documentId: string;
  documentName: string;
  fields: Record<string, unknown>;
  createdAt: string;
}

export interface FieldConflict {
  field: string;
  values: { source: string; value: unknown }[];
}

export interface PersonProfile {
  identity: IdentityData | null;
  fiscal: FiscalData | null;
  background: BackgroundSection;
  medicalHistory: MedicalEntry[];
  cv: CvData | null;
  conflicts: FieldConflict[];
  overrides: Record<string, unknown>;
}

export interface PersonProfileResponse {
  person: Person;
  profile: PersonProfile;
}

export interface PersonEvaluation {
  id: string;
  personId: string;
  provider: string;
  model: string | null;
  prompt: string;
  result: string;
  score: number | null;
  createdAt: string;
}

export interface CreatePersonInput {
  fullName: string;
  cui?: string;
  email?: string;
  phone?: string;
  role?: PersonRole;
  status?: PersonStatus;
  notes?: string;
}

export type UpdatePersonInput = Partial<CreatePersonInput>;

// ─── Completeness + pagination + metrics ─────────────────────────────────────

export type SlotId =
  | 'cv'
  | 'id_card'
  | 'background_penal'
  | 'background_policial'
  | 'fiscal_social';

export interface CompletenessSummary {
  done: number;
  total: number;
  missing: SlotId[];
}

export interface RequiredSlot {
  id: SlotId;
  label: string;
  required: boolean;
  satisfied: boolean;
}

export interface CompletenessDetail extends CompletenessSummary {
  slots: RequiredSlot[];
}

export interface PersonWithCompleteness extends Person {
  completeness?: CompletenessSummary;
}

export interface PaginatedPersons {
  items: PersonWithCompleteness[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PersonMetrics {
  activeCount: number;
  incompleteCount: number;
}
