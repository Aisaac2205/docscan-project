'use client';

import { SpinnerIcon } from '@/shared/ui/icons';
import { Heading } from '@/shared/components/Layout';
import { useTalentPoolPage } from '@/features/talent-pool/hooks/useTalentPoolPage';
import { CriteriaForm } from '@/features/talent-pool/components/CriteriaForm';
import { EvaluationPanel } from '@/features/talent-pool/components/EvaluationPanel';
import { DocumentPicker } from '@/features/talent-pool/components/DocumentPicker';
import { CandidateCard } from '@/features/talent-pool/components/CandidateCard';
import { RankingResult } from '@/features/talent-pool/components/RankingResult';
import { HistorySection } from '@/features/talent-pool/components/HistorySection';

const PRIMARY_BUTTON_CLASS =
  'h-10 px-5 rounded-md bg-fg-primary text-fg-inverse text-button hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]';

export function TalentPoolView() {
  const {
    criterios,
    candidatos,
    setCriterio,
    addCandidate,
    removeCandidate,
    updateCandidate,
    cvDocuments,
    loadingDocuments,
    selectedDocumentIds,
    toggleDocument,
    addFromDocuments,
    providers,
    selectedProvider,
    selectedModel,
    loadingProviders,
    selectProvider,
    selectModel,
    evaluate,
    evaluando,
    evaluationError,
    resultado,
    clearResult,
    resetForm,
    historial,
    loadingHistorial,
    clearingHistory,
    updatingPinRunId,
    togglePinned,
    clearHistory,
  } = useTalentPoolPage();

  const evaluateButtonLabel = evaluando ? (
    <>
      <SpinnerIcon /> Evaluando candidatos…
    </>
  ) : (
    'Evaluar y ordenar candidatos'
  );

  return (
    <div className="animate-fade-in space-y-6 md:space-y-8">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-overline text-overline-uppercase text-fg-tertiary mb-0.5">
            RRHH
          </p>
          <Heading level={1}>Bolsa de talento</Heading>
          <p className="text-body-sm text-fg-tertiary mt-0.5 max-w-3xl">
            Compará candidatos de forma clara para RRHH. Cargás criterios, pegás CVs y obtenés un ranking con recomendaciones simples.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={resetForm}
            className="h-9 px-3 rounded-md border border-border bg-surface-card text-button-sm text-fg-secondary hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
          >
            Limpiar formulario
          </button>
        </div>
      </header>

      {/* ── Error banner ─────────────────────────────────────────────────── */}
      {evaluationError && (
        <div
          role="alert"
          className="px-3 py-2 bg-danger-bg border border-danger-border rounded-md text-body-sm text-danger-fg flex items-center justify-between gap-3"
        >
          <span>{evaluationError}</span>
          <button
            type="button"
            onClick={clearResult}
            className="text-caption underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] rounded-sm"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* ── Workspace: rail sticky (xl) + columna principal ──────────────── */}
      <div className="grid gap-6 md:gap-8 xl:grid-cols-[minmax(0,420px)_1fr] xl:items-start">

        {/* ── Rail: criterios + modo IA + CTA evaluar ─────────────────── */}
        <aside
          aria-label="Configuración de la evaluación"
          className="space-y-4 md:space-y-6 xl:sticky xl:top-[calc(var(--header-height)+1rem)]"
        >
          <section aria-labelledby="talent-criteria-heading" className="space-y-4 md:space-y-6">
            <h2 id="talent-criteria-heading" className="sr-only">Criterios y modo de evaluación</h2>
            <CriteriaForm criterios={criterios} setCriterio={setCriterio} />
            <EvaluationPanel
              providers={providers}
              selectedProvider={selectedProvider}
              selectedModel={selectedModel}
              loadingProviders={loadingProviders}
              criterios={criterios}
              onProviderSelect={selectProvider}
              onModelSelect={selectModel}
              setCriterio={setCriterio}
            />
          </section>

          {/* CTA primaria — solo desktop. En mobile va abajo de Candidatos */}
          <div className="hidden xl:flex flex-col gap-2 rounded-md border border-border bg-surface-card p-4">
            <button
              type="button"
              onClick={evaluate}
              disabled={evaluando}
              className={PRIMARY_BUTTON_CLASS + ' w-full'}
            >
              {evaluateButtonLabel}
            </button>
            <p className="text-caption text-fg-tertiary">
              Cada evaluación se guarda en historial para seguimiento del proceso.
            </p>
          </div>
        </aside>

        {/* ── Columna principal: candidatos → resultado → historial ────── */}
        <div className="space-y-6 md:space-y-8 min-w-0">

          {/* ── Candidatos ─────────────────────────────────────────────── */}
          <section
            aria-labelledby="talent-candidates-heading"
            className="rounded-md border border-border bg-surface-card p-4 md:p-5 space-y-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Heading id="talent-candidates-heading" level={4} as="h2" className="text-fg-primary">
                  Candidatos a comparar
                </Heading>
                <p className="text-caption text-fg-tertiary mt-0.5">
                  Pegá el resumen o CV de cada persona. Máximo 7000 caracteres por candidato.
                </p>
              </div>
              <button
                onClick={addCandidate}
                disabled={candidatos.length >= 25}
                className="h-9 px-3 rounded-md border border-border bg-surface-card text-button-sm text-fg-secondary hover:bg-surface-sunken disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
              >
                + Agregar candidato manual
              </button>
            </div>

            <DocumentPicker
              documents={cvDocuments}
              loading={loadingDocuments}
              selectedIds={selectedDocumentIds}
              onToggle={toggleDocument}
              onAddSelected={addFromDocuments}
            />

            <div className="grid gap-3 lg:grid-cols-1 2xl:grid-cols-2">
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

            {/* CTA primaria — solo mobile/tablet. En xl: vive en el rail */}
            <div className="xl:hidden flex flex-wrap items-center gap-3 border-t border-border-subtle -mx-4 md:-mx-5 px-4 md:px-5 pt-4">
              <button
                type="button"
                onClick={evaluate}
                disabled={evaluando}
                className={PRIMARY_BUTTON_CLASS}
              >
                {evaluateButtonLabel}
              </button>
              <p className="text-caption text-fg-tertiary">
                Cada evaluación se guarda en historial.
              </p>
            </div>
          </section>

          {/* ── Resultado actual ───────────────────────────────────────── */}
          <section
            aria-labelledby="talent-result-heading"
            className="rounded-md border border-border bg-surface-card p-4 md:p-5 space-y-4"
          >
            <div>
              <Heading id="talent-result-heading" level={4} as="h2" className="text-fg-primary">
                Resultado actual
              </Heading>
              <p className="text-caption text-fg-tertiary mt-0.5">
                Priorizamos la última corrida para decidir rápido, y debajo queda el historial.
              </p>
            </div>

            {!resultado ? (
              <div className="rounded-md border border-dashed border-border bg-surface-sunken px-4 py-8 text-center text-body-sm text-fg-tertiary">
                Cuando evalúes los candidatos, acá vas a ver el ranking actual con explicación y alertas.
              </div>
            ) : (
              <RankingResult
                resultado={resultado}
                updatingPinRunId={updatingPinRunId}
                onTogglePinned={togglePinned}
              />
            )}
          </section>

          {/* ── Historial ──────────────────────────────────────────────── */}
          <HistorySection
            historial={historial}
            loadingHistorial={loadingHistorial}
            clearingHistory={clearingHistory}
            updatingPinRunId={updatingPinRunId}
            onTogglePinned={togglePinned}
            onClearHistory={clearHistory}
          />
        </div>
      </div>
    </div>
  );
}
