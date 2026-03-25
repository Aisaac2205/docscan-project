import React from 'react';
import { SparkleIcon, SpinnerIcon, SendIcon } from '@/shared/ui/icons';
import type { useDocumentChat } from '../hooks/useDocumentChat';

interface DocumentChatPanelProps {
  chat: ReturnType<typeof useDocumentChat>;
}

const SUGGESTED_QUESTIONS = [
  '¿Cuál es el total?',
  '¿Quién emite este documento?',
  '¿Está vencido?',
  '¿Qué tipo de documento es?',
];

export function DocumentChatPanel({ chat }: DocumentChatPanelProps) {
  const { question, setQuestion, history, isSending, error, handleSend } = chat;

  return (
    <div className="border-t border-[var(--border)] animate-slide-up">
      <div className="px-4 py-2 bg-stone-50 flex items-center gap-2">
        <SparkleIcon size={11} className="text-stone-400" />
        <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
          Preguntar al documento con Gemini
        </span>
      </div>

      {history.length > 0 && (
        <div className="px-4 py-3 space-y-3 max-h-56 overflow-y-auto">
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
          className="flex-1 h-8 px-3 border border-[var(--border)] rounded-lg bg-white text-stone-800 text-xs focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-900/10 transition-all"
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
