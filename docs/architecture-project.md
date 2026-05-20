# Arquitectura DocScan

Plataforma de digitalización de documentos y gestión de talento para RRHH con OCR e IA.

- **Backend** — NestJS 11, puerto `3001`, prefijo global `/api`
- **Frontend** — Next.js 16 (App Router) + React 19, puerto `3000`
- **DB** — PostgreSQL 15 vía Prisma 7
- **Storage** — Bunny CDN (pipeline Sharp → WebP)
- **OCR/IA** — Gemini 2.5 Flash y LM Studio, intercambiables vía `OCR_PROVIDER`

---

## Backend (NestJS)

### Bootstrap ([main.ts](backend/src/main.ts))

- CORS habilitado contra `appConfig.corsOrigins`.
- Body parser por ruta: `/api/scanner` admite hasta `20mb` (base64 cámara); el resto `256kb` como defense in depth (`scannerBodyLimit`, `defaultBodyLimit` en [app.config.ts](backend/src/config/app.config.ts)).
- `ValidationPipe` global con `whitelist`, `transform`, `forbidNonWhitelisted`.

### Guards globales ([app.module.ts](backend/src/app.module.ts))

- `JwtAuthGuard` — todas las rutas requieren JWT salvo `@Public()`.
- `ThrottlerGuard` con dos buckets:
  - `default`: 100 req/min prod, 300 dev
  - `ai`: 10 req/min prod, 30 dev (decorado en `OcrController` y `TalentPoolController`)

### Módulos y endpoints

| Módulo | Base | Endpoints |
| --- | --- | --- |
| Auth | `/api/auth` | `POST register` *(public)*, `POST login` *(public)*, `GET me` |
| Documents | `/api/documents` | `GET`, `GET stats`, `GET :id`, `POST upload`, `PATCH :id/assign`, `PATCH :id/classify-background`, `DELETE :id` |
| Ocr | `/api/ocr` | `GET providers`, `POST process`, `POST analyze`, `POST query`, `GET query/:documentId/history` |
| Scanner | `/api/scanner` | `POST capture`, `POST network-scan`, `GET feature-state`, `GET configs`, `POST configs`, `POST discover`, `DELETE configs/:id`, `GET configs/:id/ping` |
| Storage | `/api/storage` | `POST upload` |
| Persons | `/api/persons` | CRUD + `GET metrics`, `GET :id/profile`, `GET :id/completeness`, `PATCH :id/overrides`, `GET :id/documents`, `GET :id/evaluations` |
| Evaluations | `/api/persons/:personId/evaluations` | `GET`, `POST`, `DELETE :evaluationId` |
| TalentPool | `/api/talent-pool` | `POST rank`, `GET history`, `PATCH history/:id/pin`, `DELETE history` |
| Compliance | `/api/compliance` | `GET persons/:personId`, `POST persons/:personId/validate` |
| Absences | `/api/health-records` | `GET`, `GET :id/person-suggestions`, `PATCH :id/status`, `PATCH :id` |
| Dashboard | `/api/dashboard` | `GET stats` |
| Health | `/api/health` | `GET` *(public)* |

### Pipeline de archivos

Punto común de upload (`documents/upload`, `scanner/capture`, `scanner/network-scan`):

```
buffer/multer
  → StorageService.uploadFile()  // Sharp resize 4096×4096 (fit:inside) → WebP q85
  → Bunny CDN PUT → URL pública
  → DocumentsService.createDocument({ filePath: cdnUrl, … })
```

PDFs se almacenan tal cual; imágenes siempre se convierten a WebP. Tipos aceptados y tamaño máx (10 MB pre-resize) en `appConfig.upload`.

### OCR — providers intercambiables

Abstracción `OcrProvider` con registry ([providers/](backend/src/modules/ocr/providers/)):

- **GeminiProvider** (`@google/genai`) — modelo `gemini-2.5-flash` por default. Descarga la imagen del CDN, la manda inline en base64, response forzada a `application/json`.
- **LMStudioProvider** — local, OpenAI-compatible en `http://127.0.0.1:1234/v1`. Para PDFs extrae texto con `pdfreader` antes de invocar al modelo.

Modos (`POST /api/ocr/process` campo `extractionMode`): `general`, `invoice`, `receipt`, `id_card`, `custom`.

Caché implícita: si `Document.status === 'completed'` y existe `extractedData`, no se vuelve a llamar al LLM. Ante error pasa a `failed`.

### Scanner

Sin agentes locales, sin NAPS2, sin binarios. HTTP directo backend → escáner (eSCL/AirScan). Auto-discovery mDNS opcional (`SCANNER_DISCOVERY_ENABLED=true`); por default usa `NoopDiscoveryAdapter`. Detalle del protocolo y troubleshooting en [`scanner-flow.md`](scanner-flow.md).

---

## Frontend (Next.js 16 App Router)

### Capas

