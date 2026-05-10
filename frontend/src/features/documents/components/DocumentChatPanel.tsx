import React from 'react';
import { SparkleIcon, SpinnerIcon, SendIcon } from '@/shared/ui/icons';
import { MarkdownRenderer } from '@/shared/components/MarkdownRenderer/MarkdownRenderer';
import type { useDocumentChat } from '../hooks/useDocumentChat';

interface DocumentChatPanelProps {
  chat: ReturnType<typeof useDocumentChat>;
  compact?: boolean;
}

const SUGGESTED_QUESTIONS = [
  '¿Cuál es el total?',
  '¿Quién emite este documento?',
  '¿Está vencido?',
  '¿Qué tipo de documento es?',
];

export function DocumentChatPanel({ chat, compact = false }: DocumentChatPanelProps) {
  const {
    question,
    setQuestion,
    history,
    isSending,
    error,
    handleSend,
    providers,
    selectedProvider,
    selectedModel,
    activeProvider,
    handleProviderChange,
    setSelectedModel,
  } = chat;
  const maxHeight = compact ? 'max-h-40' : 'max-h-[calc(100%-120px)]';
  const availableProviders = providers.filter((p) => p.available);
  const hasProviderChoice = availableProviders.length > 1;
  const showModelSelector = (activeProvider?.models?.length ?? 0) > 0;

  const effectiveProvider = selectedProvider ?? providers[0]?.id;
  const effectiveProviderInfo = providers.find((p) => p.id === effectiveProvider);

  const providerLabel = effectiveProviderInfo?.displayName ?? 'Asistente';
  const providerHelp = effectiveProvider === 'lmstudio'
    ? 'Se ejecuta en tu equipo. Ideal para información sensible.'
    : 'Más capacidad de comprensión para preguntas abiertas.';

  return (
    <div className={`${compact ? '' : 'border-t border-border animate-slide-up'}`}>
      {!compact && (
        <div className="px-4 py-2 bg-surface-sunken flex items-center gap-2">
          <SparkleIcon size={11} className="text-fg-tertiary" />
          <span className="text-overline text-overline-uppercase text-fg-tertiary">
            Preguntar al documento
          </span>
        </div>
      )}

      {!compact && hasProviderChoice && (
        <div className="px-4 pt-3 pb-2 border-b border-border bg-surface-card">
          <p className="text-overline text-overline-uppercase text-fg-secondary mb-2">
            Estilo de asistencia
          </p>

          <div className="grid grid-cols-2 gap-1.5">
            {providers.filter((p) => p.available).map((p) => (
              <button
                key={p.id}
                onClick={() => handleProviderChange(p.id)}
                disabled={!p.available}
                className={`h-8 lg:h-9 px-3 lg:px-4 rounded-md border text-button-sm transition-colors ${
                  selectedProvider === p.id
                    ? 'bg-fg-primary text-fg-inverse border-fg-primary'
                    : 'bg-surface-card text-fg-secondary border-border hover:bg-surface-sunken'
                } disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {p.displayName}
              </button>
            ))}
          </div>

          <div className="mt-2 rounded-md bg-surface-sunken border border-border px-3 lg:px-4 py-2">
            <p className="text-caption text-fg-primary">{providerLabel}</p>
            <p className="text-caption text-fg-secondary mt-0.5 leading-relaxed">{providerHelp}</p>
          </div>

          {showModelSelector && (
            <div className="mt-2">
              <p className="text-overline text-overline-uppercase text-fg-tertiary mb-1.5">
                Modelo
              </p>
              {(activeProvider?.models?.length ?? 0) === 1 ? (
                <p className="text-body-sm text-fg-secondary px-3 lg:px-4 py-2 bg-surface-sunken rounded-md border border-border truncate">
                  {activeProvider?.models[0]?.name}
                </p>
              ) : (
                <select
                  value={selectedModel ?? ''}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full h-9 lg:h-10 px-3 lg:px-4 border border-border rounded-md bg-surface-card text-fg-primary text-body-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]"
                >
                  {activeProvider?.models.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className={`px-4 py-3 space-y-3 overflow-y-auto ${maxHeight}`}>
          {history.map((item, i) => (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-end">
                <div className="max-w-[75%] bg-fg-primary text-fg-inverse text-body-sm px-3 lg:px-4 py-1.5 rounded-xl rounded-tr-sm leading-relaxed">
                  {item.q}
                </div>
              </div>
              {item.a ? (
                <div className="flex justify-start">
                  <div className="max-w-[85%] bg-surface-card border border-border text-fg-secondary text-body-sm px-3 lg:px-4 py-2 rounded-xl rounded-tl-sm leading-relaxed">
                    <MarkdownRenderer text={item.a} />
                  </div>
                </div>
              ) : isSending && (
                <div className="flex justify-start">
                  <div className="bg-surface-card border border-border px-3 lg:px-4 py-1.5 rounded-xl rounded-tl-sm flex items-center gap-1.5">
                    <SpinnerIcon size={12} className="text-fg-tertiary" />
                    <span className="text-caption text-fg-tertiary">Pensando...</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="px-4 py-2">
          <p className="text-body-sm text-danger-fg">{error}</p>
        </div>
      )}

      {history.length === 0 && !isSending && (
        <div className="px-4 py-2 flex flex-wrap gap-1.5">
          {SUGGESTED_QUESTIONS.map((hint) => (
            <button
              key={hint}
              onClick={() => handleSend(hint)}
              className="px-2.5 py-1 text-caption font-medium rounded-full border border-border text-fg-secondary hover:bg-surface-sunken transition-colors"
            >
              {hint}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 pb-3 pt-2 flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) handleSend();
          }}
          placeholder="Escribe tu pregunta..."
          className="flex-1 h-9 px-3 border border-border rounded-md bg-surface-card text-fg-primary text-body-sm placeholder:text-fg-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]"
        />
        <button
          onClick={() => handleSend()}
          disabled={!question.trim() || isSending}
          className="h-9 w-9 flex items-center justify-center bg-fg-primary text-fg-inverse rounded-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          <SendIcon size={12} />
        </button>
      </div>
    </div>
  );
}
