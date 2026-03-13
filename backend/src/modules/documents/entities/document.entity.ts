export class DocumentEntity {
  id: string;
  userId: string;
  originalName: string;
  mimeType: string;
  filePath: string;
  rawText: string | null;
  confidence: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
