'use client';

import React from 'react';
import { SpinnerIcon, CameraIcon, CloseIcon } from '@/shared/ui/icons';

interface CameraModalProps {
  streamReady: boolean;
  scanning: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onCapture: () => void;
  onClose: () => void;
}

export function CameraModal({ streamReady, scanning, videoRef, canvasRef, onCapture, onClose }: CameraModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <CameraIcon className="text-stone-500" />
            <p className="text-sm font-semibold text-stone-800">Cámara del dispositivo</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="relative bg-stone-950 aspect-[4/3] overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          {!streamReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <SpinnerIcon size={32} className="text-white" />
            </div>
          )}
          {streamReady && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-5 left-5 w-7 h-7 border-t-2 border-l-2 border-white/50 rounded-tl-sm" />
              <div className="absolute top-5 right-5 w-7 h-7 border-t-2 border-r-2 border-white/50 rounded-tr-sm" />
              <div className="absolute bottom-5 left-5 w-7 h-7 border-b-2 border-l-2 border-white/50 rounded-bl-sm" />
              <div className="absolute bottom-5 right-5 w-7 h-7 border-b-2 border-r-2 border-white/50 rounded-br-sm" />
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />

        <div className="px-5 py-4 flex gap-3">
          <button
            onClick={onCapture}
            disabled={!streamReady || scanning}
            className="flex-1 h-11 flex items-center justify-center gap-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {scanning ? <><SpinnerIcon />Guardando...</> : <><CameraIcon />Capturar foto</>}
          </button>
          <button onClick={onClose} className="h-11 px-4 text-sm font-medium border border-[var(--border)] text-stone-600 bg-white rounded-lg hover:bg-stone-50 transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
