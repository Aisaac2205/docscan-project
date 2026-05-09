// Pure validator. Takes a PersonProfile-like input and returns ValidationResults.
// No DB, no DI, no I/O — fully testable in isolation.

export type ValidationStatus = 'pass' | 'warning' | 'fail';
export type ValidationSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface ValidationResult {
  id: string;
  label: string;
  status: ValidationStatus;
  message: string;
  severity: ValidationSeverity;
}

export interface ValidatorInput {
  identity: {
    cui: string | null;
    fecha_vencimiento: string | null;
  } | null;
  fiscal: {
    estado_contribuyente: string | null;
    cui_dpi: string | null;
  } | null;
  background: {
    fecha_emision: string | null;
    cui_dpi: string | null;
    tiene_antecedentes: boolean | null;
  } | null;
}

const FOUR_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 4;
const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6;

export function runComplianceValidations(input: ValidatorInput): ValidationResult[] {
  return [
    validatePresence('dpi_presence', 'Documento de identidad cargado', !!input.identity),
    validatePresence('rtu_presence', 'Documento fiscal cargado (RTU/NIT)', !!input.fiscal),
    validatePresence('background_check_presence', 'Antecedentes cargados', !!input.background),
    validateCuiMatch(input),
    validateBackgroundFreshness(input.background),
    validateSatStatus(input.fiscal),
    validateDpiExpiration(input.identity),
    validateBackgroundResult(input.background),
  ];
}

// ─── Reglas individuales ─────────────────────────────────────────────────────

function validatePresence(id: string, label: string, present: boolean): ValidationResult {
  if (present) {
    return { id, label, status: 'pass', message: 'Datos disponibles en el perfil.', severity: 'critical' };
  }
  return {
    id,
    label,
    status: 'fail',
    message: 'Aún no se ha procesado un documento que aporte estos datos.',
    severity: 'critical',
  };
}

function validateCuiMatch(input: ValidatorInput): ValidationResult {
  const id = 'cui_match';
  const label = 'Coincidencia de CUI entre documentos';

  const claims: { source: string; value: string }[] = [];
  if (input.identity?.cui) claims.push({ source: 'DPI', value: normalize(input.identity.cui) });
  if (input.fiscal?.cui_dpi) claims.push({ source: 'RTU', value: normalize(input.fiscal.cui_dpi) });
  if (input.background?.cui_dpi) claims.push({ source: 'Antecedentes', value: normalize(input.background.cui_dpi) });

  if (claims.length === 0) {
    return { id, label, status: 'fail', message: 'No hay documentos con CUI para comparar.', severity: 'high' };
  }
  if (claims.length === 1) {
    return {
      id,
      label,
      status: 'warning',
      message: `Solo el ${claims[0].source} reporta un CUI. Falta confirmación cruzada.`,
      severity: 'high',
    };
  }

  const first = claims[0].value;
  const allMatch = claims.every((c) => c.value === first);
  if (allMatch) {
    return {
      id,
      label,
      status: 'pass',
      message: `Coincide en ${claims.map((c) => c.source).join(', ')}: ${first}.`,
      severity: 'high',
    };
  }
  const detail = claims.map((c) => `${c.source}: ${c.value}`).join(' / ');
  return {
    id,
    label,
    status: 'fail',
    message: `Discrepancia entre documentos: ${detail}.`,
    severity: 'high',
  };
}

