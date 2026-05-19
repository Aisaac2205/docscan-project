'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heading } from '@/shared/components/Layout';
import { useScannerStore } from '@/features/scanner/store';
import { scannerClient } from '@/features/scanner/client';
import { toast } from '@/shared/ui/toast/store';

type ViewStatus = 'scanning' | 'error' | 'success';

export function NetworkScanView() {
  const router = useRouter();
  const pendingRequest = useScannerStore((s) => s.pendingNetworkScan);
  const setPendingScan = useScannerStore((s) => s.setPendingNetworkScan);
  const setPendingResult = useScannerStore((s) => s.setPendingNetworkResult);

  const [status, setStatus] = useState<ViewStatus>('scanning');
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  // Guard against React StrictMode double-mount firing the request twice.
  const firedFor = useRef<number | null>(null);

  // No pending request → user landed here directly. Send them back.
  useEffect(() => {
    if (!pendingRequest) {
      router.replace('/scan');
    }
  }, [pendingRequest, router]);

  // Fire the scan once per attempt.
  useEffect(() => {
    if (!pendingRequest) return;
    if (firedFor.current === attempt) return;
    firedFor.current = attempt;

    let cancelled = false;
    const personId = useScannerStore.getState().targetPersonId ?? undefined;

    setStatus('scanning');
    setError(null);

    scannerClient
      .captureFromNetwork({
        ipAddress: pendingRequest.ip,
        port: pendingRequest.port,
        useTls: pendingRequest.useTls,
        verifyTls: pendingRequest.verifyTls,
        personId,
      })
      .then((res) => {
        if (cancelled) return;
        setPendingResult(res);
        setPendingScan(null);
        setStatus('success');
        toast.success(`Documento escaneado desde ${pendingRequest.label}`);
        // Brief pause so the user perceives the success state before the route swap.
        window.setTimeout(() => {
          if (!cancelled) router.replace('/scan');
        }, 600);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStatus('error');
        setError(err instanceof Error ? err.message : 'No se pudo conectar al escáner');
      });

    return () => { cancelled = true; };
  }, [pendingRequest, attempt, router, setPendingResult, setPendingScan]);

  if (!pendingRequest) return null;

  const handleRetry = () => {
    setAttempt((n) => n + 1);
  };

  const handleCancel = () => {
    setPendingScan(null);
    router.replace('/scan');
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-5 md:mb-7">
        <p className="text-overline text-overline-uppercase text-fg-tertiary mb-0.5">
          Escáner físico
        </p>
        <Heading level={1}>
          {status === 'error'
            ? 'No pudimos escanear'
            : status === 'success'
              ? 'Documento escaneado'
              : 'Escaneando documento'}
        </Heading>
        <p className="text-body-sm text-fg-tertiary mt-0.5">
          {status === 'error'
            ? `Hubo un problema al contactar ${pendingRequest.label}. Probá de nuevo o volvé al panel.`
            : `Conectado a ${pendingRequest.label} (${pendingRequest.ip}). No cierres esta ventana.`}
        </p>
      </div>

      <div className="bg-surface-card border border-border rounded-lg p-6 md:p-10 flex flex-col items-center">
        <ScannerIllustration status={status} />

        {status === 'scanning' && (
          <>
            <p className="mt-8 text-body text-fg-primary font-medium">
              Procesando hoja…
            </p>
            <p className="mt-1 text-caption text-fg-tertiary">
              Esto puede tomar unos segundos según el escáner.
            </p>

            <div className="relative w-full max-w-md h-1.5 mt-6 bg-surface-sunken rounded-full overflow-hidden">
              <span className="absolute top-0 bottom-0 bg-accent-500 rounded-full animate-scanner-progress" />
            </div>

            <button
              type="button"
              onClick={handleCancel}
              className="mt-6 h-9 px-4 border border-border text-fg-secondary bg-surface-card text-button-sm rounded-md hover:bg-surface-sunken hover:border-border-strong transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
            >
              Cancelar
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <p className="mt-8 text-body text-fg-primary font-medium">
              No se pudo completar el escaneo
            </p>
            {error && (
              <p className="mt-1 text-caption text-danger-fg max-w-md text-center">
                {error}
              </p>
            )}
            <div className="flex items-center gap-2 mt-6">
              <button
                type="button"
                onClick={handleRetry}
                className="h-9 px-4 bg-fg-primary text-fg-inverse text-button-sm rounded-md hover:opacity-90 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
              >
                Reintentar
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="h-9 px-4 border border-border text-fg-secondary bg-surface-card text-button-sm rounded-md hover:bg-surface-sunken hover:border-border-strong transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
              >
                Volver al panel
              </button>
            </div>
          </>
        )}

        {status === 'success' && (
          <p className="mt-8 text-body text-success-fg font-medium">
            Listo. Te llevamos al resultado…
          </p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── Scanner illustration ─────────────────────────── */

interface ScannerIllustrationProps {
  status: ViewStatus;
}

/**
 * SVG illustration of a flatbed scanner. While scanning, a sheet of paper
 * feeds vertically through the slot and a horizontal "scan light" sweeps
 * across the surface. Pure CSS animation — no real-time link to the device
 * (eSCL is HTTP polling, not push).
 */
function ScannerIllustration({ status }: ScannerIllustrationProps) {
  const isScanning = status === 'scanning';
  const isError = status === 'error';
  const isSuccess = status === 'success';

  return (
    <div className="relative w-full max-w-[280px] aspect-[5/4]">
      {/* Scanner body */}
      <div className="absolute inset-0 rounded-2xl bg-surface-sunken border border-border-strong shadow-sm" />

      {/* Top lid with paper slot */}
      <div className="absolute left-3 right-3 top-3 h-8 rounded-lg bg-surface-card border border-border flex items-center justify-between px-3">
        {/* LED indicator */}
        <div className="flex items-center gap-1.5">
          <span
            className={[
              'w-1.5 h-1.5 rounded-full',
              isError ? 'bg-danger-fg' : isSuccess ? 'bg-success-fg' : 'bg-success-fg animate-scanner-led',
            ].join(' ')}
            aria-hidden="true"
          />
          <span className="text-[10px] uppercase tracking-wider text-fg-tertiary font-medium">
            {isError ? 'Error' : isSuccess ? 'Listo' : 'Activo'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-border-strong" />
          <span className="w-1 h-1 rounded-full bg-border-strong" />
          <span className="w-1 h-1 rounded-full bg-border-strong" />
        </div>
      </div>

      {/* Scan bed (where the paper appears) */}
      <div className="absolute inset-x-6 top-14 bottom-6 rounded-lg bg-surface-sunken border border-border overflow-hidden">
        {/* Paper feeding through */}
        {isScanning && (
          <div
            className="absolute inset-x-3 top-0 h-[120%] rounded-sm bg-surface-card border border-border-subtle shadow-sm animate-scanner-paper"
            aria-hidden="true"
          >
            {/* Fake text lines on the paper */}
            <div className="p-3 space-y-1.5">
              <div className="h-1 w-3/4 rounded-full bg-border-strong/60" />
              <div className="h-1 w-full rounded-full bg-border-strong/40" />
              <div className="h-1 w-5/6 rounded-full bg-border-strong/40" />
              <div className="h-1 w-2/3 rounded-full bg-border-strong/40" />
              <div className="h-1 w-full rounded-full bg-border-strong/40" />
              <div className="h-1 w-1/2 rounded-full bg-border-strong/40" />
              <div className="h-2" />
              <div className="h-1 w-4/5 rounded-full bg-border-strong/40" />
              <div className="h-1 w-3/4 rounded-full bg-border-strong/40" />
              <div className="h-1 w-full rounded-full bg-border-strong/40" />
            </div>
          </div>
        )}

        {/* Scan light bar — sweeps horizontally */}
        {isScanning && (
          <div
            className="absolute top-0 bottom-0 w-12 animate-scanner-light pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--color-accent-500) 20%, transparent) 40%, color-mix(in srgb, var(--color-accent-500) 60%, transparent) 50%, color-mix(in srgb, var(--color-accent-500) 20%, transparent) 60%, transparent 100%)',
            }}
            aria-hidden="true"
          />
        )}

        {/* Success state — green check */}
        {isSuccess && (
          <div className="absolute inset-0 flex items-center justify-center text-success-fg">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
              <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="2" />
              <path d="M18 28l7 7 13-14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        {/* Error state — red exclamation */}
        {isError && (
          <div className="absolute inset-0 flex items-center justify-center text-danger-fg">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true">
              <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="2" />
              <path d="M28 18v14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="28" cy="38" r="1.5" fill="currentColor" />
            </svg>
          </div>
        )}
      </div>

      {/* Bottom feet */}
      <div className="absolute left-6 -bottom-1 w-4 h-1.5 rounded-b-md bg-border-strong/40" />
      <div className="absolute right-6 -bottom-1 w-4 h-1.5 rounded-b-md bg-border-strong/40" />
    </div>
  );
}
