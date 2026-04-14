import React from 'react';
import { SparkleIcon, SendIcon, ChatIcon } from '@/shared/ui/icons';

interface QueryHistoryItem {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
}

interface OCRChatPanelProps {
  documentId: string | null;
  queryHistory: QueryHistoryItem[];
  querying: boolean;
  question: string;
  setQuestion: (v: string) => void;
  handleSendQuestion: () => void;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
}

const HINT_QUESTIONS = [
  '¿Cuál es el CUI?',
  '¿Está vencido el documento?',
  '¿Quién firma?',
  '¿Cuál es la fecha de vencimiento?',
];

export function OCRChatPanel({
  documentId, queryHistory, querying,
  question, setQuestion, handleSendQuestion, chatEndRef,
}: OCRChatPanelProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {queryHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-6 gap-2">
            <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-1">
              <ChatIcon size={20} className="text-stone-400" />
            </div>
            <p className="text-sm font-medium text-stone-600">Pregunta al documento</p>
            <p className="text-xs text-stone-400 max-w-[210px] leading-relaxed">
              Haz preguntas en lenguaje natural sobre el contenido del documento
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center mt-2">
              {HINT_QUESTIONS.map((hint) => (
                <button
                  key={hint}
                  onClick={() => setQuestion(hint)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-full border border-[var(--border)] text-stone-500 hover:bg-stone-50 hover:border-stone-300 transition-colors"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        ) : (
          queryHistory.map((item) => (
            <div key={item.id} className="space-y-2">
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-stone-900 text-white text-[12px] px-3.5 py-2.5 rounded-2xl rounded-tr-sm leading-relaxed">
                  {item.question}
                </div>
              </div>
              <div className="flex justify-start items-end gap-2">
                <div className="w-6 h-6 rounded-full bg-stone-100 border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                  <SparkleIcon size={11} className="text-stone-500" />
                </div>
                <div className="max-w-[85%] bg-stone-50 border border-[var(--border)] text-stone-800 text-[12px] px-3.5 py-2.5 rounded-2xl rounded-tl-sm leading-relaxed">
                  {item.answer}
                </div>
              </div>
            </div>
          ))
        )}

        {querying && (
          <div className="flex justify-start items-end gap-2">
            <div className="w-6 h-6 rounded-full bg-stone-100 border border-[var(--border)] flex items-center justify-center flex-shrink-0">
              <SparkleIcon size={11} className="text-stone-500" />
            </div>
            <div className="bg-stone-50 border border-[var(--border)] px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[var(--border)] bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendQuestion()}
            placeholder="Pregunta sobre el documento…"
            disabled={!documentId || querying}
            className="flex-1 h-9 px-3 border border-[var(--border)] rounded-xl bg-white text-stone-800 text-sm input-focus disabled:opacity-50 placeholder:text-stone-300"
          />
          <button
            onClick={handleSendQuestion}
            disabled={!question.trim() || querying || !documentId}
            className="h-9 w-9 flex items-center justify-center bg-stone-900 text-white rounded-xl hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <SendIcon size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
