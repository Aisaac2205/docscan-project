// Profile aggregator — pure function. Takes documents + overrides, produces
// the consolidated profile for a Person. No DB, no DI.

export interface FieldSource {
  documentId: string;
  documentName: string;
  extractedAt: string;
  documentType: string;
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
  nombre_razon_social: string | null;
  estado_contribuyente: string | null;
  regimen_fiscal: string | null;
  direccion_fiscal: string | null;
  numero_igss: string | null;
  numero_patronal: string | null;
  cui_dpi: string | null;
  _source: FieldSource | null;
}

export interface BackgroundData {
  tiene_antecedentes: boolean | null;
  delito_indicado: string | null;
  fecha_emision: string | null;
  numero_boleta_o_recibo: string | null;
  codigo_validacion: string | null;
  cui_dpi: string | null;
  nombre_completo: string | null;
  _source: FieldSource | null;
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
  background: BackgroundData | null;
  medicalHistory: MedicalEntry[];
  cv: CvData | null;
  conflicts: FieldConflict[];
  overrides: Record<string, unknown>;
}

interface DocInput {
  id: string;
  originalName: string;
  documentType: string;
  extractedData: unknown;
  createdAt: Date;
}

// ─── Main aggregator ─────────────────────────────────────────────────────────

export function aggregateProfile(
  docs: DocInput[],
  overrides: Record<string, unknown> = {},
): PersonProfile {
  const idCard = pickMostRecent(docs, 'id_card');
  const fiscal = pickMostRecent(docs, 'fiscal_social');
  const background = pickMostRecent(docs, 'background_check');
  const cv = pickMostRecent(docs, 'cv');
  const medical = docs.filter((d) => d.documentType === 'medical_cert');

  const identityData = idCard ? buildIdentity(idCard) : null;
  const fiscalData = fiscal ? buildFiscal(fiscal) : null;
  const backgroundData = background ? buildBackground(background) : null;
  const cvData = cv ? buildCv(cv) : null;
  const medicalHistory = medical.map(buildMedicalEntry).sort(byCreatedAtDesc);

  const conflicts = detectConflicts({
    identity: identityData,
    fiscal: fiscalData,
    background: backgroundData,
  });

  return {
    identity: identityData,
    fiscal: fiscalData,
    background: backgroundData,
    medicalHistory,
    cv: cvData,
    conflicts,
    overrides,
  };
}

// ─── Builders ────────────────────────────────────────────────────────────────

function buildIdentity(doc: DocInput): IdentityData {
  const data = asObject(doc.extractedData);
  return {
    primer_nombre: getString(data, 'primer_nombre'),
    otros_nombres: getString(data, 'otros_nombres'),
    primer_apellido: getString(data, 'primer_apellido'),
    segundo_apellido: getString(data, 'segundo_apellido'),
    cui: getString(data, 'cui'),
    fecha_nacimiento: getString(data, 'fecha_nacimiento'),
    fecha_emision: getString(data, 'fecha_emision'),
    fecha_vencimiento: getString(data, 'fecha_vencimiento'),
    genero: getString(data, 'genero'),
    estado_civil: getString(data, 'estado_civil'),
    municipio_vecindad: getString(data, 'municipio_vecindad'),
    departamento_vecindad: getString(data, 'departamento_vecindad'),
    _source: toSource(doc),
  };
}

function buildFiscal(doc: DocInput): FiscalData {
  const data = asObject(doc.extractedData);
  return {
    nit: getString(data, 'nit'),
    nombre_razon_social: getString(data, 'nombre_razon_social'),
    estado_contribuyente: getString(data, 'estado_contribuyente'),
    regimen_fiscal: getString(data, 'regimen_fiscal'),
    direccion_fiscal: getString(data, 'direccion_fiscal'),
    numero_igss: getString(data, 'numero_igss'),
    numero_patronal: getString(data, 'numero_patronal'),
    cui_dpi: getString(data, 'cui_dpi'),
    _source: toSource(doc),
  };
}

