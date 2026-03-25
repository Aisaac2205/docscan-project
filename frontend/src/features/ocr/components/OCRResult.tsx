'use client';

import { useState } from 'react';
import { OCRResult as OCRResultType } from '@/features/documents/types/document.types';

interface OCRResultProps {
  result: OCRResultType | null;
  onReset?: () => void;
}

export default function OCRResult({ result, onReset }: OCRResultProps) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([result.text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ocr-result.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const data = JSON.stringify(result, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ocr-result.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span>📝</span> Texto Extraído
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Confianza:</span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            result.confidence >= 0.9
              ? 'bg-green-100 text-green-800'
              : result.confidence >= 0.7
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {(result.confidence * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-auto">
        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
          {result.text || 'No se detectó texto en la imagen.'}
        </pre>
      </div>

      <div className="flex flex-wrap gap-3 mt-6">
        <button
          onClick={handleCopy}
          className="flex-1 py-2 px-4 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          {copied ? '✓ Copiado' : '📋 Copiar'}
        </button>
        
        <button
          onClick={handleDownloadTxt}
          className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          📄 TXT
        </button>
        
        <button
          onClick={handleDownloadJson}
          className="flex-1 py-2 px-4 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
        >
          📋 JSON
        </button>

        {onReset && (
          <button
            onClick={onReset}
            className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            🔄 Nuevo
          </button>
        )}
      </div>
    </div>
  );
}
