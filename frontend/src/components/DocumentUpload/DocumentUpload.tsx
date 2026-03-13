'use client';

import { useState, useCallback } from 'react';
import { useOCR } from '@/hooks/useOCR';
import { useDocuments } from '@/hooks/useDocuments';

interface DocumentUploadProps {
  onUploadComplete?: (text: string, confidence: number) => void;
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const { processImage, processing, result, error, progress } = useOCR();
  const { uploadDocument } = useDocuments();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        setSelectedFile(file);
        await processImage(file);
      }
    }
  }, [processImage]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setSelectedFile(file);
      await processImage(file);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await uploadDocument(selectedFile);
      if (result && onUploadComplete) {
        onUploadComplete(result.text, result.confidence);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>📤</span> Subir Documento
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          disabled={processing}
        />
        
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="text-4xl mb-4">📁</div>
          <p className="text-gray-700 font-medium mb-2">
            Arrastra y suelta tu archivo aquí
          </p>
          <p className="text-gray-500 text-sm">
            o haz clic para seleccionar
          </p>
          <p className="text-gray-400 text-xs mt-2">
            Formatos soportados: JPG, PNG, PDF
          </p>
        </label>
      </div>

      {selectedFile && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div className="flex-1">
              <p className="font-medium text-gray-700">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
        </div>
      )}

      {processing && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Procesando OCR...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <span>✅</span>
            <span className="font-medium">OCR Completado</span>
            <span className="text-sm">(Confianza: {(result.confidence * 100).toFixed(1)}%)</span>
          </div>
        </div>
      )}

      {selectedFile && result && (
        <button
          onClick={handleUpload}
          className="w-full mt-4 py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
        >
          💾 Guardar Documento
        </button>
      )}
    </div>
  );
}
