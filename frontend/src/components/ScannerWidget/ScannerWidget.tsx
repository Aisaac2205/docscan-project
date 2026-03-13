'use client';

import { useState, useRef, useEffect } from 'react';
import { useScanner } from '@/hooks/useScanner';
import { useOCR } from '@/hooks/useOCR';

interface ScannerWidgetProps {
  onScanComplete?: (text: string, confidence: number) => void;
}

export function ScannerWidget({ onScanComplete }: ScannerWidgetProps) {
  const {
    devices,
    scanning,
    error,
    selectedDevice,
    setSelectedDevice,
    scan,
    refreshDevices,
  } = useScanner();
  
  const { processImage, processing, result } = useOCR();
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (result && onScanComplete) {
      onScanComplete(result.text, result.confidence);
    }
  }, [result, onScanComplete]);

  const handleScan = async () => {
    const imageData = await scan();
    if (imageData) {
      setScannedImage(imageData);
      
      const response = await fetch(imageData);
      const blob = await response.blob();
      const file = new File([blob], 'scan.png', { type: 'image/png' });
      await processImage(file);
    }
  };

  const simulateScan = async () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 32px Arial';
    ctx.fillText('Documento de Ejemplo', 50, 80);
    
    ctx.font = '20px Arial';
    ctx.fillText('Este es un texto de demostración', 50, 140);
    ctx.fillText('para el OCR de DocScan.', 50, 170);
    ctx.fillText('Fecha: 12/03/2026', 50, 220);
    ctx.fillText('Universidad - Proyecto Final', 50, 250);

    const imageData = canvas.toDataURL('image/png');
    setScannedImage(imageData);
    
    const response = await fetch(imageData);
    const blob = await response.blob();
    const file = new File([blob], 'scan.png', { type: 'image/png' });
    await processImage(file);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span>📠</span> Escanear Documento
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Dispositivo
          </label>
          <select
            value={selectedDevice || ''}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            disabled={scanning || processing}
          >
            {devices.length === 0 ? (
              <option value="">Cargando dispositivos...</option>
            ) : (
              devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name} ({device.manufacturer})
                </option>
              ))
            )}
          </select>
        </div>

        <button
          onClick={simulateScan}
          disabled={scanning || processing}
          className="w-full py-3 px-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {scanning || processing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Procesando...
            </span>
          ) : (
            '🔍 Escanear Documento'
          )}
        </button>

        <button
          onClick={refreshDevices}
          className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          🔄 Actualizar Dispositivos
        </button>
      </div>

      {scannedImage && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Vista Previa</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <img src={scannedImage} alt="Escaneado" className="w-full h-auto" />
          </div>
        </div>
      )}

      <canvas ref={canvasRef} width={800} height={600} style={{ display: 'none' }} />
    </div>
  );
}
