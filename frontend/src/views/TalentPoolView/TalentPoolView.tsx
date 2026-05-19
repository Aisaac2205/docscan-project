'use client';

import { useEffect, useState } from 'react';
import { ocrClient } from '@/features/ocr/client';
import type { ProviderId, ProviderInfo } from '@/features/ocr/types/ocr.types';
import { toast } from '@/shared/ui/toast/store';
import { SpinnerIcon } from '@/shared/ui/icons';
import { Heading } from '@/shared/components/Layout';
import { useTalentPoolStore } from '@/features/talent-pool/store';
import { documentsClient } from '@/features/documents/client';
import type { Document } from '@/features/documents/types/document.types';
import { CriteriaForm } from '@/features/talent-pool/components/CriteriaForm';
import { EvaluationPanel } from '@/features/talent-pool/components/EvaluationPanel';
import { DocumentPicker } from '@/features/talent-pool/components/DocumentPicker';
import { CandidateCard } from '@/features/talent-pool/components/CandidateCard';
import { RankingResult } from '@/features/talent-pool/components/RankingResult';
import { HistorySection } from '@/features/talent-pool/components/HistorySection';

export function TalentPoolView() {
  const {
    criterios,
    candidatos,
    resultado,
    historial,
    loadingHistorial,
    clearingHistory,
    updatingPinRunId,
    evaluando,
    error,
    setCriterio,
    addCandidate,
    removeCandidate,
    updateCandidate,
    addCandidatesFromDocuments,
    evaluate,
    loadHistory,
    togglePinned,
    clearHistory,
  } = useTalentPoolStore();
  /**
   * Solo CVs. Fetch local desacoplado del store global para no contaminar
   * otras vistas con el filtro `type=cv`. limit=200 cubre el caso real;
   * el día que se supere, paginar el picker.
   */
  const [cvDocuments, setCvDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>('gemini');
  const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadProviders = async () => {
      try {
        setLoadingProviders(true);
        const fetched = await ocrClient.getProviders();
        if (!mounted) return;

        const available = fetched.filter((p) => p.available);
        setProviders(available);

        const preferred = available.find((p) => p.id === 'gemini')
          ?? available.find((p) => p.id === 'lmstudio');

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
    let active = true;
    setLoadingDocuments(true);
    documentsClient
      .list({ type: 'cv', limit: 200, sort: 'createdAt', order: 'desc' })
      .then((response) => {
        if (active) setCvDocuments(response.data);
      })
      .catch(() => {
        if (active) toast.info('No pudimos cargar los CV/documentos escaneados por ahora.');
      })
      .finally(() => {
        if (active) setLoadingDocuments(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    loadHistory(20).catch(() => {
      toast.info('No pudimos cargar el historial de evaluaciones por ahora.');
    });
  }, [loadHistory]);

  const validate = (): string | null => {
    if (!criterios.puesto.trim()) return 'Completá el campo "Puesto".';
    if (!criterios.objetivoRol.trim()) return 'Completá el campo "Objetivo del rol".';
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

  const handleToggleDocument = (id: string) => {
    setSelectedDocumentIds((prev) => (
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    ));
  };

  const handleAddFromDocuments = () => {
    if (selectedDocumentIds.length === 0) {
      toast.info('Seleccioná al menos un CV para agregarlo.');
      return;
    }

    const selected = cvDocuments.filter((d) => selectedDocumentIds.includes(d.id));
    const result = addCandidatesFromDocuments(selected);

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

  const handleTogglePinned = async (runId: string, nextPinned: boolean) => {
    const success = await togglePinned(runId, nextPinned);
    if (success) {
      toast.success(nextPinned ? 'Evaluación fijada en historial.' : 'Evaluación desfijada del historial.');
      return;
    }
    toast.error('No pudimos actualizar el estado fijado de esta evaluación.');
  };

  const handleClearHistory = async () => {
    if (historial.length === 0) {
      toast.info('No hay evaluaciones en historial para eliminar.');
      return;
    }

    const confirmation = window.prompt(
      'Esta acción elimina TODO el historial de evaluaciones de tu cuenta y no se puede deshacer. Escribí ELIMINAR para confirmar.',
    );

    if (confirmation !== 'ELIMINAR') {
      toast.info('Cancelado. Para confirmar el borrado, escribí ELIMINAR exactamente.');
      return;
    }

    const deletedCount = await clearHistory();
    if (deletedCount === null) {
      toast.error('No pudimos eliminar el historial por ahora.');
      return;
    }

    if (deletedCount === 0) {
      toast.info('No encontramos evaluaciones para eliminar.');
      return;
    }

    toast.success(`Historial eliminado: ${deletedCount} evaluación(es).`);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <header className="space-y-1">
        <Heading level={1}>Bolsa de talento</Heading>
        <p className="text-body-sm text-fg-secondary max-w-3xl">
          Compará candidatos de forma clara para RRHH. Cargás criterios, pegás CVs y obtenés un ranking con recomendaciones simples.
        </p>
      </header>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_1fr] items-start">
        <CriteriaForm criterios={criterios} setCriterio={setCriterio} />
        <EvaluationPanel
          providers={providers}
          selectedProvider={selectedProvider}
          selectedModel={selectedModel}
          loadingProviders={loadingProviders}
          criterios={criterios}
          onProviderSelect={(provider, firstModelId) => {
            setSelectedProvider(provider);
            setSelectedModel(firstModelId);
          }}
          onModelSelect={setSelectedModel}
          setCriterio={setCriterio}
        />
      </section>

      <section className="rounded-md border border-border bg-surface-card p-4 md:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <Heading level={4} as="h2" className="text-fg-primary">Candidatos a comparar</Heading>
            <p className="text-caption text-fg-tertiary">Pegá el resumen o CV de cada persona. Máximo 7000 caracteres por candidato.</p>
          </div>
          <button
            onClick={addCandidate}
            disabled={candidatos.length >= 25}
            className="h-9 px-3 rounded-md border border-border bg-surface-card text-button-sm text-fg-secondary hover:bg-surface-sunken disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Agregar candidato manual
          </button>
        </div>

        <DocumentPicker
          documents={cvDocuments}
          loading={loadingDocuments}
          selectedIds={selectedDocumentIds}
          onToggle={handleToggleDocument}
          onAddSelected={handleAddFromDocuments}
        />

        <div className="grid gap-3 lg:grid-cols-2">
          {candidatos.map((candidate, index) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              index={index}
              isRemoveDisabled={candidatos.length <= 2}
              onRemove={removeCandidate}
              onUpdate={updateCandidate}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={handleEvaluate}
            disabled={evaluando}
            className="h-10 px-5 rounded-md bg-fg-primary text-fg-inverse text-button hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {evaluando ? <><SpinnerIcon /> Evaluando candidatos…</> : 'Evaluar y ordenar candidatos'}
          </button>
          <p className="text-caption text-fg-tertiary">
            Cada evaluación se guarda en historial para seguimiento del proceso.
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-danger-border bg-danger-bg px-3 py-2 text-body-sm text-danger-fg">
            {error}
          </div>
        )}
      </section>

      <section className="rounded-md border border-border bg-surface-card p-4 md:p-5 space-y-4">
        <div>
          <Heading level={4} as="h2" className="text-fg-primary">Resultado actual</Heading>
          <p className="text-caption text-fg-tertiary">Priorizamos la última corrida para decidir rápido, y debajo queda el historial.</p>
        </div>

        {!resultado ? (
          <div className="rounded-md border border-dashed border-border bg-surface-sunken px-4 py-8 text-center text-body-sm text-fg-tertiary">
            Cuando evalúes los candidatos, acá vas a ver el ranking actual con explicación y alertas.
          </div>
        ) : (
          <RankingResult
            resultado={resultado}
            updatingPinRunId={updatingPinRunId}
            onTogglePinned={handleTogglePinned}
          />
        )}
      </section>

      <HistorySection
        historial={historial}
        loadingHistorial={loadingHistorial}
        clearingHistory={clearingHistory}
        updatingPinRunId={updatingPinRunId}
        onTogglePinned={handleTogglePinned}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
