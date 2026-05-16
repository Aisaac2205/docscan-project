export const DOCUMENT_CREATED = 'document.created';

export interface DocumentCreatedEvent {
  documentId: string;
  userId: string;
  source: 'upload' | 'scanner-camera' | 'scanner-network';
}
