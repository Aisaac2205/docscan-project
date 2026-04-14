import { OcrIcon, ChatIcon } from '@/shared/ui/icons';
import type { OCRResponse } from '@/features/ocr/types/ocr.types';
import { EXTRACTION_MODE_LABELS } from '@/features/ocr/types/ocr.types';
import { formatValue } from '../utils/format';

// Inline icons — específicos de este panel
function CopyIcon({ size = 13, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 13 13" fill="none" className={className}>
      <rect x="4" y="4" width="8" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 9H1.5A.5.5 0 0 1 1 8.5v-7A.5.5 0 0 1 1.5 1h7a.5.5 0 0 1 .5.5V2"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function CheckSmallIcon({ size = 13, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 13 13" fill="none" className={className}>
      <path d="M2.5 6.5l3 3 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon({ size = 12, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className={className}>
      <path d="M6 1v7M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1 10h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

interface OCRResultPanelProps {
  ocrResult: OCRResponse | null;
  copiedKey: string | null;
  copyField: (key: string, value: string) => void;
  exportJson: () => void;
  onGoToChat: () => void;
  onGoToConfig: () => void;
}

export function OCRResultPanel({
  ocrResult, copiedKey, copyField, exportJson, onGoToChat, onGoToConfig,
}: OCRResultPanelProps) {
  if (!ocrResult?.extractedData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-2">
        <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center mb-1">
          <OcrIcon size={20} className="text-stone-400" />
        </div>
        <p className="text-sm font-medium text-stone-600">Sin datos extraídos aún</p>
        <p className="text-xs text-stone-400 max-w-[200px] leading-relaxed">
          Ve a Extracción y presiona &ldquo;Extraer datos con OCR&rdquo;
        </p>
        <button
          onClick={onGoToConfig}
          className="mt-3 h-8 px-4 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
        >
          Ir a Extracción
        </button>
      </div>
    );
  }

  const fieldCount = Object.keys(ocrResult.extractedData).length;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-stone-700">
            {fieldCount} campo{fieldCount !== 1 ? 's' : ''} extraído{fieldCount !== 1 ? 's' : ''}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 font-medium border border-[var(--border)]">
            {EXTRACTION_MODE_LABELS[ocrResult.extractionMode] ?? ocrResult.extractionMode}
          </span>
        </div>
        <button
          onClick={exportJson}
          className="h-6 px-2.5 flex items-center gap-1 text-[10px] font-semibold border border-[var(--border)] text-stone-500 bg-white rounded-md hover:bg-stone-50 hover:text-stone-800 transition-colors"
        >
          <DownloadIcon size={11} />JSON
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {Object.entries(ocrResult.extractedData).map(([key, value]) => {
          const formatted = formatValue(value);
          const copied = copiedKey === key;
          return (
            <div
              key={key}
              className="group bg-white rounded-lg px-3 py-2.5 border border-[var(--border)] hover:border-stone-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-1 flex-1">
                  {key.replace(/_/g, ' ')}
                </p>
                <button
                  onClick={() => copyField(key, formatted)}
                  title="Copiar valor"
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 flex items-center justify-center text-stone-400 hover:text-stone-700 rounded"
                >
                  {copied
                    ? <CheckSmallIcon size={12} className="text-emerald-500" />
                    : <CopyIcon size={12} />}
                </button>
              </div>
              <p className="text-[13px] text-stone-800 font-medium break-words leading-relaxed">
                {formatted}
              </p>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--border)]">
        <button
          onClick={onGoToChat}
          className="w-full h-8 flex items-center justify-center gap-2 text-xs font-medium border border-[var(--border)] text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
        >
          <ChatIcon size={11} />¿Tienes preguntas sobre este documento?
        </button>
      </div>
    </>
  );
}
