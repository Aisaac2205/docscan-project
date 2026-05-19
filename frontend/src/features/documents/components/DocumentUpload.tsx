'use client';

import { useDocumentUpload, formatSize } from '../hooks/useDocumentUpload';
import { CheckIcon, UploadIcon, ImageIcon, PdfIcon, FileIcon, CloseIcon, SpinnerIcon, SaveIcon } from '@/shared/ui/icons';
import { Heading } from '@/shared/components/Layout';

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
        <Heading level={2}>Subir documento</Heading>
        <p className="text-body-sm text-fg-tertiary mt-0.5">
          Arrastra un archivo o haz clic para seleccionarlo
        </p>
      </div>

      <div className="max-w-xl">
        <div
          className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
            dragActive
              ? 'border-accent-500 bg-accent-50'
              : uploadedDoc
              ? 'border-success-border bg-success-bg'
              : 'border-border bg-surface-card hover:border-border-strong hover:bg-surface-sunken'
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
              <div className="w-12 h-12 rounded-full bg-success-bg border border-success-border flex items-center justify-center text-success-fg">
                <CheckIcon />
              </div>
              <p className="text-body-sm font-medium text-success-fg">Documento guardado</p>
              <button
                onClick={(e) => { e.stopPropagation(); resetUpload(); }}
                className="text-caption text-fg-tertiary hover:text-fg-secondary transition-colors"
              >
                Subir otro
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-md flex items-center justify-center transition-colors ${
                dragActive ? 'bg-accent-100 text-accent-700' : 'bg-surface-sunken text-fg-tertiary'
              }`}>
                <UploadIcon active={dragActive} />
              </div>
              <div>
                <p className="text-body-sm font-medium text-fg-primary">
                  {dragActive ? 'Suelta el archivo aquí' : 'Arrastra tu archivo aquí'}
                </p>
                <p className="text-caption text-fg-tertiary mt-1">
                  o{' '}
                  <span className="text-fg-link font-medium">haz clic para explorar</span>
                </p>
              </div>
              <p className="text-caption text-fg-disabled">JPG, PNG, PDF · Máx. {MAX_SIZE_MB} MB</p>
            </div>
          )}
        </div>

        {sizeError && (
          <div className="mt-3 px-4 py-3 bg-danger-bg border border-danger-border rounded-md text-danger-fg text-body-sm">
            El archivo supera el límite de {MAX_SIZE_MB} MB.
          </div>
        )}

        {selectedFile && !uploadedDoc && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-surface-card border border-border rounded-md shadow-sm">
            <div className="w-9 h-9 rounded-md bg-surface-sunken border border-border flex items-center justify-center flex-shrink-0 text-fg-tertiary">
              {isImage ? <ImageIcon /> : isPdf ? <PdfIcon size={24} /> : <FileIcon />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-medium text-fg-primary truncate">{selectedFile.name}</p>
              <p className="text-caption text-fg-tertiary mt-0.5">{formatSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={() => clearSelectedFile()}
              className="p-1.5 text-fg-tertiary hover:text-fg-primary hover:bg-surface-sunken rounded-md transition-colors flex-shrink-0"
            >
              <CloseIcon />
            </button>
          </div>
        )}

        {selectedFile && !uploadedDoc && (
          <button
            onClick={handleUpload}
            disabled={loading}
            className="w-full mt-3 h-10 flex items-center justify-center gap-2 bg-fg-primary text-fg-inverse text-button rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
