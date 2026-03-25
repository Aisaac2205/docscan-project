import { useState, useRef } from 'react';
import { useScannerStore } from '../store';
import { toast } from '@/shared/ui/toast/store';
import type { CaptureResult } from '../types/scanner.types';

export function useCameraCapture(applyResult: (res: CaptureResult | null) => boolean) {
  const { scanning, cameraError, captureFromCamera } = useScannerStore();
  const [cameraMode, setCameraMode] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setStreamReady(false);
  };

  const openCamera = async () => {
    setCameraMode(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setStreamReady(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'No se pudo acceder a la cámara');
      setCameraMode(false);
    }
  };

  const closeCamera = () => {
    stopCamera();
    setCameraMode(false);
  };

  const handleCapture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const base64 = canvas.toDataURL('image/png');
    const res = await captureFromCamera(base64);
    if (applyResult(res)) {
      toast.success('Imagen capturada');
      closeCamera();
    } else if (cameraError) {
      toast.error(cameraError);
    }
  };

  return {
    cameraMode,
    streamReady,
    videoRef,
    canvasRef,
    scanning,
    openCamera,
    closeCamera,
    handleCapture,
  };
}
