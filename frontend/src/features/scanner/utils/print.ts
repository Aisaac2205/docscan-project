import type { OCRResponse } from '@/features/ocr/types/ocr.types';
import { EXTRACTION_MODE_LABELS } from '@/features/ocr/types/ocr.types';
import { formatValue } from './format';

export function printDocument(previewUrl: string | null, ocrResult: OCRResponse | null): void {
  const w = window.open('', '_blank', 'width=820,height=720');
  if (!w) return;
  const data = ocrResult?.extractedData;
  const rows = data
    ? Object.entries(data)
        .map(([k, v]) => `<tr><th>${k}</th><td>${formatValue(v)}</td></tr>`)
        .join('')
    : '';
  w.document.write(`<!DOCTYPE html><html><head>
    <title>Documento digitalizado</title>
    <style>
      body{font-family:Arial,sans-serif;padding:40px;color:#111}
      h1{font-size:18px;margin-bottom:4px}
      .meta{font-size:12px;color:#666;margin-bottom:20px}
      img{max-width:100%;height:auto;border:1px solid #ddd;border-radius:4px;margin-bottom:20px}
      table{border-collapse:collapse;width:100%;font-size:13px}
      th{background:#f5f5f5;font-weight:600;text-align:left;padding:8px 12px;border:1px solid #ccc;width:35%}
      td{border:1px solid #ccc;padding:8px 12px}
      h2{font-size:14px;margin:20px 0 8px;color:#444}
    </style>
  </head><body>
    <h1>Documento digitalizado</h1>
    <p class="meta">Generado: ${new Date().toLocaleDateString('es-GT', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    ${previewUrl ? `<img src="${previewUrl}" alt="Documento" />` : ''}
    <h2>Datos extraídos — ${EXTRACTION_MODE_LABELS[ocrResult?.extractionMode ?? 'general']}</h2>
    ${rows ? `<table>${rows}</table>` : '<p style="color:#888">Sin datos OCR.</p>'}
    <script>window.onload=function(){window.print()}<\/script>
  </body></html>`);
  w.document.close();
}
