'use client';

import React from 'react';
import { SpinnerIcon, CameraIcon, CloseIcon } from '@/shared/ui/icons';

interface CameraModalProps {
  streamReady: boolean;
  scanning: boolean;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onCapture: () => void;
  onClose: () => void;
}

export function CameraModal({ streamReady, scanning, videoRef, canvasRef, onCapture, onClose }: CameraModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay">
      <div className="bg-surface-card rounded-xl shadow-md w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <CameraIcon className="text-fg-tertiary" />
            <p className="text-h4 text-fg-primary">Cámara del dispositivo</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-md text-fg-tertiary hover:text-fg-primary hover:bg-surface-sunken transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="relative bg-brand-ink-900 aspect-[4/3] overflow-hidden">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          {!streamReady && (
            <div className="absolute inset-0 flex items-center justify-center">
              <SpinnerIcon size={32} className="text-fg-inverse" />
            </div>
          )}
          {streamReady && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-5 left-5 w-8 h-8 border-t-2 border-l-2 border-fg-inverse/50 rounded-tl-sm" />
              <div className="absolute top-5 right-5 w-8 h-8 border-t-2 border-r-2 border-fg-inverse/50 rounded-tr-sm" />
              <div className="absolute bottom-5 left-5 w-8 h-8 border-b-2 border-l-2 border-fg-inverse/50 rounded-bl-sm" />
              <div className="absolute bottom-5 right-5 w-8 h-8 border-b-2 border-r-2 border-fg-inverse/50 rounded-br-sm" />
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />

        <div className="px-5 py-4 flex gap-3">
          <button
            onClick={onCapture}
            disabled={!streamReady || scanning}
            className="flex-1 h-11 flex items-center justify-center gap-2 bg-fg-primary text-fg-inverse text-button rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {scanning ? <><SpinnerIcon />Guardando...</> : <><CameraIcon />Capturar foto</>}
          </button>
          <button onClick={onClose} className="h-11 px-4 text-button border border-border text-fg-secondary bg-surface-card rounded-md hover:bg-surface-sunken transition-colors">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
