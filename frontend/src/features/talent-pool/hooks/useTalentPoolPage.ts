'use client';

import { useCallback } from 'react';
import { toast } from '@/shared/ui/toast/store';
import { useTalentPoolStore } from '../store';
import { useCvDocuments } from './useCvDocuments';
import { useOcrProviders } from './useOcrProviders';
import { useCandidateSelection } from './useCandidateSelection';
import { useTalentPoolEvaluation } from './useTalentPoolEvaluation';
import { useTalentPoolHistory } from './useTalentPoolHistory';

/**
 * Orquestador del feature talent-pool. Compone los sub-hooks y resuelve
 * dependencias cruzadas (la evaluación necesita el provider/modelo seleccionado,
 * el picker necesita la lista de CVs). El View solo consume este hook.
 */
export function useTalentPoolPage() {
  // Estado base (store)
  const criterios = useTalentPoolStore((s) => s.criterios);
  const candidatos = useTalentPoolStore((s) => s.candidatos);
  const resultado = useTalentPoolStore((s) => s.resultado);
  const setCriterio = useTalentPoolStore((s) => s.setCriterio);
  const addCandidate = useTalentPoolStore((s) => s.addCandidate);
  const removeCandidate = useTalentPoolStore((s) => s.removeCandidate);
  const updateCandidate = useTalentPoolStore((s) => s.updateCandidate);
  const clearResult = useTalentPoolStore((s) => s.clearResult);
  const resetForm = useTalentPoolStore((s) => s.resetForm);

  // Sub-hooks
  const { documents: cvDocuments, loading: loadingDocuments } = useCvDocuments();
  const ocr = useOcrProviders();
  const selection = useCandidateSelection({ availableDocuments: cvDocuments });
  const evaluation = useTalentPoolEvaluation();
  const history = useTalentPoolHistory();

  // Bridge: la View dispara evaluate() sin args; el orquestador inyecta provider/modelo.
  const evaluate = useCallback(
    () => evaluation.evaluate(ocr.selectedProvider, ocr.selectedModel),
    [evaluation, ocr.selectedProvider, ocr.selectedModel],
  );

  // Limpia criterios + candidatos + resultado. NO toca historial (eso es destructivo aparte).
  const resetFormWithConfirm = useCallback(() => {
    const confirmed = window.confirm(
      '¿Querés limpiar criterios y candidatos? Esta acción no se puede deshacer (el historial no se borra).',
    );
    if (!confirmed) return;
    resetForm();
    selection.clear();
    toast.success('Formulario limpio. Podés arrancar una evaluación nueva.');
  }, [resetForm, selection]);

  return {
    // Criterios + candidatos
    criterios,
    candidatos,
    setCriterio,
    addCandidate,
    removeCandidate,
    updateCandidate,

    // CVs disponibles + picker
    cvDocuments,
    loadingDocuments,
    selectedDocumentIds: selection.selectedIds,
    toggleDocument: selection.toggle,
    addFromDocuments: selection.addSelected,

    // OCR providers
    providers: ocr.providers,
    selectedProvider: ocr.selectedProvider,
    selectedModel: ocr.selectedModel,
    loadingProviders: ocr.loadingProviders,
    selectProvider: ocr.selectProvider,
    selectModel: ocr.selectModel,

    // Evaluación
    evaluate,
    evaluando: evaluation.evaluando,
    evaluationError: evaluation.error,

    // Resultado + control
    resultado,
    clearResult,
    resetForm: resetFormWithConfirm,

    // Historial
    historial: history.historial,
    loadingHistorial: history.loadingHistorial,
    clearingHistory: history.clearingHistory,
    updatingPinRunId: history.updatingPinRunId,
    togglePinned: history.togglePinned,
    clearHistory: history.clearHistory,
  } as const;
}
