import { create } from 'zustand';
import { talentPoolClient } from './client';
import type {
  TalentPoolCandidate,
  TalentPoolCriteria,
  TalentPoolRankPayload,
  TalentPoolRankResult,
} from './types/talent-pool.types';
import type { Document } from '@/features/documents/types/document.types';

const DEFAULT_CRITERIA: TalentPoolCriteria = {
  puesto: '',
  objetivoRol: '',
  imprescindible: [],
  deseable: [],
  experienciaMinima: '',
  idiomaRequerido: '',
  ubicacionModalidad: '',
  noQueremos: [],
  prioridadProceso: 'equilibrio',
  tonoInforme: 'estandar',
};

const createCandidate = (): TalentPoolCandidate => ({
  id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2),
  nombre: '',
  resumenCv: '',
});

type AddFromDocumentsResult = {
  agregados: number;
  omitidosSinContenido: number;
  omitidosDuplicados: number;
};

type DocumentCandidate = {
  id: string;
  nombre: string;
  resumenCv: string;
  sourceDocumentId: string;
};

const FALLBACK_NAME = 'Candidato sin nombre';

function isEmptyCandidate(candidate: TalentPoolCandidate): boolean {
  return (
    !candidate.nombre.trim()
    && !candidate.resumenCv.trim()
    && !candidate.sourceDocumentId
  );
}

function normalizeFileName(originalName: string): string {
  const cleaned = originalName.trim();
  if (!cleaned) return '';
  const extensionIndex = cleaned.lastIndexOf('.');
  const baseName = extensionIndex > 0 ? cleaned.slice(0, extensionIndex) : cleaned;
  return baseName.trim();
}

function humanizeKey(key: string): string {
  const cleaned = key.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'Campo';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function flattenExtractedData(value: unknown, parentKey = ''): string[] {
  if (value === null || value === undefined) return [];

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    const rendered = String(value).trim();
    if (!rendered) return [];
    return parentKey ? [`${parentKey}: ${rendered}`] : [rendered];
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return [];

    const allPrimitive = value.every(
      (item) => item === null || ['string', 'number', 'boolean'].includes(typeof item),
    );

    if (allPrimitive) {
      const rendered = value
        .map((item) => (item === null || item === undefined ? '' : String(item).trim()))
        .filter((item) => item.length > 0)
        .join(', ');

      if (!rendered) return [];
      return parentKey ? [`${parentKey}: ${rendered}`] : [rendered];
    }

    return value.flatMap((item, index) => {
      const label = parentKey ? `${parentKey} (${index + 1})` : `Ítem ${index + 1}`;
      return flattenExtractedData(item, label);
    });
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return [];

    return entries.flatMap(([key, nested]) => {
      const readableKey = humanizeKey(key);
      const nextKey = parentKey ? `${parentKey} · ${readableKey}` : readableKey;
      return flattenExtractedData(nested, nextKey);
    });
  }

  return [];
}

function summarizeExtractedData(extractedData: Document['extractedData']): string {
  if (!extractedData) return '';
  const lines = flattenExtractedData(extractedData)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) return '';
  return lines.join('\n').slice(0, 7000);
}

function documentToCandidate(document: Document): DocumentCandidate | null {
  const rawText = typeof document.rawText === 'string' ? document.rawText.trim() : '';
  const resumenCv = rawText || summarizeExtractedData(document.extractedData);
  if (!resumenCv) return null;

  const inferredName = normalizeFileName(document.originalName);
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2),
    nombre: inferredName || FALLBACK_NAME,
    resumenCv,
    sourceDocumentId: document.id,
  };
}

