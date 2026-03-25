import type { Document } from '../types/document.types';

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatFieldLabel(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'number') {
    return value.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (Array.isArray(value)) {
    return value.map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ');
  }
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function buildExtractedRows(extracted: Record<string, unknown>): string {
  return Object.entries(extracted)
    .map(
      ([key, value]) => `
        <tr>
          <td class="field-label">${escapeHtml(formatFieldLabel(key))}</td>
          <td class="field-value">${escapeHtml(formatFieldValue(value))}</td>
        </tr>`,
    )
    .join('');
}

export function printDocument(doc: Document): void {
  const w = window.open('', '_blank', 'width=820,height=900');
  if (!w) return;

  const extracted = doc.extractedData as Record<string, unknown> | null;
  const createdDate = new Date(doc.createdAt).toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const printDate = new Date().toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const extractedHtml = extracted
    ? `<table class="data-table">${buildExtractedRows(extracted)}</table>`
    : '<p class="no-data">Sin datos OCR extraídos.</p>';

  w.document.write(`<!DOCTYPE html><html lang="es"><head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(doc.originalName)} — DocScan</title>
    <style>
      @page {
        size: letter;
        margin: 20mm 18mm 25mm 18mm;
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Segoe UI', system-ui, -apple-system, Arial, sans-serif;
        color: #1a1a1a;
        font-size: 11pt;
        line-height: 1.5;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      /* ── Header ── */
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding-bottom: 16px;
        border-bottom: 2px solid #111;
        margin-bottom: 24px;
      }
      .brand { font-size: 20pt; font-weight: 700; letter-spacing: -0.5px; color: #111; }
      .brand span { font-weight: 300; color: #666; }
      .header-meta { text-align: right; font-size: 8.5pt; color: #666; line-height: 1.6; }

      /* ── Document info ── */
      .doc-info {
        display: flex;
        gap: 32px;
        margin-bottom: 24px;
        padding: 14px 18px;
        background: #f8f8f8;
        border: 1px solid #e5e5e5;
        border-radius: 4px;
      }
      .doc-info-item { font-size: 9pt; }
      .doc-info-item .label { color: #888; text-transform: uppercase; font-size: 7.5pt; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 2px; }
      .doc-info-item .value { color: #222; font-weight: 500; }

      /* ── Section title ── */
      .section-title {
        font-size: 9pt;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #444;
        margin-bottom: 10px;
        padding-bottom: 6px;
        border-bottom: 1px solid #ddd;
      }

      /* ── Image ── */
      .doc-image {
        max-width: 100%;
        max-height: 320px;
        object-fit: contain;
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 24px;
        display: block;
      }

      /* ── Data table ── */
      .data-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 10pt;
        margin-bottom: 24px;
      }
      .data-table tr { border-bottom: 1px solid #e5e5e5; }
      .data-table tr:last-child { border-bottom: none; }
      .data-table td { padding: 9px 12px; vertical-align: top; }
      .field-label {
        width: 35%;
        font-weight: 600;
        color: #444;
        background: #fafafa;
        font-size: 9pt;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      .field-value { color: #1a1a1a; }

      .no-data { color: #999; font-style: italic; font-size: 10pt; padding: 12px 0; }

      /* ── Footer ── */
      .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 10px 18mm;
        border-top: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        font-size: 7.5pt;
        color: #999;
      }

      @media print {
        body { padding: 0; }
        .no-print { display: none; }
      }
    </style>
  </head><body>
    <div class="header">
      <div class="brand">Doc<span>Scan</span></div>
      <div class="header-meta">
        Reporte de documento<br/>
        Impreso: ${escapeHtml(printDate)}
      </div>
    </div>

    <div class="doc-info">
      <div class="doc-info-item">
        <div class="label">Documento</div>
        <div class="value">${escapeHtml(doc.originalName)}</div>
      </div>
      <div class="doc-info-item">
        <div class="label">Fecha de carga</div>
        <div class="value">${escapeHtml(createdDate)}</div>
      </div>
      <div class="doc-info-item">
        <div class="label">Estado</div>
        <div class="value">${escapeHtml(doc.status === 'completed' ? 'Procesado' : doc.status === 'failed' ? 'Fallido' : 'Pendiente')}</div>
      </div>
      <div class="doc-info-item">
        <div class="label">ID</div>
        <div class="value" style="font-family:monospace;font-size:8pt">${escapeHtml(doc.id)}</div>
      </div>
    </div>

    ${doc.filePath ? `
      <div class="section-title">Imagen del documento</div>
      <img class="doc-image" src="${escapeHtml(doc.filePath)}" alt="Documento" />
    ` : ''}

    <div class="section-title">Datos extraídos — OCR con IA</div>
    ${extractedHtml}

    <div class="footer">
      <span>DocScan — Plataforma de digitalización de documentos</span>
      <span>Documento: ${escapeHtml(doc.id)}</span>
    </div>

    <script>window.onload=function(){window.print()}<\/script>
  </body></html>`);
  w.document.close();
}
