'use client';

import { useDocumentUpload, formatSize } from './useDocumentUpload';
import { CheckIcon, UploadIcon, ImageIcon, PdfIcon, FileIcon, CloseIcon, SpinnerIcon, SaveIcon } from '@/shared/ui/icons';

interface DocumentUploadProps {
  onUploadComplete?: (documentId: string) => void;
}

export function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const {
    dragActive, selectedFile, uploadedDoc, sizeError, loading,
    ACCEPT_TYPES, MAX_SIZE_MB,
    handleDrag, handleDrop, handleFileChange, handleUpload, resetUpload, clearSelectedFile,
  } = useDocumentUpload({ onUploadComplete });

  const isImage = selectedFile?.type.startsWith('image/');
  const isPdf = selectedFile?.type === 'application/pdf';

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-stone-900">Subir documento</h2>
        <p className="text-sm text-stone-400 mt-0.5">
          Arrastra un archivo o haz clic para seleccionarlo
        </p>
      </div>

      <div className="max-w-xl">
        <div
          className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-accent-500 bg-accent-50'
              : uploadedDoc
              ? 'border-[var(--success-border)] bg-[var(--success-bg)]'
              : 'border-[var(--border)] bg-white hover:border-stone-300 hover:bg-stone-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !loading && document.getElementById('file-upload')?.click()}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept={ACCEPT_TYPES}
            onChange={handleFileChange}
            disabled={loading}
          />

          {uploadedDoc ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[var(--success-bg)] border border-[var(--success-border)] flex items-center justify-center">
                <CheckIcon />
              </div>
              <p className="text-sm font-medium text-[var(--success)]">Documento guardado</p>
              <button
                onClick={(e) => { e.stopPropagation(); resetUpload(); }}
                className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
              >
                Subir otro
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                dragActive ? 'bg-accent-100' : 'bg-stone-100'
              }`}>
                <UploadIcon active={dragActive} />
              </div>
              <div>
                <p className="text-sm font-medium text-stone-700">
                  {dragActive ? 'Suelta el archivo aquí' : 'Arrastra tu archivo aquí'}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  o{' '}
                  <span className="text-accent-600 font-medium">haz clic para explorar</span>
                </p>
              </div>
              <p className="text-xs text-stone-300">JPG, PNG, PDF · Máx. {MAX_SIZE_MB} MB</p>
            </div>
          )}
        </div>

        {sizeError && (
          <div className="mt-3 px-4 py-3 bg-[var(--error-bg)] border border-[var(--error-border)] rounded-md text-[var(--error)] text-sm">
            El archivo supera el límite de {MAX_SIZE_MB} MB.
          </div>
        )}

        {selectedFile && !uploadedDoc && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-white border border-[var(--border)] rounded-lg shadow-[var(--shadow-card)]">
            <div className="w-9 h-9 rounded-md bg-stone-50 border border-[var(--border)] flex items-center justify-center flex-shrink-0">
              {isImage ? <ImageIcon /> : isPdf ? <PdfIcon /> : <FileIcon />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800 truncate">{selectedFile.name}</p>
              <p className="text-xs text-stone-400 mt-0.5">{formatSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={() => clearSelectedFile()}
              className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded transition-colors flex-shrink-0"
            >
              <CloseIcon />
            </button>
          </div>
        )}

        {selectedFile && !uploadedDoc && (
          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full mt-3 h-10 flex items-center justify-center gap-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <><SpinnerIcon />Guardando...</>
            ) : (
              <><SaveIcon />Guardar documento</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default DocumentUpload;