type TalentPoolState = {
  criterios: TalentPoolCriteria;
  candidatos: TalentPoolCandidate[];
  evaluando: boolean;
  resultado: TalentPoolRankResult | null;
  error: string | null;
  setCriterio: <K extends keyof TalentPoolCriteria>(key: K, value: TalentPoolCriteria[K]) => void;
  addCandidate: () => void;
  removeCandidate: (id: string) => void;
  updateCandidate: (id: string, patch: Partial<Pick<TalentPoolCandidate, 'nombre' | 'resumenCv'>>) => void;
  addCandidatesFromDocuments: (documents: Document[]) => AddFromDocumentsResult;
  evaluate: (provider?: 'gemini' | 'lmstudio', model?: string) => Promise<TalentPoolRankResult | null>;
  clearResult: () => void;
};

export const useTalentPoolStore = create<TalentPoolState>((set, get) => ({
  criterios: DEFAULT_CRITERIA,
  candidatos: [createCandidate(), createCandidate()],
  evaluando: false,
  resultado: null,
  error: null,

  setCriterio: (key, value) => {
    set((state) => ({
      criterios: {
        ...state.criterios,
        [key]: value,
      },
    }));
  },

  addCandidate: () => {
    set((state) => {
      if (state.candidatos.length >= 25) return state;
      return { candidatos: [...state.candidatos, createCandidate()] };
    });
  },

  removeCandidate: (id) => {
    set((state) => {
      if (state.candidatos.length <= 2) return state;
      return { candidatos: state.candidatos.filter((c) => c.id !== id) };
    });
  },

  updateCandidate: (id, patch) => {
    set((state) => ({
      candidatos: state.candidatos.map((candidate) => (
        candidate.id === id ? { ...candidate, ...patch } : candidate
      )),
    }));
  },

  addCandidatesFromDocuments: (documents) => {
    let outcome: AddFromDocumentsResult = {
      agregados: 0,
      omitidosSinContenido: 0,
      omitidosDuplicados: 0,
    };

    set((state) => {
      const nonEmptyCandidates = state.candidatos.filter((candidate) => !isEmptyCandidate(candidate));
      const existingDocIds = new Set(
        nonEmptyCandidates
          .map((candidate) => candidate.sourceDocumentId)
          .filter((value): value is string => typeof value === 'string' && value.length > 0),
      );

      const mapped = documents.map(documentToCandidate);
      const validCandidates = mapped.filter((candidate): candidate is DocumentCandidate => candidate !== null);
      const omitidosSinContenido = mapped.length - validCandidates.length;

      const uniqueToAdd = validCandidates.filter((candidate) => {
        if (existingDocIds.has(candidate.sourceDocumentId)) return false;
        existingDocIds.add(candidate.sourceDocumentId);
        return true;
      });

      const availableSlots = Math.max(0, 25 - nonEmptyCandidates.length);
      const accepted = uniqueToAdd.slice(0, availableSlots);
      const omitidosDuplicados = uniqueToAdd.length - accepted.length;

      outcome = {
        agregados: accepted.length,
        omitidosSinContenido,
        omitidosDuplicados,
      };

      if (accepted.length === 0) return state;
      return { candidatos: [...nonEmptyCandidates, ...accepted] };
    });

    return outcome;
  },

  evaluate: async (provider, model) => {
    const { criterios, candidatos } = get();
    set({ evaluando: true, error: null });

    const payload: TalentPoolRankPayload = {
      criterios,
      candidatos: candidatos.map((c) => ({
        nombre: c.nombre.trim(),
        resumenCv: c.resumenCv.trim(),
      })),
      ...(provider ? { provider } : {}),
      ...(model ? { model } : {}),
    };

    try {
      const result = await talentPoolClient.rank(payload);
      set({ resultado: result, evaluando: false });
      return result;
    } catch (err: unknown) {
      let message = 'No pudimos evaluar candidatos. Probá de nuevo.';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string | string[] } } }).response;
        const raw = response?.data?.message;
        if (Array.isArray(raw)) message = raw[0] || message;
        else if (typeof raw === 'string') message = raw;
      } else if (err instanceof Error) {
        message = err.message;
      }

      set({ evaluando: false, error: message });
      return null;
    }
  },

  clearResult: () => set({ resultado: null, error: null }),
}));
