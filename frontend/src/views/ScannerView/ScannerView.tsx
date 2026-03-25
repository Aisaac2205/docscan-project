'use client';

import React from 'react';
import { useScannerStore } from '@/features/scanner/store';
import { useScanResult } from '@/features/scanner/hooks/useScanResult';
import { useCameraCapture } from '@/features/scanner/hooks/useCameraCapture';
import { useWifiScanner } from '@/features/scanner/hooks/useWifiScanner';
import { useUsbImport } from '@/features/scanner/hooks/useUsbImport';
import { useBluetoothPrinter } from '@/features/scanner/hooks/useBluetoothPrinter';
import { printDocument } from '@/features/scanner/utils/print';
import { CameraModal } from '@/features/scanner/components/CameraModal';
import { WifiModal } from '@/features/scanner/components/WifiModal';
import { BluetoothModal } from '@/features/scanner/components/BluetoothModal';
import { SourceCard } from '@/features/scanner/components/SourceCard';
import { ResultPanel } from '@/features/scanner/components/ResultPanel';
import { CameraIcon, WifiIcon, UsbIcon, BluetoothIcon } from '@/shared/ui/icons';

export function ScannerView() {
  const { scanning, error, cameraError } = useScannerStore();
  const {
    previewUrl, documentId, processingOcr,
    analyzing, querying,
    ocrMode, setOcrMode, customFields, setCustomFields,
    ocrResult, analysisResult, queryHistory,
    applyResult, handleAnalyze, handleExtract, handleQuery,
  } = useScanResult();

  const camera = useCameraCapture(applyResult);
  const wifi = useWifiScanner(applyResult);
  const usb = useUsbImport(applyResult);
  const handlePrint = () => printDocument(previewUrl, ocrResult);
  const bt = useBluetoothPrinter(handlePrint, !!previewUrl);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-stone-900">Captura de documentos</h2>
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
          wifiPort={wifi.wifiPort}
          wifiStatus={wifi.wifiStatus}
          wifiError={wifi.wifiError}
          onIpChange={wifi.setWifiIp}
          onPortChange={wifi.setWifiPort}
          onScan={wifi.handleNetworkScan}
          onClose={wifi.closeWifiModal}
        />
      )}

      {bt.btModal && (
        <BluetoothModal
          btStatus={bt.btStatus}
          btDeviceName={bt.btDeviceName}
          btError={bt.btError}
          hasResult={!!previewUrl}
          onConnect={bt.handleBtConnect}
          onDisconnect={bt.disconnectBt}
          onPrint={bt.handleBtPrint}
          onClose={bt.closeBtModal}
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
        ref={usb.fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={usb.handleUsbFile}
        className="hidden"
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <SourceCard
          icon={<WifiIcon />}
          title="Escáner en red"
          subtitle="WiFi · AirScan / eSCL"
          description="Conecta con cualquier escáner o multifunción en tu red local mediante el protocolo AirScan."
          action={{ label: <><WifiIcon size={14} />Conectar escáner WiFi</>, onClick: wifi.openWifiModal }}
        />
        <SourceCard
          icon={<UsbIcon />}
          title="Escáner USB"
          subtitle="USB · Importar imagen"
          description="Importa una imagen escaneada desde tu escáner USB. Selecciona el archivo generado por el software del escáner."
          action={{
            label: <><UsbIcon size={14} />Seleccionar imagen USB</>,
            onClick: () => usb.fileInputRef.current?.click(),
            disabled: scanning,
          }}
        />
        <SourceCard
          icon={<BluetoothIcon />}
          title="Impresora Bluetooth"
          subtitle={
            bt.btStatus === 'connected' && bt.btDeviceName
              ? <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />{bt.btDeviceName}</span>
              : 'BT · Web Bluetooth'
          }
          description="Empareja una impresora Bluetooth para imprimir documentos digitalizados directamente desde el navegador."
          action={{
            label: <><BluetoothIcon size={14} />{bt.btStatus === 'connected' ? 'Administrar dispositivo' : 'Emparejar dispositivo'}</>,
            onClick: bt.openBtModal,
          }}
        />
      </div>

      {(error || cameraError) && (
        <div className="mb-5 px-4 py-3 bg-[var(--error-bg)] border border-[var(--error-border)] rounded-md text-[var(--error)] text-sm">
          {error || cameraError}
        </div>
      )}

      {previewUrl && (
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
          onExtract={handleExtract}
          onAnalyze={handleAnalyze}
          onQuery={handleQuery}
          onPrint={handlePrint}
        />
      )}
    </div>
  );
}
