import { useState } from 'react';
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

function isSimpleValue(value: unknown): boolean {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    (Array.isArray(value) && value.every((item) => typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'))
  );
}

function normalizeKey(key: string): string {
  return key
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function rankKey(rawKey: string): number {
  const key = normalizeKey(rawKey);
  if (/(resumen|summary|perfil|profile|objetivo|about|extracto)/.test(key)) return 0;
  if (/(datos_personales|contacto|personal|identificacion|nombre|headline|titulo)/.test(key)) return 1;
  if (/(experiencia|experience|proyectos|projects|practicas|pasantias|internship)/.test(key)) return 2;
  if (/(educacion|education|certificaciones|certifications|idiomas|languages|habilidades|skills)/.test(key)) return 3;
  return 4;
}

function sortExtractedEntries(entries: Array<[string, unknown]>): Array<[string, unknown]> {
  return [...entries].sort(([aKey, aValue], [bKey, bValue]) => {
    const aRank = rankKey(aKey);
    const bRank = rankKey(bKey);
    if (aRank !== bRank) return aRank - bRank;

    const simpleRank = (value: unknown) => (isSimpleValue(value) ? 0 : 1);
    const byType = simpleRank(aValue) - simpleRank(bValue);
    if (byType !== 0) return byType;

    return aKey.localeCompare(bKey, 'es', { sensitivity: 'base' });
  });
}

function CollapsibleComplexField({
  label,
  copyId,
  value,
  copiedKey,
  copyField,
}: {
  label: string;
  copyId: string;
  value: string;
  copiedKey: string | null;
  copyField: (key: string, value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const copied = copiedKey === copyId;
  const preview = value.length > 140 ? `${value.slice(0, 140)}…` : value;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full px-3 py-2.5 bg-stone-50 border-b border-[var(--border)] text-left hover:bg-stone-100 transition-colors"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">{label}</p>
            {!expanded && (
              <p className="text-[12px] text-stone-500 truncate mt-1">{preview}</p>
            )}
          </div>
          <span className="text-[11px] font-medium text-stone-500 flex-shrink-0">{expanded ? 'Ocultar' : 'Ver'}</span>
        </div>
      </button>

      {expanded && (
        <div className="p-3 max-h-72 overflow-y-auto">
          <div className="flex items-start justify-between gap-2">
            <pre className="text-[12px] text-stone-700 whitespace-pre-wrap break-words font-sans leading-relaxed flex-1">
              {value}
            </pre>
            <button
              onClick={() => copyField(copyId, value)}
              title="Copiar valor"
              className="flex-shrink-0 h-5 w-5 flex items-center justify-center text-stone-400 hover:text-stone-700 rounded"
            >
              {copied
                ? <CheckSmallIcon size={12} className="text-emerald-500" />
                : <CopyIcon size={12} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
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

  const allEntries = sortExtractedEntries(
    Object.entries(ocrResult.extractedData)
      .filter(([key]) => !key.startsWith('_')),
  );
  const simpleEntries = allEntries.filter(([, value]) => isSimpleValue(value));
  const complexEntries = allEntries.filter(([, value]) => !isSimpleValue(value));
  const fieldCount = allEntries.length;

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
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {simpleEntries.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {simpleEntries.map(([key, value]) => {
              const formatted = formatValue(value);
              const copied = copiedKey === key;
              const isLong = formatted.length > 220;
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
                  <p className={`text-[13px] text-stone-800 font-medium break-words leading-relaxed ${isLong ? 'max-h-24 overflow-y-auto pr-1' : ''}`}>
                    {formatted}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {complexEntries.length > 0 && (
          <div className="space-y-2">
            {complexEntries.map(([key, value]) => (
              <CollapsibleComplexField
                key={key}
                label={key.replace(/_/g, ' ')}
                copyId={key}
                value={formatValue(value)}
                copiedKey={copiedKey}
                copyField={copyField}
              />
            ))}
          </div>
        )}
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
