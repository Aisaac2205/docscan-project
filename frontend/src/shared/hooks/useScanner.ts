import { useCallback } from 'react';
import { useScannerStore } from '@/features/scanner/store';

export function useScanner() {
  const { scanning, error, captureFromCamera } = useScannerStore();

  const scan = useCallback(async (): Promise<string | null> => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No se pudo crear el contexto del canvas');
      canvas.width = 800;
      canvas.height = 600;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000000';
      ctx.font = '24px Arial';
      ctx.fillText('Escáner Demo', 50, 50);
      return canvas.toDataURL('image/png');
    } catch (err: unknown) {
      useScannerStore.setState({ error: err instanceof Error ? err.message : 'Error al escanear' });
      return null;
    }
  }, []);

  return { scanning, error, captureFromCamera, scan };
}
