import { useState } from 'react';
import { useOCRStore } from '../../ocr/store';

interface ChatMessage {
  q: string;
  a: string;
}

export function useDocumentChat(docId: string) {
  const { queryDocument } = useOCRStore();
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async (q?: string) => {
    const textQuery = (q ?? question).trim();
    if (!textQuery || isSending) return;

    setQuestion('');
    setIsSending(true);
    setError(null);
    setHistory((prev) => [...prev, { q: textQuery, a: '' }]);

    const result = await queryDocument(docId, textQuery);
    if (result?.answer) {
      setHistory((prev) =>
        prev.map((item, i, arr) =>
          i === arr.length - 1 && item.a === '' ? { ...item, a: result.answer } : item
        )
      );
    } else {
      setHistory((prev) => prev.filter((item) => item.a !== ''));
      setError('No se pudo obtener respuesta. Intenta de nuevo.');
    }
    setIsSending(false);
  };

  return {
    question,
    setQuestion,
    history,
    isSending,
    error,
    handleSend,
  };
}