function validateBackgroundFreshness(bg: ValidatorInput['background']): ValidationResult {
  const id = 'background_check_freshness';
  const label = 'Vigencia de antecedentes';

  if (!bg) {
    return { id, label, status: 'fail', message: 'Aún no hay antecedentes cargados.', severity: 'high' };
  }
  if (!bg.fecha_emision) {
    return {
      id,
      label,
      status: 'warning',
      message: 'No se pudo leer la fecha de emisión del documento.',
      severity: 'medium',
    };
  }

  const emitted = new Date(bg.fecha_emision);
  if (Number.isNaN(emitted.getTime())) {
    return { id, label, status: 'warning', message: `Fecha no reconocida: "${bg.fecha_emision}".`, severity: 'medium' };
  }

  const ageMs = Date.now() - emitted.getTime();
  const formattedDate = emitted.toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });

  if (ageMs <= FOUR_MONTHS_MS) {
    return { id, label, status: 'pass', message: `Vigente. Emitido el ${formattedDate}.`, severity: 'high' };
  }
  if (ageMs <= SIX_MONTHS_MS) {
    return {
      id,
      label,
      status: 'warning',
      message: `Emitido el ${formattedDate}. Tiene entre 4 y 6 meses. Conviene renovar pronto.`,
      severity: 'high',
    };
  }
  return {
    id,
    label,
    status: 'fail',
    message: `Vencido. Emitido el ${formattedDate} (más de 6 meses).`,
    severity: 'high',
  };
}

function validateSatStatus(fiscal: ValidatorInput['fiscal']): ValidationResult {
  const id = 'sat_status';
  const label = 'Estado del contribuyente ante SAT';

  if (!fiscal) {
    return { id, label, status: 'fail', message: 'Aún no hay datos fiscales cargados.', severity: 'medium' };
  }
  if (!fiscal.estado_contribuyente) {
    return {
      id,
      label,
      status: 'warning',
      message: 'No se pudo leer el estado del contribuyente en el RTU.',
      severity: 'medium',
    };
  }
  const estado = fiscal.estado_contribuyente.trim().toUpperCase();
  const isActive = estado === 'ACTIVO';
  return {
    id,
    label,
    status: isActive ? 'pass' : 'fail',
    message: isActive
      ? 'Contribuyente activo ante SAT.'
      : `Estado actual: "${fiscal.estado_contribuyente}". Se requiere estado ACTIVO.`,
    severity: 'medium',
  };
}

function validateDpiExpiration(identity: ValidatorInput['identity']): ValidationResult {
  const id = 'dpi_expiration';
  const label = 'Vigencia del DPI';

  if (!identity) {
    return { id, label, status: 'fail', message: 'Aún no hay DPI cargado.', severity: 'high' };
  }
  if (!identity.fecha_vencimiento) {
    return {
      id,
      label,
      status: 'warning',
      message: 'No se pudo leer la fecha de vencimiento del DPI.',
      severity: 'medium',
    };
  }
  const expires = new Date(identity.fecha_vencimiento);
  if (Number.isNaN(expires.getTime())) {
    return { id, label, status: 'warning', message: `Fecha de vencimiento no reconocida: "${identity.fecha_vencimiento}".`, severity: 'medium' };
  }
  const formatted = expires.toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });
  const now = Date.now();
  if (expires.getTime() < now) {
    return { id, label, status: 'fail', message: `DPI vencido el ${formatted}.`, severity: 'high' };
  }
  // 6 months warning
  if (expires.getTime() - now < 1000 * 60 * 60 * 24 * 30 * 6) {
    return { id, label, status: 'warning', message: `DPI vence el ${formatted} (en menos de 6 meses).`, severity: 'medium' };
  }
  return { id, label, status: 'pass', message: `Vigente hasta ${formatted}.`, severity: 'medium' };
}

function validateBackgroundResult(bg: ValidatorInput['background']): ValidationResult {
  const id = 'background_check_result';
  const label = 'Resultado de antecedentes';

  if (!bg) {
    return { id, label, status: 'fail', message: 'Aún no hay antecedentes cargados.', severity: 'medium' };
  }
  if (bg.tiene_antecedentes === null) {
    return { id, label, status: 'warning', message: 'No se pudo determinar el resultado.', severity: 'medium' };
  }
  if (bg.tiene_antecedentes === false) {
    return { id, label, status: 'pass', message: 'Sin antecedentes registrados.', severity: 'medium' };
  }
  return { id, label, status: 'fail', message: 'Se reportan antecedentes en el documento.', severity: 'high' };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalize(cui: string): string {
  return cui.replace(/\D/g, '');
}
