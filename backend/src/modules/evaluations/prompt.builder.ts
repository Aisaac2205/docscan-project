// Pure prompt builder. Receives PersonProfile-shaped data, returns the prompt
// strings the AI provider will consume. No DI, no I/O.

import type { PersonProfile } from '../persons/profile.aggregator';

export interface BuiltPrompt {
  systemInstruction: string;
  userPrompt: string;
}

const SYSTEM_INSTRUCTION = `Sos un asistente de RRHH especializado en revisar expedientes de candidatos y empleados en Guatemala.
Recibís datos estructurados ya extraídos de los documentos del expediente (no los documentos en sí).
Tu trabajo es:
1. Detectar fortalezas y riesgos relevantes para una decisión de contratación.
2. Identificar inconsistencias o datos faltantes que requieran atención.
3. Dar una recomendación clara, accionable y en español rioplatense profesional.
4. Evitar tecnicismos. RRHH lee tu salida — sé directo y entendible.
5. No inventes datos. Si algo no está, marcalo como "información faltante".

Devolvé SIEMPRE el siguiente formato Markdown, sin saludo ni cierre genérico:

## Recomendación
[Una frase con la recomendación final: avanzar, requiere revisión, no avanzar]

## Puntaje (0 a 100)
[Número]

## Fortalezas
- [item]
- [item]

## Riesgos y advertencias
- [item]
- [item]

## Información faltante
- [item]
- [item]

## Inconsistencias detectadas
- [item, o "Ninguna" si no hay]
`;

export function buildEvaluationPrompt(
  profile: PersonProfile,
  basics: { fullName: string; cui: string | null; role: string; status: string },
  customPrompt?: string,
): BuiltPrompt {
  const payload = serializeProfileForPrompt(profile, basics);

  const userPrompt = customPrompt
    ? `${customPrompt}\n\nDatos del expediente:\n\n${payload}`
    : `Revisá este expediente y devolvé tu evaluación según el formato indicado.\n\nDatos del expediente:\n\n${payload}`;

  return {
    systemInstruction: SYSTEM_INSTRUCTION,
    userPrompt,
  };
}

function serializeProfileForPrompt(
  profile: PersonProfile,
  basics: { fullName: string; cui: string | null; role: string; status: string },
): string {
  const sections: string[] = [];

  sections.push(`### Datos básicos`);
  sections.push(`- Nombre: ${basics.fullName}`);
  sections.push(`- CUI: ${basics.cui ?? 'no informado'}`);
  sections.push(`- Tipo: ${basics.role}`);
  sections.push(`- Estado actual: ${basics.status}`);

  if (profile.identity) {
    sections.push('\n### Identidad (DPI)');
    sections.push(formatFields(profile.identity));
  } else {
    sections.push('\n### Identidad (DPI)\n_No cargado_');
  }

  if (profile.fiscal) {
    sections.push('\n### Datos fiscales (RTU/NIT)');
    sections.push(formatFields(profile.fiscal));
  } else {
    sections.push('\n### Datos fiscales (RTU/NIT)\n_No cargado_');
  }

  if (profile.background.penal) {
    sections.push('\n### Antecedentes Penales');
    sections.push(formatFields(profile.background.penal));
  } else {
    sections.push('\n### Antecedentes Penales\n_No cargado_');
  }

  if (profile.background.policial) {
    sections.push('\n### Antecedentes Policíacos');
    sections.push(formatFields(profile.background.policial));
  } else {
    sections.push('\n### Antecedentes Policíacos\n_No cargado_');
  }

  if (profile.background.unclassified.length > 0) {
    sections.push('\n### Antecedentes sin clasificar');
    profile.background.unclassified.forEach((bg, i) => {
      sections.push(`- Documento ${i + 1} (${bg._source.documentName}): ${formatFields(bg)}`);
    });
  }

  if (profile.medicalHistory.length > 0) {
    sections.push('\n### Historial médico');
    profile.medicalHistory.forEach((m, i) => {
      sections.push(
        `- Constancia ${i + 1}: ${m.diagnostico ?? 'sin diagnóstico'}, ` +
          `${m.dias_reposo ?? 0} días de reposo, ` +
          `desde ${m.fecha_inicio_reposo ?? '?'} hasta ${m.fecha_fin_reposo ?? '?'}.`,
      );
    });
  }

  if (profile.cv) {
    sections.push('\n### Currículum');
    sections.push(formatFields(profile.cv.fields));
  }

  if (profile.conflicts.length > 0) {
    sections.push('\n### Inconsistencias detectadas (cross-document)');
    profile.conflicts.forEach((c) => {
      sections.push(`- ${c.field}: ${c.values.map((v) => `${v.source}=${v.value}`).join(' vs ')}`);
    });
  }

  if (profile.overrides && Object.keys(profile.overrides).length > 0) {
    sections.push('\n### Correcciones manuales aplicadas por RRHH');
    sections.push(formatFields(profile.overrides));
  }

  return sections.join('\n');
}

function formatFields(obj: object): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('_')) continue; // _source, _metadata
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (typeof value === 'object') {
      lines.push(`- ${key}: ${JSON.stringify(value)}`);
    } else {
      lines.push(`- ${key}: ${value}`);
    }
  }
  return lines.length > 0 ? lines.join('\n') : '_Sin datos_';
}

// ─── Score extractor ─────────────────────────────────────────────────────────

const SCORE_REGEX = /## Puntaje[^\n]*\n+\s*(\d+(?:\.\d+)?)/i;

export function extractScore(markdownResult: string): number | null {
  const match = markdownResult.match(SCORE_REGEX);
  if (!match) return null;
  const num = Number(match[1]);
  if (Number.isNaN(num) || num < 0 || num > 100) return null;
  return num;
}