function buildBackground(doc: DocInput): BackgroundData {
  const data = asObject(doc.extractedData);
  const ciudadano = asObject(data.datos_ciudadano);
  const resultado = asObject(data.resultado);
  const validacion = asObject(data.validacion);
  return {
    tiene_antecedentes: getBoolean(resultado, 'tiene_antecedentes'),
    delito_indicado: getString(resultado, 'delito_indicado'),
    fecha_emision: getString(validacion, 'fecha_emision'),
    numero_boleta_o_recibo: getString(validacion, 'numero_boleta_o_recibo'),
    codigo_validacion: getString(validacion, 'codigo_validacion'),
    cui_dpi: getString(ciudadano, 'cui_dpi'),
    nombre_completo: getString(ciudadano, 'nombre_completo'),
    _source: toSource(doc),
  };
}

function buildCv(doc: DocInput): CvData {
  return {
    documentId: doc.id,
    documentName: doc.originalName,
    fields: asObject(doc.extractedData),
    createdAt: doc.createdAt.toISOString(),
  };
}

function buildMedicalEntry(doc: DocInput): MedicalEntry {
  const data = asObject(doc.extractedData);
  const health = asObject(data._health);
  return {
    documentId: doc.id,
    documentName: doc.originalName,
    fecha_emision: getString(data, 'fecha_emision'),
    fecha_inicio_reposo: getString(data, 'fecha_inicio_reposo'),
    fecha_fin_reposo: getString(data, 'fecha_fin_reposo'),
    dias_reposo: getNumber(data, 'dias_reposo'),
    diagnostico: getString(data, 'diagnostico'),
    nombre_medico: getString(data, 'nombre_medico'),
    numero_colegiado: getString(data, 'numero_colegiado'),
    tiene_sello: getBoolean(data, 'tiene_sello'),
    tiene_firma: getBoolean(data, 'tiene_firma'),
    healthStatus: getString(health, 'status') ?? 'pending',
    registeredInPayroll: getBoolean(health, 'registeredInPayroll') ?? false,
    createdAt: doc.createdAt.toISOString(),
  };
}

// ─── Conflict detection ──────────────────────────────────────────────────────

function detectConflicts(args: {
  identity: IdentityData | null;
  fiscal: FiscalData | null;
  background: BackgroundData | null;
}): FieldConflict[] {
  const conflicts: FieldConflict[] = [];

  // CUI conflicts across documents
  const cuiClaims: { source: string; value: string }[] = [];
  if (args.identity?.cui) {
    cuiClaims.push({ source: 'DPI', value: normalizeCui(args.identity.cui) });
  }
  if (args.fiscal?.cui_dpi) {
    cuiClaims.push({ source: 'RTU', value: normalizeCui(args.fiscal.cui_dpi) });
  }
  if (args.background?.cui_dpi) {
    cuiClaims.push({ source: 'Antecedentes', value: normalizeCui(args.background.cui_dpi) });
  }

  if (cuiClaims.length >= 2) {
    const first = cuiClaims[0].value;
    const allMatch = cuiClaims.every((c) => c.value === first);
    if (!allMatch) {
      conflicts.push({ field: 'cui', values: cuiClaims });
    }
  }

  return conflicts;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pickMostRecent(docs: DocInput[], type: string): DocInput | null {
  const filtered = docs
    .filter((d) => d.documentType === type)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return filtered[0] ?? null;
}

function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function getString(obj: Record<string, unknown>, key: string): string | null {
  const v = obj[key];
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function getNumber(obj: Record<string, unknown>, key: string): number | null {
  const v = obj[key];
  return typeof v === 'number' && !Number.isNaN(v) ? v : null;
}

function getBoolean(obj: Record<string, unknown>, key: string): boolean | null {
  const v = obj[key];
  return typeof v === 'boolean' ? v : null;
}

function toSource(doc: DocInput): FieldSource {
  return {
    documentId: doc.id,
    documentName: doc.originalName,
    documentType: doc.documentType,
    extractedAt: doc.createdAt.toISOString(),
  };
}

function normalizeCui(cui: string): string {
  return cui.replace(/\D/g, '');
}

function byCreatedAtDesc<T extends { createdAt: string }>(a: T, b: T): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}
