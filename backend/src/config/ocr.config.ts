export const ocrConfig = {
  language: process.env.OCR_LANGUAGE || 'spa',
  minConfidence: parseFloat(process.env.OCR_MIN_CONFIDENCE || '0.9'),
  logger: (m: any) => console.log(m),
};
