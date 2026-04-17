'use client';

import React, { useEffect, useState } from 'react';
import { useScannerStore } from '@/features/scanner/store';
import { useScanResult } from '@/features/scanner/hooks/useScanResult';
import { useCameraCapture } from '@/features/scanner/hooks/useCameraCapture';
import { useWifiScanner } from '@/features/scanner/hooks/useWifiScanner';
import { useUsbImport } from '@/features/scanner/hooks/useUsbImport';
import { printDocument } from '@/features/scanner/utils/print';
import { CameraModal } from '@/features/scanner/components/CameraModal';
import { WifiModal } from '@/features/scanner/components/WifiModal';
import { SourceCard } from '@/features/scanner/components/SourceCard';
import { ResultPanel } from '@/features/scanner/components/ResultPanel';
import { CameraIcon, WifiIcon, UsbIcon } from '@/shared/ui/icons';

export function ScannerView() {
  const { scanning, error, cameraError } = useScannerStore();
  const {
    previewUrl, documentId, processingOcr,
    analyzing, querying,
    ocrMode, setOcrMode, customFields, setCustomFields,
    ocrResult, analysisResult, queryHistory,
    providers, selectedProvider, selectedModel, setSelectedModel, onProviderChange,
    autoOpenResult, setAutoOpenResult,
    pendingRedirectDocId, pendingRedirectUntil, openPendingResultNow, cancelPendingRedirect,
    applyResult, handleAnalyze, handleExtract, handleQuery,
  } = useScanResult();

  const [nowTs, setNowTs] = useState(() => Date.now());

  useEffect(() => {
    if (!pendingRedirectUntil) return;
    const id = window.setInterval(() => setNowTs(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [pendingRedirectUntil]);

  const redirectSecondsLeft = pendingRedirectUntil
    ? Math.max(0, Math.ceil((pendingRedirectUntil - nowTs) / 1000))
    : 0;

  const camera = useCameraCapture(applyResult);
  const wifi = useWifiScanner(applyResult);
  const usb = useUsbImport(applyResult);
  const handlePrint = () => printDocument(previewUrl, ocrResult);

  return (
    <div>
      <div className="mb-4 md:mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-stone-900">Captura de documentos</h2>
        <p className="text-sm text-stone-400 mt-0.5">
          Fotografía o escanea el documento y extrae su contenido con OCR
        </p>
      </div>

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

      <div className="mb-3">
        <SourceCard
          variant="featured"
          icon={<CameraIcon />}
          title="Cámara del dispositivo"
          subtitle="WebRTC · Sin instalación adicional"
          description="Usa la cámara de tu equipo o móvil para fotografiar el documento. Funciona en cualquier navegador moderno."
          action={{ label: <><CameraIcon />Abrir cámara</>, onClick: camera.openCamera, disabled: scanning }}
        />
      </div>

      <div className="flex items-center gap-3 mb-3 mt-5">
        <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider whitespace-nowrap">
          Escáneres físicos
        </span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>

      <input
        ref={usb.fileInputRef} // eslint-disable-line react-hooks/refs -- false positive: pasar ref object a prop ref es el patrón correcto
        type="file"
        accept="image/*,application/pdf"
        onChange={usb.handleUsbFile} // eslint-disable-line react-hooks/refs -- false positive: handleUsbFile es un event handler, no accede a .current en render
        className="hidden"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <SourceCard
          icon={<WifiIcon />}
          title="Escáner en red"
          subtitle="WiFi · AirScan / eSCL"
          description="Conecta con cualquier escáner o multifunción en tu red local mediante el protocolo AirScan."
          action={{ label: <><WifiIcon size={14} />Conectar escáner WiFi</>, onClick: wifi.openWifiModal }}
        />
        <SourceCard
          icon={<UsbIcon />}
          title="Importar archivo"
          subtitle="USB · Imagen o PDF"
          description="Importa una imagen o PDF desde tu dispositivo. Soporta archivos JPEG, PNG y PDF generados por cualquier escáner."
          action={{
            label: <><UsbIcon size={14} />Seleccionar archivo</>,
            onClick: () => usb.fileInputRef.current?.click(),
            disabled: scanning,
          }}
        />
      </div>

      {(error || cameraError) && (
        <div className="mb-5 px-4 py-3 bg-[var(--error-bg)] border border-[var(--error-border)] rounded-md text-[var(--error)] text-sm">
          {error || cameraError}
        </div>
      )}

      {previewUrl && (
        <>
          <div className="mt-4 p-3 sm:p-4 rounded-lg border border-[var(--border)] bg-stone-50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={autoOpenResult}
                onChange={(e) => setAutoOpenResult(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--border)]"
              />
              Abrir automáticamente en Documentos al terminar OCR
            </label>

            {pendingRedirectDocId && (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs text-stone-500">
                  Redirigiendo en {redirectSecondsLeft}s
                </span>
                <button
                  onClick={openPendingResultNow}
                  className="h-8 px-3 text-xs font-semibold bg-stone-900 text-white rounded-md hover:bg-stone-800 transition-colors"
                >
                  Ver ahora
                </button>
                <button
                  onClick={cancelPendingRedirect}
                  className="h-8 px-3 text-xs font-semibold border border-[var(--border)] text-stone-600 rounded-md hover:bg-white transition-colors"
                >
                  Quedarme aquí
                </button>
              </div>
            )}
          </div>

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
