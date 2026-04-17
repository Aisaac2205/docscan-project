import { useEffect, useMemo, useState } from 'react';
import { useOCRStore } from '../../ocr/store';
import { ocrClient } from '../../ocr/client';
import type { ProviderId, ProviderInfo } from '../../ocr/types/ocr.types';

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
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderId | undefined>(undefined);
  const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);

  useEffect(() => {
    ocrClient.getProviders()
      .then((list) => {
        setProviders(list);

        const firstAvailable = list.find((p) => p.available);
        if (firstAvailable) {
          setSelectedProvider(firstAvailable.id);
          setSelectedModel(firstAvailable.models[0]?.id);
        }
      })
      .catch(() => {
        setProviders([]);
      });
  }, []);

  const activeProvider = useMemo(
    () => providers.find((p) => p.id === selectedProvider),
    [providers, selectedProvider],
  );

  const handleProviderChange = (id: ProviderId) => {
    setSelectedProvider(id);
    const provider = providers.find((p) => p.id === id);
    setSelectedModel(provider?.models[0]?.id);
  };

  const handleSend = async (q?: string) => {
    const textQuery = (q ?? question).trim();
    if (!textQuery || isSending) return;

    setQuestion('');
    setIsSending(true);
    setError(null);
    setHistory((prev) => [...prev, { q: textQuery, a: '' }]);

    const result = await queryDocument(docId, textQuery, selectedProvider, selectedModel);
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
    providers,
    selectedProvider,
    selectedModel,
    activeProvider,
    handleProviderChange,
    setSelectedModel,
    handleSend,
  };
}
