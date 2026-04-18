'use client';

import { useEffect, useMemo, useState } from 'react';
import { ocrClient } from '@/features/ocr/client';
import type { ProviderId, ProviderInfo } from '@/features/ocr/types/ocr.types';
import { toast } from '@/shared/ui/toast/store';
import { SpinnerIcon, TrashIcon } from '@/shared/ui/icons';
import { useTalentPoolStore } from '@/features/talent-pool/store';
import { useDocumentStore } from '@/features/documents/store';
import {
  PRIORITY_OPTIONS,
  TONE_OPTIONS,
  type TalentPoolLabel,
} from '@/features/talent-pool/types/talent-pool.types';

const labelStyle: Record<TalentPoolLabel, string> = {
  'Muy recomendado': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Recomendado: 'bg-blue-50 text-blue-700 border-blue-200',
  Revisar: 'bg-amber-50 text-amber-700 border-amber-200',
  'No recomendado': 'bg-rose-50 text-rose-700 border-rose-200',
};

function normalizeListItem(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function ListField({
  label,
  helper,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  helper: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState('');

  const addDraftItem = () => {
    const cleaned = normalizeListItem(draft);
    if (!cleaned) return;
    if (value.length >= 20) {
      toast.info('Llegaste al máximo de 20 puntos en esta lista.');
      return;
    }
    onChange([...value, cleaned]);
    setDraft('');
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  };

  const removeItem = (index: number) => {
    onChange(value.filter((_, current) => current !== index));
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold text-stone-700">{label}</label>
      <p className="text-[11px] text-stone-400">{helper}</p>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addDraftItem();
            }
          }}
          placeholder={placeholder}
          className="w-full h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-stone-800 input-focus"
        />
        <button
          type="button"
          onClick={addDraftItem}
          className="h-10 px-3 rounded-lg border border-[var(--border)] bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50"
        >
          Agregar
        </button>
      </div>
      <p className="text-[11px] text-stone-400">Presioná Enter o coma para agregar. No se guardan espacios vacíos.</p>

      {value.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {value.map((item, index) => (
            <div key={`${item}-${index}`} className="flex items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-stone-50 px-2 py-1.5">
              <span className="text-[12px] text-stone-700 break-words">{item}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(index, -1)}
                  disabled={index === 0}
                  className="h-6 w-6 rounded border border-[var(--border)] bg-white text-[11px] text-stone-600 disabled:opacity-30"
                  title="Subir"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 1)}
                  disabled={index === value.length - 1}
                  className="h-6 w-6 rounded border border-[var(--border)] bg-white text-[11px] text-stone-600 disabled:opacity-30"
                  title="Bajar"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="h-6 px-2 rounded border border-[var(--border)] bg-white text-[11px] text-stone-600 hover:text-rose-600"
                  title="Quitar"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TalentPoolView() {
  const {
    criterios,
    candidatos,
    resultado,
    evaluando,
    error,
    setCriterio,
    addCandidate,
    removeCandidate,
    updateCandidate,
    addCandidatesFromDocuments,
    evaluate,
  } = useTalentPoolStore();
  const { documents, loading: loadingDocuments, fetchDocuments } = useDocumentStore();

  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>('gemini');
  const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);

  const activeProvider = useMemo(
    () => providers.find((provider) => provider.id === selectedProvider),
    [providers, selectedProvider],
  );

  const sortedDocuments = useMemo(
    () => [...documents].sort((a, b) => {
      const aCompleted = a.status === 'completed' ? 1 : 0;
      const bCompleted = b.status === 'completed' ? 1 : 0;
      if (aCompleted !== bCompleted) return bCompleted - aCompleted;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }),
    [documents],
  );

  useEffect(() => {
    let mounted = true;
    const loadProviders = async () => {
      try {
        setLoadingProviders(true);
        const fetched = await ocrClient.getProviders();
        if (!mounted) return;

        const available = fetched.filter((provider) => provider.available);
        setProviders(available);

        const preferred = available.find((provider) => provider.id === 'gemini')
          ?? available.find((provider) => provider.id === 'lmstudio');

        if (preferred) {
          setSelectedProvider(preferred.id);
          setSelectedModel(preferred.models[0]?.id);
        }
      } catch {
        if (mounted) toast.info('No pudimos cargar los modos de IA. Usaremos la configuración por defecto.');
      } finally {
        if (mounted) setLoadingProviders(false);
      }
    };

    loadProviders();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    fetchDocuments().catch(() => {
      toast.info('No pudimos cargar los CV/documentos escaneados por ahora.');
    });
  }, [fetchDocuments]);

  const validate = (): string | null => {
    if (!criterios.puesto.trim()) return 'Completá el campo “Puesto”.';
    if (!criterios.objetivoRol.trim()) return 'Completá el campo “Objetivo del rol”.';
    if (candidatos.length < 2) return 'Agregá al menos 2 candidatos para comparar.';

    for (const candidate of candidatos) {
      if (!candidate.nombre.trim()) return 'Cada candidato necesita nombre.';
      if (!candidate.resumenCv.trim()) return `Falta el resumen/CV de ${candidate.nombre || 'un candidato'}.`;
      if (candidate.resumenCv.trim().length > 7000) {
        return `El resumen/CV de ${candidate.nombre} supera 7000 caracteres.`;
      }
    }
    return null;
  };

  const handleEvaluate = async () => {
    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const result = await evaluate(selectedProvider, selectedModel);
    if (result) {
      toast.success('Evaluación completada. Ya tenés el ranking ordenado.');
    }
  };

  const toggleDocument = (id: string) => {
    setSelectedDocumentIds((prev) => (
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    ));
  };

  const handleAddFromDocuments = () => {
    if (selectedDocumentIds.length === 0) {
      toast.info('Seleccioná al menos un CV/documento para agregarlo.');
      return;
    }

    const selectedDocuments = sortedDocuments.filter((document) => selectedDocumentIds.includes(document.id));
    const result = addCandidatesFromDocuments(selectedDocuments);

    if (result.agregados > 0) {
      toast.success(`Se agregaron ${result.agregados} candidato(s) desde documentos escaneados.`);
    }
    if (result.omitidosSinContenido > 0) {
      toast.info(`${result.omitidosSinContenido} documento(s) no tenían texto ni datos extraídos y se omitieron.`);
    }
    if (result.omitidosDuplicados > 0) {
      toast.info(`${result.omitidosDuplicados} documento(s) ya estaban cargados o excedían el límite de 25 candidatos.`);
    }
    if (result.agregados === 0 && result.omitidosSinContenido === 0 && result.omitidosDuplicados === 0) {
      toast.info('No hubo cambios para agregar.');
    }

    setSelectedDocumentIds([]);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <header className="space-y-1">
        <h1 className="text-[length:var(--text-heading-xl)] font-semibold text-stone-900">Bolsa de talento</h1>
        <p className="text-[length:var(--text-body)] text-stone-500 max-w-3xl">
          Compará candidatos de forma clara para RRHH. Cargás criterios, pegás CVs y obtenés un ranking con recomendaciones simples.
        </p>
      </header>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_1fr] items-start">
        <article className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5 space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-stone-800">Criterios del proceso</h2>
            <p className="text-xs text-stone-400">Definí qué perfil buscás y qué no querés en esta vacante.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-[12px] font-semibold text-stone-700">Puesto</label>
              <input
                value={criterios.puesto}
                onChange={(e) => setCriterio('puesto', e.target.value)}
                maxLength={120}
                placeholder="Ej: Analista de RRHH"
                className="w-full h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-stone-800 input-focus"
              />
            </div>

            <div className="space-y-1.5 md:col-span-1">
              <label className="text-[12px] font-semibold text-stone-700">Experiencia mínima</label>
              <input
                value={criterios.experienciaMinima}
                onChange={(e) => setCriterio('experienciaMinima', e.target.value)}
                maxLength={120}
                placeholder="Ej: 3 años en reclutamiento"
                className="w-full h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-stone-800 input-focus"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[12px] font-semibold text-stone-700">Objetivo del rol</label>
              <textarea
                value={criterios.objetivoRol}
                onChange={(e) => setCriterio('objetivoRol', e.target.value)}
                maxLength={1200}
                rows={4}
                placeholder="Contanos para qué existe este rol y qué impacto esperás"
                className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-stone-800 input-focus resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-stone-700">Idioma requerido</label>
              <input
                value={criterios.idiomaRequerido}
                onChange={(e) => setCriterio('idiomaRequerido', e.target.value)}
                maxLength={120}
                placeholder="Ej: Inglés intermedio"
                className="w-full h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-stone-800 input-focus"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-stone-700">Ubicación/modalidad</label>
              <input
                value={criterios.ubicacionModalidad}
                onChange={(e) => setCriterio('ubicacionModalidad', e.target.value)}
                maxLength={120}
                placeholder="Ej: Híbrido en Ciudad de Guatemala"
                className="w-full h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-stone-800 input-focus"
              />
            </div>

            <div className="md:col-span-2 grid gap-3 lg:grid-cols-2">
              <ListField
                label="Imprescindible"
                helper="Lo que sí o sí tiene que cumplir."
                value={criterios.imprescindible}
                onChange={(next) => setCriterio('imprescindible', next)}
                placeholder="Ej: Manejo de nómina"
              />
              <ListField
                label="Deseable"
                helper="Suma puntos, pero no bloquea la contratación."
                value={criterios.deseable}
                onChange={(next) => setCriterio('deseable', next)}
                placeholder="Ej: Manejo de ATS"
              />
            </div>

            <div className="md:col-span-2">
              <ListField
                label="No queremos"
                helper="Alertas rojas o cosas que querés evitar."
                value={criterios.noQueremos}
                onChange={(next) => setCriterio('noQueremos', next)}
                placeholder="Ej: Alta rotación sin explicación"
              />
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5 space-y-4">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-stone-800">Modo de evaluación con IA</h2>
            <p className="text-xs text-stone-400">Elegí velocidad o privacidad según tu proceso.</p>
          </div>

          {loadingProviders ? (
            <div className="rounded-lg border border-[var(--border)] bg-stone-50 px-3 py-4 text-sm text-stone-500 flex items-center gap-2">
              <SpinnerIcon className="text-stone-400" /> Cargando opciones de IA…
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setSelectedProvider('lmstudio');
                    const models = providers.find((provider) => provider.id === 'lmstudio')?.models ?? [];
                    setSelectedModel(models[0]?.id);
                  }}
                  className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    selectedProvider === 'lmstudio'
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white border-[var(--border)] text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <p className="text-[12px] font-semibold">Local (Privado)</p>
                  <p className={`text-[11px] mt-0.5 ${selectedProvider === 'lmstudio' ? 'text-white/75' : 'text-stone-400'}`}>
                    Usa IA local en tu entorno.
                  </p>
                </button>
                <button
                  onClick={() => {
                    setSelectedProvider('gemini');
                    const models = providers.find((provider) => provider.id === 'gemini')?.models ?? [];
                    setSelectedModel(models[0]?.id);
                  }}
                  className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    selectedProvider === 'gemini'
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white border-[var(--border)] text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <p className="text-[12px] font-semibold">Nube (Rápido)</p>
                  <p className={`text-[11px] mt-0.5 ${selectedProvider === 'gemini' ? 'text-white/75' : 'text-stone-400'}`}>
                    Usa IA en la nube para respuestas ágiles.
                  </p>
                </button>
              </div>

              {providers.length > 0 && (
                <p className="text-[11px] text-stone-400">
                  {activeProvider?.available === false
                    ? 'Este modo no está disponible ahora.'
                    : `Modo activo: ${activeProvider?.displayName ?? 'Configuración por defecto'}`}
                </p>
              )}

              {activeProvider?.models?.length ? (
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-stone-700">Modelo</label>
                  <select
                    value={selectedModel ?? ''}
                    onChange={(e) => setSelectedModel(e.target.value || undefined)}
                    className="w-full h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-stone-800 input-focus cursor-pointer"
                  >
                    {activeProvider.models.map((model) => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="text-[11px] text-stone-400">
                  No hay modelos listados para este modo. Se usará el modelo por defecto del backend.
                </p>
              )}
            </>
          )}

          <div className="grid gap-2 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-stone-700">Prioridad del proceso</label>
              <select
                value={criterios.prioridadProceso}
                onChange={(e) => setCriterio('prioridadProceso', e.target.value as (typeof criterios)['prioridadProceso'])}
                className="w-full h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-stone-800 input-focus cursor-pointer"
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <p className="text-[11px] text-stone-400">
                {PRIORITY_OPTIONS.find((item) => item.value === criterios.prioridadProceso)?.helper}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-stone-700">Tono del informe</label>
              <select
                value={criterios.tonoInforme}
                onChange={(e) => setCriterio('tonoInforme', e.target.value as (typeof criterios)['tonoInforme'])}
                className="w-full h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-stone-800 input-focus cursor-pointer"
              >
                {TONE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <p className="text-[11px] text-stone-400">
                {TONE_OPTIONS.find((item) => item.value === criterios.tonoInforme)?.helper}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-stone-800">Candidatos a comparar</h2>
            <p className="text-xs text-stone-400">Pegá el resumen o CV de cada persona. Máximo 7000 caracteres por candidato.</p>
          </div>
          <button
            onClick={addCandidate}
            disabled={candidatos.length >= 25}
            className="h-9 px-3 rounded-lg border border-[var(--border)] bg-white text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Agregar candidato manual
          </button>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-stone-50/60 p-3 space-y-3">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-stone-800">Agregar desde CV/documentos escaneados</h3>
            <p className="text-[11px] text-stone-500">
              Podés traer candidatos desde documentos ya cargados. Priorizamos los que están completos.
            </p>
          </div>

          {loadingDocuments ? (
            <div className="rounded-md border border-[var(--border)] bg-white px-3 py-2 text-xs text-stone-500 inline-flex items-center gap-2">
              <SpinnerIcon className="text-stone-400" /> Cargando documentos…
            </div>
          ) : sortedDocuments.length === 0 ? (
            <div className="rounded-md border border-dashed border-[var(--border)] bg-white px-3 py-3 text-xs text-stone-500">
              Todavía no tenés documentos escaneados para usar en esta evaluación.
            </div>
          ) : (
            <>
              <div className="max-h-56 overflow-auto rounded-md border border-[var(--border)] bg-white divide-y divide-[var(--border)]">
                {sortedDocuments.map((document) => {
                  const checked = selectedDocumentIds.includes(document.id);
                  const hasContent = Boolean((document.rawText && document.rawText.trim()) || document.extractedData);
                  return (
                    <label key={document.id} className="flex items-start gap-2.5 p-2.5 cursor-pointer hover:bg-stone-50">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDocument(document.id)}
                        className="mt-0.5 h-4 w-4 rounded border-[var(--border)] text-stone-900"
                      />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-xs font-medium text-stone-700 truncate">{document.originalName}</p>
                        <p className="text-[11px] text-stone-500">
                          {document.status === 'completed' ? 'Completo' : 'Pendiente de completar'}
                          {!hasContent ? ' · Sin texto utilizable' : ''}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleAddFromDocuments}
                  className="h-8 px-3 rounded-lg border border-[var(--border)] bg-white text-xs font-semibold text-stone-700 hover:bg-stone-100"
                >
                  Agregar seleccionados
                </button>
                <p className="text-[11px] text-stone-500">
                  Seleccionados: {selectedDocumentIds.length}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          {candidatos.map((candidate, index) => (
            <article key={candidate.id} className="rounded-lg border border-[var(--border)] bg-stone-50/45 p-3 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-stone-700">Candidato {index + 1}</p>
                <button
                  onClick={() => removeCandidate(candidate.id)}
                  disabled={candidatos.length <= 2}
                  className="h-7 w-7 rounded-md border border-[var(--border)] bg-white text-stone-500 hover:text-rose-600 hover:border-rose-200 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center"
                  title="Quitar candidato"
                >
                  <TrashIcon />
                </button>
              </div>

              <input
                value={candidate.nombre}
                onChange={(e) => updateCandidate(candidate.id, { nombre: e.target.value })}
                maxLength={120}
                placeholder="Nombre"
                className="w-full h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-stone-800 input-focus"
              />

              <textarea
                value={candidate.resumenCv}
                onChange={(e) => updateCandidate(candidate.id, { resumenCv: e.target.value })}
                maxLength={7000}
                rows={8}
                placeholder="Pegá acá el resumen o CV del candidato"
                className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2.5 text-sm text-stone-800 input-focus resize-y"
              />
              <p className="text-[11px] text-stone-400 text-right">
                {candidate.resumenCv.length}/7000
              </p>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={handleEvaluate}
            disabled={evaluando}
            className="h-10 px-5 rounded-lg bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {evaluando ? <><SpinnerIcon className="text-white/70" /> Evaluando candidatos…</> : 'Evaluar y ordenar candidatos'}
          </button>
          <p className="text-xs text-stone-400">
            La evaluación es temporal (v1): no guardamos estos datos en base de datos.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-[var(--error-border)] bg-[var(--error-bg)] px-3 py-2 text-sm text-[var(--error)]">
            {error}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-stone-800">Ranking recomendado</h2>
          <p className="text-xs text-stone-400">Resultados ordenados de mayor a menor ajuste para {resultado?.puesto || 'el puesto'}.</p>
        </div>

        {!resultado ? (
          <div className="rounded-lg border border-dashed border-[var(--border)] bg-stone-50 px-4 py-8 text-center text-sm text-stone-400">
            Cuando evalúes los candidatos, acá vas a ver el ranking con explicación y alertas.
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-[var(--info-border)] bg-[var(--info-bg)] px-3 py-2 text-sm text-stone-700">
              <span className="font-semibold">Resumen:</span> {resultado.resumenGeneral}
            </div>

            <div className="space-y-2.5">
              {resultado.ranking.map((item) => (
                <article key={`${item.orden}-${item.nombre}`} className="rounded-lg border border-[var(--border)] bg-white p-3">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-6 min-w-6 px-2 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold inline-flex items-center justify-center">
                        #{item.orden}
                      </span>
                      <h3 className="text-sm font-semibold text-stone-800 truncate">{item.nombre}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-700">{item.score}/100</span>
                      <span className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${labelStyle[item.etiqueta]}`}>
                        {item.etiqueta}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-stone-600 mt-2 leading-relaxed">{item.explicacion}</p>

                  {item.alertas.length > 0 && (
                    <div className="mt-2.5 rounded-md border border-[var(--warning-border)] bg-[var(--warning-bg)] px-2.5 py-2">
                      <p className="text-[11px] font-semibold text-[var(--warning)] mb-1">Alertas para revisar</p>
                      <ul className="space-y-0.5">
                        {item.alertas.map((alerta) => (
                          <li key={alerta} className="text-[12px] text-stone-700">• {alerta}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