1. **`app/`** — routing puro; layouts por sección.
2. **`views/`** — orquestadores de pantalla (`DashboardView`, `DocumentsView`, `DocumentDetailView`, `PersonsView`, `PersonDetailView`, `ScannerView`, `TalentPoolView`, `HealthView`).
3. **`features/`** — dominios aislados (`auth`, `dashboard`, `documents`, `ocr`, `scanner`, `persons`, `evaluations`, `compliance`, `talent-pool`, `health`). Un feature **nunca** importa a otro. Estructura interna: `components/`, `hooks/`, `types/`, `api/`.
4. **`shared/`** — `api/client.ts` (Axios singleton), `auth/authStore.ts` (Zustand), `hooks/`, `components/`, `ui/`, `lib/`, `providers/`.

### Autenticación

Token JWT en doble fuente: `localStorage['docscan_token']` (cliente) + cookie `docscan_token` (SameSite=Lax, 7 días, para SSR). El interceptor de Axios agrega `Authorization: Bearer`; en 401 limpia token y redirige a `/login`.

> Hay un [`proxy.ts`](frontend/src/proxy.ts) con lógica de protección de rutas vía cookie, pero **no es** el `middleware.ts` que Next.js detecta automáticamente. Hoy la protección efectiva vive en el interceptor + redirects de páginas.

### Rutas (todas protegidas salvo `/login`, `/register`, `/`)

`/dashboard`, `/documents`, `/documents/[id]`, `/persons`, `/persons/[id]`, `/talent-pool`, `/scan`, `/scan/network`, `/health-absences`. `/` redirige a `/dashboard`. `(dev)/design` es interna.

---

## Base de datos ([schema.prisma](backend/prisma/schema.prisma))

7 modelos: `User`, `ScannerConfig`, `Person`, `Document`, `DocumentQuery`, `PersonEvaluation`, `TalentPoolRun`. Dos enums: `Ownership` (`USER` | `SYSTEM`), `DiscoverySource` (`MANUAL` | `ENV` | `MDNS`).

Notas que no se leen del schema solo:

- IDs son `cuid()`, no UUID. Los DTOs deben validar con `@IsString()`, **nunca** `@IsUUID()`.
- `Document.filePath` es URL pública del CDN, no ruta local.
- `Document.retainOriginal` controla si el archivo en CDN debe persistirse luego del OCR.
- `Document.processedAt` y `processingDurationMs` los completa `OcrService` al finalizar extracción; alimentan métricas del dashboard.
- `Document.validatedAt`/`validatedBy` quedan reservados para un flujo manual de validación humana aún no implementado.
- `ScannerConfig.ownership = SYSTEM` representa escáneres compartidos en LAN (descubiertos por mDNS o seeded por env); `USER` son los registrados por un usuario concreto.
- Cascadas:
  - `User` → cascada a Documents, ScannerConfigs (sólo `USER`), Persons, TalentPoolRuns.
  - `Person` → `Document.personId = null` (SetNull); `PersonEvaluation` cascadea.
  - `Document` → `DocumentQuery` cascadea.

---

## Flujos clave

### Captura desde cámara

```
POST /api/scanner/capture { imageData: base64, personId? }
  → CaptureImageDto (data URL regex)
  → decode base64 → Buffer → pipeline de archivos
  → { documentId, url, originalName }
```

### Escaneo de red (eSCL/AirScan)

```
POST /api/scanner/network-scan { ipAddress, port?, useTls?, verifyTls?, personId? }
  → NetworkScanDto (IsIP, port 1-65535)
  → GET  {scheme}://{ip}:{port}/eSCL/ScannerStatus            (reachability)
  → POST {scheme}://{ip}:{port}/eSCL/ScanJobs (XML ScanSettings) → Location
  → poll GET {jobLocation}/NextDocument cada 2s, timeout 30s
  → pipeline de archivos → { documentId, url, originalName }
```

### OCR sobre documento existente

```
POST /api/ocr/process { documentId, extractionMode, customFields?, provider?, model? }
  → ThrottlerGuard ai (10/min prod)
  → si status='completed' && extractedData → cache hit
  → fetch(document.filePath) → buffer → provider.extract(buffer, mode)
  → DocumentsRepository.update({ extractedData, status, processedAt, processingDurationMs })
```

### Ranking de talent pool

```
POST /api/talent-pool/rank { criterios, candidatos[] }
  → ThrottlerGuard ai
  → LLM → JSON ranking + resumen
  → INSERT TalentPoolRun (snapshot completo: criterios, candidatos, ranking)
  → { runId, ranking, resumen }
```

---

## Documentación relacionada

- [`scanner-flow.md`](scanner-flow.md) — eSCL/AirScan y troubleshooting del escáner de red
- [`windows-scanner-setup.md`](windows-scanner-setup.md) — preparación de escáner en Windows
- [`../CLAUDE.md`](../CLAUDE.md) — instrucciones del proyecto
- [`../backend/.env.example`](../backend/.env.example) — variables de entorno
