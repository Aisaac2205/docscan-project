'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useScannerStore } from '@/features/scanner/store';
import { useScanResult } from '@/features/scanner/hooks/useScanResult';
import { useCameraCapture } from '@/features/scanner/hooks/useCameraCapture';
import { useWifiScanner } from '@/features/scanner/hooks/useWifiScanner';
import { printDocument } from '@/features/scanner/utils/print';
import { personsApi } from '@/features/persons/api/personsApi';
import { ScannerMetricsBar } from '@/features/scanner/components/ScannerMetricsBar';
import { ScannerDropZone } from '@/features/scanner/components/ScannerDropZone';
import { RecentScansFeed } from '@/features/scanner/components/RecentScansFeed';
import { CameraModal } from '@/features/scanner/components/CameraModal';
import { WifiModal } from '@/features/scanner/components/WifiModal';
import { SourceCard } from '@/features/scanner/components/SourceCard';
import { ResultPanel } from '@/features/scanner/components/ResultPanel';
import { ScanResultBar } from '@/features/scanner/components/ScanResultBar';
import { CameraIcon, WifiIcon } from '@/shared/ui/icons';
import { Heading } from '@/shared/components/Layout';

export function ScannerView() {
  const searchParams = useSearchParams();
  const personIdFromUrl = searchParams.get('personId');
  const { scanning, error, cameraError, targetPersonId, targetPersonName, setTargetPerson } = useScannerStore();

  // Sincroniza la persona desde la URL al store la primera vez que cambia el query param.
  useEffect(() => {
    if (!personIdFromUrl) {
      setTargetPerson(null, null);
      return;
    }
    if (personIdFromUrl === targetPersonId) return;
    let cancelled = false;
    personsApi.getOne(personIdFromUrl)
      .then((p) => { if (!cancelled) setTargetPerson(p.id, p.fullName); })
      .catch(() => { if (!cancelled) setTargetPerson(personIdFromUrl, null); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personIdFromUrl]);

  // Limpia la persona al desmontar la vista para no contaminar otras subidas.
  useEffect(() => {
    return () => { setTargetPerson(null, null); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    previewUrl, documentId, processingOcr,
    analyzing, querying,
    ocrMode, setOcrMode, customFields, setCustomFields,
    ocrResult, analysisResult, queryHistory,
    providers, selectedProvider, selectedModel, setSelectedModel, onProviderChange,
    autoOpenResult, setAutoOpenResult,
    pendingRedirectDocId, redirectSecondsLeft, openPendingResultNow, cancelPendingRedirect,
    applyResult, handleAnalyze, handleExtract, handleQuery,
  } = useScanResult();

  const camera = useCameraCapture(applyResult);
  const wifi = useWifiScanner(applyResult);
  const handlePrint = () => printDocument(previewUrl, ocrResult);

  return (
    <div>
      {/* ── KPI metrics bar ── */}
      <ScannerMetricsBar />

      <div className="mb-4 md:mb-6">
        <Heading level={1}>Captura de documentos</Heading>
        <p className="text-body-sm text-fg-tertiary mt-0.5">
          Fotografía o escanea el documento y extrae su contenido con OCR
        </p>
      </div>

      {/* Banner contextual: persona pre-seleccionada */}
      {targetPersonId && (
        <div
          role="status"
          aria-live="polite"
          className="mb-5 flex items-start justify-between gap-3 px-4 py-3 bg-surface-sunken border border-border rounded-md"
        >
          <div className="min-w-0">
            <p className="text-overline text-overline-uppercase text-fg-tertiary mb-0.5">
              Asignación automática
            </p>
            <p className="text-body-sm text-fg-primary">
              Los documentos que proceses se van a asociar a{' '}
              <Link
                href={`/persons/${targetPersonId}`}
                className="font-medium underline hover:text-fg-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] rounded-sm"
              >
                {targetPersonName ?? 'esta persona'}
              </Link>
              .
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTargetPerson(null, null)}
            className="flex-shrink-0 text-caption text-fg-tertiary hover:text-fg-primary underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] rounded-sm"
          >
            Quitar
          </button>
        </div>
      )}

      {camera.cameraMode && (
        <CameraModal
          streamReady={camera.streamReady}
          scanning={camera.scanning}
          videoRef={camera.videoRef}
          canvasRef={camera.canvasRef}
          onCapture={camera.handleCapture}
          onClose={camera.closeCamera}
        />
      )}

      {wifi.wifiModal && (
        <WifiModal
          wifiIp={wifi.wifiIp}
          wifiStatus={wifi.wifiStatus}
          wifiError={wifi.wifiError}
          onIpChange={wifi.setWifiIp}
          onScan={wifi.handleNetworkScan}
          onClose={wifi.closeWifiModal}
          configs={wifi.configs}
          pingStatus={wifi.pingStatus}
          showAddForm={wifi.showAddForm}
          onShowAddForm={wifi.setShowAddForm}
          saveName={wifi.saveName}
          onSaveNameChange={wifi.setSaveName}
          saving={wifi.saving}
          onScanFromConfig={wifi.handleScanFromConfig}
          onSaveConfig={wifi.handleSaveConfig}
          onDeleteConfig={wifi.handleDeleteConfig}
        />
      )}

      <div className="flex items-center gap-3 mb-3 mt-5">
        <span className="text-overline text-overline-uppercase text-fg-tertiary whitespace-nowrap">
          Fuentes de captura
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <SourceCard
          variant="featured"
          icon={<CameraIcon />}
          title="Cámara del dispositivo"
          subtitle="WebRTC · Sin instalación adicional"
          description="Usa la cámara de tu equipo o móvil para fotografiar el documento. Funciona en cualquier navegador moderno."
          action={{ label: <><CameraIcon />Abrir cámara</>, onClick: camera.openCamera, disabled: scanning }}
        />
        <SourceCard
          icon={<WifiIcon />}
          title="Escáner en red"
          subtitle="WiFi · AirScan / eSCL"
          description="Conecta con cualquier escáner o multifunción en tu red local mediante el protocolo AirScan."
          action={{ label: <><WifiIcon size={14} />Conectar escáner WiFi</>, onClick: wifi.openWifiModal }}
        />
      </div>

      {/* Drag & drop import zone */}
      <div className="mb-5">
        <ScannerDropZone applyResult={applyResult} />
      </div>

      {/* Recent scans feed */}
      <RecentScansFeed />

      {(error || cameraError) && (
        <div className="mb-5 px-4 py-3 bg-danger-bg border border-danger-border rounded-md text-danger-fg text-body-sm">
          {error || cameraError}
        </div>
      )}

      {previewUrl && (
        <>
          <ScanResultBar
            autoOpenResult={autoOpenResult}
            onAutoOpenChange={setAutoOpenResult}
            pendingRedirectDocId={pendingRedirectDocId}
            redirectSecondsLeft={redirectSecondsLeft}
            onOpenNow={openPendingResultNow}
            onCancel={cancelPendingRedirect}
          />

          <ResultPanel
            previewUrl={previewUrl}
            ocrResult={ocrResult}
            documentId={documentId}
            ocrMode={ocrMode}
            setOcrMode={setOcrMode}
            customFields={customFields}
            setCustomFields={setCustomFields}
            processingOcr={processingOcr}
            analyzing={analyzing}
            querying={querying}
            analysisResult={analysisResult}
            queryHistory={queryHistory}
            providers={providers}
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onProviderChange={onProviderChange}
            onModelChange={setSelectedModel}
            onExtract={handleExtract}
            onAnalyze={handleAnalyze}
            onQuery={handleQuery}
            onPrint={handlePrint}
          />
        </>
      )}
    </div>
  );
}
