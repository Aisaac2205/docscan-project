/**
 * POC — eSCL scan against a local network scanner (EPSON L4360 Series).
 *
 * Flow:
 *   1. GET  /eSCL/ScannerCapabilities       → confirm scanner is reachable
 *   2. POST /eSCL/ScanJobs (XML body)        → 201 Created + Location header
 *   3. GET  {Location}/NextDocument          → binary PDF/JPEG → save to disk
 *
 * Run:
 *   cd backend && npx ts-node scripts/test-escl-scan.ts
 *
 * Env vars (all optional, defaults sane for testing):
 *   ESCL_SCANNER_URL          (default: https://192.168.1.100)
 *   ESCL_DEFAULT_RESOLUTION   (default: 300)
 *   ESCL_DEFAULT_COLOR_MODE   (default: RGB24)        [RGB24 | Grayscale8 | BlackAndWhite1]
 *   ESCL_DEFAULT_FORMAT       (default: application/pdf)
 */

import * as https from 'node:https';
import { URL } from 'node:url';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const SCANNER_URL = process.env.ESCL_SCANNER_URL ?? 'https://192.168.1.100';
const RESOLUTION = parseInt(process.env.ESCL_DEFAULT_RESOLUTION ?? '300', 10);
const COLOR_MODE = process.env.ESCL_DEFAULT_COLOR_MODE ?? 'RGB24';
const FORMAT = process.env.ESCL_DEFAULT_FORMAT ?? 'application/pdf';
const OUTPUT_DIR = resolve(__dirname, 'output');

// Self-signed cert on the printer — acceptable on LAN-only access.
const agent = new https.Agent({ rejectUnauthorized: false });

interface EsclResponse {
  status: number;
  headers: Record<string, string | string[] | undefined>;
  body: Buffer;
}

function request(
  method: 'GET' | 'POST',
  url: string,
  body?: string,
  headers: Record<string, string> = {},
): Promise<EsclResponse> {
  const parsed = new URL(url);
  return new Promise((resolvePromise, reject) => {
    const req = https.request(
      {
        method,
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: parsed.pathname + parsed.search,
        agent,
        headers: {
          ...(body ? { 'Content-Type': 'text/xml; charset=utf-8', 'Content-Length': Buffer.byteLength(body) } : {}),
          ...headers,
        },
        timeout: 60_000,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () =>
          resolvePromise({
            status: res.statusCode ?? 0,
            headers: res.headers,
            body: Buffer.concat(chunks),
          }),
        );
      },
    );
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('Request timed out')));
    if (body) req.write(body);
    req.end();
  });
}

function buildScanSettingsXml(): string {
  // A4 @ 300ths of inch: 8.27" × 11.69" → 2480 × 3507
  return `<?xml version="1.0" encoding="UTF-8"?>
<scan:ScanSettings xmlns:pwg="http://www.pwg.org/schemas/2010/12/sm" xmlns:scan="http://schemas.hp.com/imaging/escl/2011/05/03">
  <pwg:Version>2.6</pwg:Version>
  <scan:Intent>TextAndGraphic</scan:Intent>
  <pwg:ScanRegions>
    <pwg:ScanRegion>
      <pwg:Height>3507</pwg:Height>
      <pwg:Width>2480</pwg:Width>
      <pwg:XOffset>0</pwg:XOffset>
      <pwg:YOffset>0</pwg:YOffset>
      <pwg:ContentRegionUnits>escl:ThreeHundredthsOfInches</pwg:ContentRegionUnits>
    </pwg:ScanRegion>
  </pwg:ScanRegions>
  <pwg:InputSource>Platen</pwg:InputSource>
  <scan:ColorMode>${COLOR_MODE}</scan:ColorMode>
  <scan:XResolution>${RESOLUTION}</scan:XResolution>
  <scan:YResolution>${RESOLUTION}</scan:YResolution>
  <pwg:DocumentFormat>${FORMAT}</pwg:DocumentFormat>
</scan:ScanSettings>`;
}

function extOf(format: string): string {
  if (format === 'application/pdf') return 'pdf';
  if (format === 'image/jpeg') return 'jpg';
  return 'bin';
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  eSCL POC — DocScan');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Scanner:    ${SCANNER_URL}`);
  console.log(`Resolution: ${RESOLUTION} DPI`);
  console.log(`Color:      ${COLOR_MODE}`);
  console.log(`Format:     ${FORMAT}`);
  console.log('');

  // ── Step 1: Capabilities ──────────────────────────────────────
  console.log('[1/3] GET /eSCL/ScannerCapabilities ...');
  const caps = await request('GET', `${SCANNER_URL}/eSCL/ScannerCapabilities`);
  if (caps.status !== 200) {
    throw new Error(`Expected 200, got ${caps.status}. Body:\n${caps.body.toString('utf-8')}`);
  }
  const model = /<pwg:MakeAndModel>([^<]+)/.exec(caps.body.toString('utf-8'))?.[1] ?? 'unknown';
  console.log(`      ✓ ${model}\n`);

  // ── Step 2: Submit ScanJob ────────────────────────────────────
  console.log('[2/3] POST /eSCL/ScanJobs ...');
  console.log('      Coloca el documento en el vidrio del escáner. Disparando job...');
  const xml = buildScanSettingsXml();
  const job = await request('POST', `${SCANNER_URL}/eSCL/ScanJobs`, xml);
  if (job.status !== 201) {
    throw new Error(
      `Expected 201 Created, got ${job.status}. Body:\n${job.body.toString('utf-8')}`,
    );
  }
  const location = job.headers['location'];
  if (!location || typeof location !== 'string') {
    throw new Error('No Location header in 201 response');
  }
  // Location may be absolute or relative — normalize to absolute
  const jobUrl = location.startsWith('http') ? location : `${SCANNER_URL}${location}`;
  console.log(`      ✓ Job creado: ${jobUrl}\n`);

  // ── Step 3: Fetch document ────────────────────────────────────
  console.log('[3/3] GET {job}/NextDocument ...');
  console.log('      Esperando que el escáner termine (puede tardar 10-30s)...');
  const t0 = Date.now();
  const doc = await request('GET', `${jobUrl}/NextDocument`);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  if (doc.status === 404) {
    throw new Error('404 — no hay documento listo. ¿Está el papel en el vidrio?');
  }
  if (doc.status !== 200) {
    throw new Error(`Expected 200, got ${doc.status}. Body:\n${doc.body.toString('utf-8').slice(0, 500)}`);
  }

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
  const filename = `scan-${Date.now()}.${extOf(FORMAT)}`;
  const filepath = join(OUTPUT_DIR, filename);
  writeFileSync(filepath, doc.body);

  console.log(`      ✓ Recibido en ${elapsed}s — ${(doc.body.length / 1024).toFixed(1)} KB`);
  console.log(`      ✓ Guardado en: ${filepath}\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ✓ Handshake eSCL completo. Abrí el archivo para verificar.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main().catch((err) => {
  console.error('\n✗ FALLÓ el POC:');
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
