import React, { useState, useCallback } from 'react';
import { useDocuments } from '@/shared/hooks/useDocuments';

export const ACCEPT_TYPES = 'image/*,.pdf';
export const MAX_SIZE_MB = 20;

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export interface UseDocumentUploadOptions {
  onUploadComplete?: (documentId: string) => void;
}

export function useDocumentUpload({ onUploadComplete }: UseDocumentUploadOptions = {}) {
  const { uploadDocument, loading } = useDocuments();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedDoc, setUploadedDoc] = useState<{ id: string } | null>(null);
  const [sizeError, setSizeError] = useState(false);

  const validateAndSet = (file: File) => {
    setSizeError(false);
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setSizeError(true);
      return;
    }
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      setSelectedFile(file);
      setUploadedDoc(null);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSet(file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSet(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    const result = await uploadDocument(selectedFile);
    if (result) {
      setUploadedDoc(result);
      onUploadComplete?.(result.id);
    }
  };

  const resetUpload = () => {
    setUploadedDoc(null);
    setSelectedFile(null);
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setSizeError(false);
  };

  return {
    dragActive,
    selectedFile,
    uploadedDoc,
    sizeError,
    loading,
    ACCEPT_TYPES,
    MAX_SIZE_MB,
    handleDrag,
    handleDrop,
    handleFileChange,
    handleUpload,
    resetUpload,
    clearSelectedFile,
  };
}
