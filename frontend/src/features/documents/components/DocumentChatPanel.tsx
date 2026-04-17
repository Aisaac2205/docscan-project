import React from 'react';
import { SparkleIcon, SpinnerIcon, SendIcon } from '@/shared/ui/icons';
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
  const showModelSelector = selectedProvider === 'lmstudio' && (activeProvider?.models?.length ?? 0) > 0;

  const effectiveProvider = selectedProvider ?? providers[0]?.id;

  const providerLabel = effectiveProvider === 'lmstudio' ? 'Asistente local' : 'Asistente en nube';
  const providerHelp = effectiveProvider === 'lmstudio'
    ? 'Se ejecuta en tu equipo. Ideal para información sensible.'
    : 'Más capacidad de comprensión para preguntas abiertas.';

  return (
    <div className={`${compact ? '' : 'border-t border-[var(--border)] animate-slide-up'}`}>
      {!compact && (
        <div className="px-4 py-2 bg-stone-50 flex items-center gap-2">
        <SparkleIcon size={11} className="text-stone-400" />
        <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
          Preguntar al documento
        </span>
      </div>
      )}

      {!compact && hasProviderChoice && (
        <div className="px-4 pt-3 pb-2 border-b border-[var(--border)] bg-white">
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
            Estilo de asistencia
          </p>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleProviderChange('lmstudio')}
              disabled={!providers.find((p) => p.id === 'lmstudio')?.available}
              className={`h-8 px-3 rounded-lg border text-xs font-medium transition-colors ${
                selectedProvider === 'lmstudio'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-[var(--border)] hover:bg-stone-50'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Local
            </button>
            <button
              onClick={() => handleProviderChange('gemini')}
              disabled={!providers.find((p) => p.id === 'gemini')?.available}
              className={`h-8 px-3 rounded-lg border text-xs font-medium transition-colors ${
                selectedProvider === 'gemini'
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-[var(--border)] hover:bg-stone-50'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Nube
            </button>
          </div>

          <div className="mt-2 rounded-lg bg-stone-50 border border-[var(--border)] px-3 py-2">
            <p className="text-[11px] font-medium text-stone-700">{providerLabel}</p>
            <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">{providerHelp}</p>
          </div>

          {showModelSelector && (
            <div className="mt-2">
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                Perfil local
              </p>
              {(activeProvider?.models?.length ?? 0) === 1 ? (
                <p className="text-[12px] text-stone-600 px-3 py-2 bg-stone-50 rounded-lg border border-[var(--border)] truncate">
                  {activeProvider?.models[0]?.name}
                </p>
              ) : (
                <select
                  value={selectedModel ?? ''}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full h-9 px-3 border border-[var(--border)] rounded-lg bg-white text-stone-800 text-[12px] cursor-pointer focus:outline-none focus:ring-1 focus:ring-stone-400"
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
                <div className="max-w-[75%] bg-stone-900 text-white text-xs px-3 py-1.5 rounded-xl rounded-tr-sm leading-relaxed">
                  {item.q}
                </div>
              </div>
              {item.a ? (
                <div className="flex justify-start">
                  <div className="max-w-[85%] bg-white border border-[var(--border)] text-stone-700 text-xs px-3 py-1.5 rounded-xl rounded-tl-sm leading-relaxed whitespace-pre-wrap">
                    {item.a}
                  </div>
                </div>
              ) : isSending && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[var(--border)] px-3 py-1.5 rounded-xl rounded-tl-sm flex items-center gap-1.5">
                    <SpinnerIcon size={12} className="text-stone-400" />
                    <span className="text-[11px] text-stone-400">Pensando...</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="px-4 py-2">
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}

      {history.length === 0 && !isSending && (
        <div className="px-4 py-2 flex flex-wrap gap-1.5">
          {SUGGESTED_QUESTIONS.map((hint) => (
            <button
              key={hint}
              onClick={() => handleSend(hint)}
              className="px-2.5 py-1 text-[11px] font-medium rounded-full border border-[var(--border)] text-stone-500 hover:bg-stone-50 transition-colors"
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
          className="flex-1 h-8 px-3 border border-[var(--border)] rounded-lg bg-white text-stone-800 text-xs input-focus"
        />
        <button
          onClick={() => handleSend()}
          disabled={!question.trim() || isSending}
          className="h-8 w-8 flex items-center justify-center bg-stone-900 text-white rounded-lg hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        >
          <SendIcon size={12} />
        </button>
      </div>
    </div>
  );
}
