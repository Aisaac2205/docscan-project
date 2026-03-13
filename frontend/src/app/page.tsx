'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Layout/Header';
import { Sidebar } from '@/components/Layout/Sidebar';
import { ScannerWidget } from '@/components/ScannerWidget/ScannerWidget';
import { DocumentUpload } from '@/components/DocumentUpload/DocumentUpload';
import { OCRResult } from '@/components/OCRResult/OCRResult';
import { useAuth } from '@/hooks/useAuth';
import { useDocuments } from '@/hooks/useDocuments';
import { useOCR } from '@/hooks/useOCR';
import { Document } from '@/types/document.types';

export default function Home() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { documents, fetchDocuments, deleteDocument, loading: docsLoading } = useDocuments();
  const { result, reset } = useOCR();
  const [activeTab, setActiveTab] = useState('scan');
  const [ocrResult, setOcrResult] = useState<{ text: string; confidence: number } | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
    } else {
      fetchDocuments();
    }
  }, [getToken, router, fetchDocuments]);

  const handleScanComplete = (text: string, confidence: number) => {
    setOcrResult({ text, confidence });
    setActiveTab('result');
  };

  const handleUploadComplete = (text: string, confidence: number) => {
    setOcrResult({ text, confidence });
    setActiveTab('result');
    fetchDocuments();
  };

  const handleDeleteDoc = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este documento?')) {
      await deleteDocument(id);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'scan':
        return (
          <div className="space-y-6">
            <ScannerWidget onScanComplete={handleScanComplete} />
            {ocrResult && (
              <OCRResult
                result={{ ...ocrResult, documentId: '' }}
                onReset={() => {
                  reset();
                  setOcrResult(null);
                }}
              />
            )}
          </div>
        );
      case 'upload':
        return (
          <div className="space-y-6">
            <DocumentUpload onUploadComplete={handleUploadComplete} />
            {ocrResult && (
              <OCRResult
                result={{ ...ocrResult, documentId: '' }}
                onReset={() => {
                  reset();
                  setOcrResult(null);
                }}
              />
            )}
          </div>
        );
      case 'documents':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span>📁</span> Mis Documentos
            </h2>

            {docsLoading ? (
              <div className="text-center py-8 text-gray-500">Cargando...</div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-4xl mb-4">📄</p>
                <p>No hay documentos todavía</p>
                <p className="text-sm">Escanea o sube un documento para comenzar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc: Document) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-2xl">
                        {doc.mimeType.includes('pdf') ? '📕' : '📄'}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800">{doc.originalName}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(doc.createdAt)} • {doc.mimeType}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        doc.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : doc.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : doc.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {doc.status}
                      </span>
                      {doc.confidence && (
                        <span className="text-xs text-gray-500">
                          {(doc.confidence * 100).toFixed(0)}%
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'result':
        return (
          <OCRResult
            result={ocrResult ? { ...ocrResult, documentId: '' } : null}
            onReset={() => {
              reset();
              setOcrResult(null);
              setActiveTab('scan');
            }}
          />
        );
      default:
        return null;
    }
  };

  const token = getToken();
  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
