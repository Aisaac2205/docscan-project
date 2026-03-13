import { createWorker, Worker } from 'tesseract.js';

class OcrClient {
  private worker: Worker | null = null;

  async initialize() {
    if (!this.worker) {
      this.worker = await createWorker('spa');
    }
    return this.worker;
  }

  async recognizeImage(
    imageSource: File | string,
    onProgress?: (progress: number) => void
  ): Promise<{ text: string; confidence: number }> {
    const worker = await this.initialize();
    
    const result = await worker.recognize(imageSource, {}, {
      text: true,
    });

    return {
      text: result.data.text,
      confidence: result.data.confidence / 100,
    };
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrClient = new OcrClient();
