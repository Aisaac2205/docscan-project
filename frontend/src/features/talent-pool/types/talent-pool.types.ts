import type { ProviderId } from '@/features/ocr/types/ocr.types';

export type TalentPoolPriority = 'rapidez' | 'equilibrio' | 'calidad';
export type TalentPoolTone = 'breve' | 'estandar' | 'detallado';
export type TalentPoolLabel = 'Muy recomendado' | 'Recomendado' | 'Revisar' | 'No recomendado';

export type TalentPoolCriteria = {
  puesto: string;
  objetivoRol: string;
  imprescindible: string[];
  deseable: string[];
  experienciaMinima: string;
  idiomaRequerido: string;
  ubicacionModalidad: string;
  noQueremos: string[];
  prioridadProceso: TalentPoolPriority;
  tonoInforme: TalentPoolTone;
};

export type TalentPoolCandidate = {
  id: string;
  nombre: string;
  resumenCv: string;
  sourceDocumentId?: string;
};

export type TalentPoolRankPayload = {
  criterios: TalentPoolCriteria;
  candidatos: Array<Pick<TalentPoolCandidate, 'nombre' | 'resumenCv'>>;
  provider?: ProviderId;
  model?: string;
};

export type TalentPoolRankedCandidate = {
  nombre: string;
  score: number;
  etiqueta: TalentPoolLabel;
  explicacion: string;
  alertas: string[];
  orden: number;
};

export type TalentPoolRankResult = {
  puesto: string;
  prioridadProceso: TalentPoolPriority;
  tonoInforme: TalentPoolTone;
  totalCandidatos: number;
  ranking: TalentPoolRankedCandidate[];
  resumenGeneral: string;
  run: TalentPoolRunMeta;
};

export type TalentPoolRunMeta = {
  id: string;
  provider: string;
  model: string | null;
  isPinned: boolean;
  createdAt: string;
};

export type TalentPoolHistoryItem = {
  id: string;
  puesto: string;
  prioridadProceso: TalentPoolPriority;
  tonoInforme: TalentPoolTone;
  totalCandidatos: number;
  rankingTop3: TalentPoolRankedCandidate[];
  resumenGeneral: string;
  provider: string;
  model: string | null;
  isPinned: boolean;
  createdAt: string;
};

export const PRIORITY_OPTIONS: Array<{ value: TalentPoolPriority; label: string; helper: string }> = [
  { value: 'rapidez', label: 'Rapidez', helper: 'Prioriza candidatos con ajuste inmediato.' },
  { value: 'equilibrio', label: 'Equilibrio', helper: 'Combina ajuste, riesgos y potencial.' },
  { value: 'calidad', label: 'Calidad', helper: 'Prioriza análisis profundo y mayor detalle.' },
];

export const TONE_OPTIONS: Array<{ value: TalentPoolTone; label: string; helper: string }> = [
  { value: 'breve', label: 'Breve', helper: 'Conclusiones rápidas para decidir.' },
  { value: 'estandar', label: 'Estándar', helper: 'Resumen claro y completo.' },
  { value: 'detallado', label: 'Detallado', helper: 'Más contexto y riesgos por perfil.' },
];
