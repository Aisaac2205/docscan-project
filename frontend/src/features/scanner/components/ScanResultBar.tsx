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
    <div className="mt-4 p-3 sm:p-4 lg:p-5 rounded-md border border-border bg-surface-sunken flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="flex items-center gap-2 text-body-sm text-fg-secondary">
        <input
          type="checkbox"
          checked={autoOpenResult}
          onChange={(e) => onAutoOpenChange(e.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
        Abrir automáticamente en Documentos al terminar OCR
      </label>

      {pendingRedirectDocId && (
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-caption text-fg-tertiary">
            Redirigiendo en {redirectSecondsLeft}s
          </span>
          <button
            onClick={onOpenNow}
            className="h-9 px-3 text-button-sm font-medium bg-fg-primary text-fg-inverse rounded-md hover:opacity-90 transition-colors"
          >
            Ver ahora
          </button>
          <button
            onClick={onCancel}
            className="h-9 px-3 text-button-sm font-medium border border-border text-fg-secondary rounded-md hover:bg-surface-card transition-colors"
          >
            Quedarme aquí
          </button>
        </div>
      )}
    </div>
  );
}
