type ScanResultBarProps = {
  autoOpenResult: boolean;
  onAutoOpenChange: (value: boolean) => void;
  pendingRedirectDocId: string | null;
  redirectSecondsLeft: number;
  onOpenNow: () => void;
  onCancel: () => void;
};

export function ScanResultBar({
  autoOpenResult,
  onAutoOpenChange,
  pendingRedirectDocId,
  redirectSecondsLeft,
  onOpenNow,
  onCancel,
}: ScanResultBarProps) {
  return (
    <div className="mt-4 p-3 sm:p-4 lg:p-5 rounded-lg border border-[var(--border)] bg-stone-50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="flex items-center gap-2 text-sm lg:text-base text-stone-700">
        <input
          type="checkbox"
          checked={autoOpenResult}
          onChange={(e) => onAutoOpenChange(e.target.checked)}
          className="h-4 w-4 rounded border-[var(--border)]"
        />
        Abrir automáticamente en Documentos al terminar OCR
      </label>

      {pendingRedirectDocId && (
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs lg:text-sm text-stone-500">
            Redirigiendo en {redirectSecondsLeft}s
          </span>
          <button
            onClick={onOpenNow}
            className="h-8 lg:h-9 px-3 text-xs lg:text-sm font-semibold bg-stone-900 text-white rounded-md hover:bg-stone-800 transition-colors"
          >
            Ver ahora
          </button>
          <button
            onClick={onCancel}
            className="h-8 lg:h-9 px-3 text-xs lg:text-sm font-semibold border border-[var(--border)] text-stone-600 rounded-md hover:bg-white transition-colors"
          >
            Quedarme aquí
          </button>
        </div>
      )}
    </div>
  );
}
