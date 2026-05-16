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
  // Datos fiscales del contribuyente (RTU)
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

  // Actividad económica principal
  actividad_economica_codigo: string | null;
  actividad_economica_descripcion: string | null;
  actividad_economica_clasificacion: string | null;

  // Establecimiento
  establecimiento_nombre: string | null;
  establecimiento_actividad: string | null;
  establecimiento_fecha_inicio: string | null;
  establecimiento_estado: string | null;
  establecimiento_clasificacion: string | null;
  establecimiento_tipo: string | null;

  // Afiliación IVA
  tipo_contribuyente: string | null;
  regimen_fiscal: string | null;
  periodo_impositivo: string | null;
  forma_calculo_iva: string | null;
  estatus_iva: string | null;
  iva_fecha_desde: string | null;

  // Características especiales
  es_emisor_fel: boolean | null;
  fel_fecha_desde: string | null;

  // Vigencia
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
  const cv = pickMostRecent(docs, 'cv');
  const medical = docs.filter((d) => d.documentType === 'medical_cert');

  const background = buildBackgroundSection(
    docs.filter((d) => d.documentType === 'background_check'),
  );

  const identityData = idCard ? buildIdentity(idCard) : null;
  const fiscalData = fiscal ? buildFiscal(fiscal) : null;
  const cvData = cv ? buildCv(cv) : null;
  const medicalHistory = medical.map(buildMedicalEntry).sort(byCreatedAtDesc);

  const conflicts = detectConflicts({
    identity: identityData,
    fiscal: fiscalData,
    background,
  });

  return {
    identity: identityData,
    fiscal: fiscalData,
    background,
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
  const datosFiscales = asObject(data.datos_fiscales);
  const actividad = asObject(data.actividad_economica);
  const establecimiento = asObject(data.establecimiento);
  const iva = asObject(data.afiliacion_iva);
  const caracteristicas = asObject(data.caracteristicas_especiales);
  const vigencia = asObject(data.vigencia);

  return {
    nit: getString(datosFiscales, 'nit'),
    nombre_completo: getString(datosFiscales, 'nombre_completo'),
    cui: getString(datosFiscales, 'cui'),
    fecha_nacimiento: getString(datosFiscales, 'fecha_nacimiento'),
    fecha_vencimiento_cui: getString(datosFiscales, 'fecha_vencimiento_cui'),
    sexo: getString(datosFiscales, 'sexo'),
    nacionalidad: getString(datosFiscales, 'nacionalidad'),
    estado_civil: getString(datosFiscales, 'estado_civil'),
    sector_economico: getString(datosFiscales, 'sector_economico'),
    participa_camara_empresarial: getBoolean(datosFiscales, 'participa_camara_empresarial'),
    participa_gremial: getBoolean(datosFiscales, 'participa_gremial'),

    actividad_economica_codigo: getString(actividad, 'codigo'),
    actividad_economica_descripcion: getString(actividad, 'descripcion'),
    actividad_economica_clasificacion: getString(actividad, 'clasificacion'),

    establecimiento_nombre: getString(establecimiento, 'nombre_comercial'),
    establecimiento_actividad: getString(establecimiento, 'actividad_economica'),
    establecimiento_fecha_inicio: getString(establecimiento, 'fecha_inicio_operaciones'),
    establecimiento_estado: getString(establecimiento, 'estado'),
    establecimiento_clasificacion: getString(establecimiento, 'clasificacion'),
    establecimiento_tipo: getString(establecimiento, 'tipo'),

    tipo_contribuyente: getString(iva, 'tipo_contribuyente'),
    regimen_fiscal: getString(iva, 'regimen'),
    periodo_impositivo: getString(iva, 'periodo_impositivo'),
    forma_calculo_iva: getString(iva, 'forma_calculo'),
    estatus_iva: getString(iva, 'estatus'),
    iva_fecha_desde: getString(iva, 'fecha_desde'),

    es_emisor_fel: getBoolean(caracteristicas, 'es_emisor_fel'),
    fel_fecha_desde: getString(caracteristicas, 'fel_fecha_desde'),

    fecha_ultima_actualizacion: getString(vigencia, 'fecha_ultima_actualizacion'),
    vigente_hasta: getString(vigencia, 'vigente_hasta'),

    _source: toSource(doc),
  };
}

function buildBackground(doc: DocInput): BackgroundData {
  const data = asObject(doc.extractedData);
  const ciudadano = asObject(data.datos_ciudadano);
  const resultado = asObject(data.resultado);
  const validacion = asObject(data.validacion);
  return {
    tipo_emisor: parseTipoEmisor(data.tipo_emisor),
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

function buildBackgroundSection(docs: DocInput[]): BackgroundSection {
  const built = docs.map(buildBackground);

  // Most recent first (by source extractedAt = doc.createdAt).
  const sorted = built.slice().sort((a, b) => {
    return new Date(b._source.extractedAt).getTime() - new Date(a._source.extractedAt).getTime();
  });

  const penal = sorted.find((b) => b.tipo_emisor === 'penal') ?? null;
  const policial = sorted.find((b) => b.tipo_emisor === 'policial') ?? null;
  const unclassified = sorted.filter((b) => b.tipo_emisor === null);

  return { penal, policial, unclassified };
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
  background: BackgroundSection;
}): FieldConflict[] {
  const conflicts: FieldConflict[] = [];

  // CUI conflicts across all document sources.
  const cuiClaims: { source: string; value: string }[] = [];
  if (args.identity?.cui) {
    cuiClaims.push({ source: 'DPI', value: normalizeCui(args.identity.cui) });
  }
  if (args.fiscal?.cui) {
    cuiClaims.push({ source: 'RTU', value: normalizeCui(args.fiscal.cui) });
  }
  if (args.background.penal?.cui_dpi) {
    cuiClaims.push({ source: 'Antecedentes Penales', value: normalizeCui(args.background.penal.cui_dpi) });
  }
  if (args.background.policial?.cui_dpi) {
    cuiClaims.push({ source: 'Antecedentes Policíacos', value: normalizeCui(args.background.policial.cui_dpi) });
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
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') {
    const normalized = v.trim().toLowerCase();
    if (['true', 'sí', 'si', 'yes', 'activo', '1'].includes(normalized)) return true;
    if (['false', 'no', 'inactivo', '0'].includes(normalized)) return false;
  }
  return null;
}

function parseTipoEmisor(value: unknown): BackgroundTipoEmisor | null {
  if (value === 'penal' || value === 'policial') return value;
  return null;
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
