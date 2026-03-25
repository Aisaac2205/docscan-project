import React, { useRef } from 'react';
import { useScannerStore } from '../store';
import { toast } from '@/shared/ui/toast/store';
import type { CaptureResult } from '../types/scanner.types';

export function useUsbImport(applyResult: (res: CaptureResult | null) => boolean) {
  const { cameraError, captureFromCamera } = useScannerStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUsbFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = async (event: ProgressEvent<FileReader>) => {
      const base64 = event.target?.result;
      if (typeof base64 !== 'string') return;
      const res = await captureFromCamera(base64);
      if (applyResult(res)) toast.success('Imagen importada desde USB');
      else if (cameraError) toast.error(cameraError);
    };
    reader.readAsDataURL(file);
  };

  return { fileInputRef, handleUsbFile };
}
