# Arquitectura DocScan

## Visión general

DocScan es una plataforma de digitalización de documentos y gestión de talento para RRHH con OCR e IA. Monorepo con dos paquetes:

- **Backend** — NestJS 11 sobre Node 18+, puerto `3001`, prefijo global `/api`
- **Frontend** — Next.js 16 (App Router) + React 19, puerto `3000`
- **Base de datos** — PostgreSQL 15 vía Prisma 7
- **Almacenamiento** — Bunny CDN (con pipeline Sharp → WebP)
- **OCR/IA** — Google Gemini 2.5 Flash y LM Studio (intercambiables vía `OCR_PROVIDER`)

---

## Estructura del proyecto

```
docscan/
├── backend/
│   ├── src/
│   │   ├── common/
│   │   │   ├── decorators/        # @Public, @CurrentUser
│   │   │   └── guards/            # JwtAuthGuard (registrado como APP_GUARD)
│   │   ├── config/
│   │   │   ├── app.config.ts      # Config central con apiPrefix, body limits, throttle, JWT
│   │   │   ├── database.config.ts # PrismaService
│   │   │   └── prisma.module.ts
│   │   └── modules/
│   │       ├── auth/              # Registro, login, JWT strategy
│   │       ├── documents/         # CRUD + upload + asignación a persona
│   │       ├── ocr/               # Gemini + LM Studio; analyze, process, query
│   │       ├── scanner/           # eSCL/AirScan + captura cámara
│   │       ├── storage/           # Sharp + Bunny CDN
│   │       ├── persons/           # CRUD personas, perfil agregado, overrides
│   │       ├── evaluations/       # Evaluaciones IA por persona
│   │       ├── talent-pool/       # Ranking masivo de candidatos
│   │       ├── compliance/        # Validación de documentos por persona
│   │       ├── absences/          # Health records (ausencias / permisos)
│   │       ├── dashboard/         # Stats agregadas para landing
│   │       └── health/            # Healthcheck
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── uploads/                   # Directorio temporal de multer
├── frontend/
│   └── src/
│       ├── app/                   # App Router
│       │   ├── (auth)/            # login, register
│       │   ├── (dev)/             # Páginas internas / debug
│       │   ├── dashboard/
│       │   ├── documents/
│       │   ├── persons/
│       │   ├── talent-pool/
│       │   ├── scan/
│       │   ├── inbox/
│       │   ├── health-absences/
│       │   └── middleware.ts
│       ├── views/                 # Orquestadores de pantallas
│       │   ├── DashboardView/
│       │   ├── DocumentsView/    DocumentDetailView/
│       │   ├── PersonsView/      PersonDetailView/
│       │   ├── TalentPoolView/
│       │   ├── ScannerView/
│       │   ├── HealthView/
│       │   └── InboxView/
│       ├── features/              # Lógica por dominio
│       │   ├── auth/  dashboard/  documents/  ocr/
│       │   ├── scanner/  persons/  evaluations/
│       │   ├── compliance/  talent-pool/  health/
│       └── shared/
│           ├── api/client.ts      # Axios singleton con interceptores 401/Bearer
│           ├── hooks/
│           ├── components/        # Header, Sidebar, ClientAuthWrapper
│           └── ui/toast/          # Sistema de toasts con Zustand
├── docs/
└── docker-compose.yml
```

---

## Backend (NestJS)

### Bootstrap y configuración

`backend/src/main.ts` levanta la app con:

- **CORS** habilitado contra `appConfig.corsOrigins` (configurable por env)
- **Prefijo global** `/api` (sourced desde `appConfig.apiPrefix`)
- **Body parser por ruta** — `/api/scanner` recibe hasta `20mb` (base64 de imágenes); el resto de las rutas queda en `256kb` como defense in depth. Los dos valores viven en `app.config.ts` (`scannerBodyLimit`, `defaultBodyLimit`).
- **`ValidationPipe` global** con `whitelist`, `transform`, `forbidNonWhitelisted` — todos los DTOs son validados con class-validator
- **`Logger` de Nest** para el bootstrap log (con contexto `[Bootstrap]`)

### Guards globales (APP_GUARD)

- **`JwtAuthGuard`** — todas las rutas requieren JWT salvo las decoradas con `@Public()`
- **`ThrottlerGuard`** — rate limiting con dos buckets:
  - `default`: 100 req/min en prod, 300 en dev
  - `ai`: 10 req/min en prod, 30 en dev (para endpoints que llaman LLMs)

### Módulos y endpoints

| Módulo | Endpoint base | Endpoints clave |
| --- | --- | --- |
| **AuthModule** | `/api/auth` | `POST register`, `POST login` (ambos `@Public()`), `GET me` |
| **DocumentsModule** | `/api/documents` | `GET`, `GET :id`, `POST upload` (multer + Sharp + CDN), `PATCH :id/assign` (a `personId`), `DELETE :id` |
| **OcrModule** | `/api/ocr` | `GET providers`, `POST process` (extracción estructurada), `POST analyze` (análisis libre), `POST query`, `GET query/:documentId/history` |
| **ScannerModule** | `/api/scanner` | `POST capture` (base64 cámara), `POST network-scan` (eSCL), CRUD `configs`, `GET configs/:id/ping` |
| **StorageModule** | `/api/storage` | `POST upload` (entrada directa al pipeline Sharp + Bunny) |
| **PersonsModule** | `/api/persons` | CRUD, `GET :id/profile` (perfil agregado), `PATCH :id/overrides`, `GET :id/documents`, `GET :id/evaluations` |
| **EvaluationsModule** | `/api/persons/:personId/evaluations` | `GET`, `POST` (corre evaluación IA), `DELETE :evaluationId` |
| **TalentPoolModule** | `/api/talent-pool` | `POST rank` (ranking IA masivo), `GET history`, `PATCH history/:id/pin`, `DELETE history` |
| **ComplianceModule** | `/api/compliance` | `GET persons/:personId`, `POST persons/:personId/validate` |
| **AbsencesModule** | `/api/health-records` | `GET`, `PATCH :id/status` |
| **DashboardModule** | `/api/dashboard` | `GET stats` |
| **HealthModule** | `/api/health` | `GET` — estado del servidor y DB |

### Pipeline de archivos

Tanto `documents/upload`, `scanner/capture` como `scanner/network-scan` convergen en el mismo pipeline downstream:

```
buffer/multer
  → StorageService.uploadFile()
      → Sharp: resize máx 4096×4096 (fit: inside) → WebP calidad 85
      → Bunny CDN HTTP PUT → URL pública
  → DocumentsService.createDocument({ filePath: cdnUrl, ... })
      → Prisma INSERT Document
```

Tipos aceptados: `image/jpeg`, `image/png`, `image/jpg`, `application/pdf` (máx 10 MB pre-resize, configurable en `appConfig.upload.maxFileSize`).

### OCR — providers intercambiables

El módulo OCR abstrae detrás de una interfaz a dos providers:

- **GeminiProvider** (`@google/genai`) — modelo `gemini-2.5-flash` por default, descarga la imagen desde CDN y la manda inline en base64. Response forzada a `application/json`.
- **LMStudioProvider** — local, vía OpenAI-compatible API en `http://127.0.0.1:1234/v1`. Para PDFs, extrae texto primero con `pdfreader` antes de mandarlo al modelo.

Modos de extracción soportados (`POST /api/ocr/process` con `mode`):
- `general` (texto completo)
- `invoice` (factura: proveedor, fecha, total, NIT)
- `receipt` (recibo / ticket)
- `id_card` (DPI / cédula)
- `custom` (campos definidos por el usuario)

Caché implícita: si el `Document.status === 'completed'` y ya tiene `extractedData`, no se vuelve a llamar al LLM. Ante error, status pasa a `failed`.

### ScannerModule

Toda la integración está documentada en [`scanner-flow.md`](./scanner-flow.md). Resumen:

- Sin agentes locales, sin NAPS2, sin binarios. HTTP directo backend → escáner.
- DTOs validados con class-validator (`CaptureImageDto`, `NetworkScanDto`, `CreateScannerConfigDto`).
- Logging estructurado con `Logger` por instancia — log de inicio, polling, fin con `durationMs`. NUNCA loggea el contenido base64 ni el PDF, solo metadata.

---

## Frontend (Next.js 16 App Router)

### Capas

1. **`app/` (routing layer)** — rutas puras de Next.js. Lectura de params y server components iniciales.
2. **`views/` (orchestration layer)** — orquestan varias features para armar una pantalla (ej. `DashboardView`, `PersonDetailView`).
3. **`features/` (domain layer)** — módulos aislados por dominio. Un feature **nunca** importa a otro feature. Estructura interna:
   - `components/` — UI puro
   - `hooks/` — lógica de estado y negocio
   - `types/` — interfaces y DTOs
   - `client.ts` o `api/` — llamadas externas exclusivas del dominio
   - `store.ts` — Zustand store (si aplica)
4. **`shared/`** — Axios client, hooks transversales, layout components, sistema de toasts.

### Autenticación

- Token JWT almacenado en **doble fuente**: `localStorage['docscan_token']` (acceso por código cliente) + cookie `docscan_token` (SameSite=Lax, 7 días, para SSR)
- **Middleware SSR** (`middleware.ts`) lee la cookie y protege rutas; redirige a `/login` si falta
- **Axios interceptor** agrega `Authorization: Bearer <token>` en cada request; en 401 limpia el token y redirige a `/login`

### Rutas

| Ruta | Protegida | Descripción |
|------|-----------|-------------|
| `/` | No | Redirect a `/dashboard` |
| `/login`, `/register` | No | Auth |
| `/dashboard` | Sí | Stats y acceso rápido |
| `/documents` | Sí | Galería de documentos con OCR |
| `/persons` | Sí | Listado y detalle de personas |
| `/talent-pool` | Sí | Ranking IA de candidatos |
| `/scan` | Sí | Captura cámara / escáner de red |
| `/inbox` | Sí | Bandeja de pendientes |
| `/health-absences` | Sí | Permisos y ausencias |

---

## Base de datos (Prisma + PostgreSQL)

8 modelos. Relaciones clave: `User` es root multi-tenant; todo lo demás cuelga de `userId`. `Document` puede asociarse opcionalmente a una `Person`.

```prisma
model User {
  id             String          @id @default(cuid())
  email          String          @unique
  password       String
  name           String
  documents      Document[]
  scannerConfigs ScannerConfig[]
  talentPoolRuns TalentPoolRun[]
  persons        Person[]
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
}

model ScannerConfig {
  id         String    @id @default(cuid())
  userId     String
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  name       String
  ip         String
  port       Int       @default(80)
  lastSeenAt DateTime?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  @@index([userId])
}

model Person {
  id               String   @id @default(cuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  fullName         String
  cui              String?
  email            String?
  phone            String?
  role             String   @default("candidate")
  status           String   @default("active")
  notes            String?  @db.Text
  profileOverrides Json?
  documents        Document[]
  evaluations      PersonEvaluation[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  @@unique([userId, cui])
  @@index([userId, fullName])
  @@index([userId, status])
}

model Document {
  id             String          @id @default(cuid())
  userId         String
  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  personId       String?
  person         Person?         @relation(fields: [personId], references: [id], onDelete: SetNull)
  originalName   String
  mimeType       String
  filePath       String           // URL pública del CDN
  documentType   String          @default("document")
  rawText        String?
  extractedData  Json?            // Datos estructurados del OCR
  confidence     Float?
  status         String          @default("pending")   // pending | processing | completed | failed
  retainOriginal Boolean         @default(true)
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  queries        DocumentQuery[]
  @@index([userId])
  @@index([personId])
  @@index([status])
  @@index([documentType])
  @@index([userId, documentType])
}

model DocumentQuery {
  id         String   @id @default(cuid())
  documentId String
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  question   String
  answer     String   @db.Text
  createdAt  DateTime @default(now())
  @@index([documentId])
}

model PersonEvaluation {
  id        String   @id @default(cuid())
  personId  String
  person    Person   @relation(fields: [personId], references: [id], onDelete: Cascade)
  provider  String
  model     String?
  prompt    String   @db.Text
  result    String   @db.Text
  score     Float?
  createdAt DateTime @default(now())
  @@index([personId])
  @@index([personId, createdAt])
}

model TalentPoolRun {
  id                 String   @id @default(cuid())
  userId             String
  user               User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  provider           String
  model              String?
  criteriosSnapshot  Json
  candidatosSnapshot Json
  rankingSnapshot    Json
  resumenGeneral     String   @db.Text
  isPinned           Boolean  @default(false)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  @@index([userId])
  @@index([userId, createdAt])
  @@index([userId, isPinned, createdAt])
}
```

### Notas sobre el schema

- Todos los IDs son `cuid()`, no UUID. Cualquier validación DTO debe usar `@IsString()`, no `@IsUUID()`.
- `Document.filePath` es la URL pública del CDN, no una ruta local.
- `Document.retainOriginal` controla si el archivo en el CDN debe persistirse luego del OCR.
- Cascadas:
  - Borrar `User` → cascada todo (Documents, ScannerConfigs, Persons, TalentPoolRuns, Evaluations).
  - Borrar `Person` → `Document.personId` queda en `null` (SetNull); las evaluaciones cascadean.
  - Borrar `Document` → sus `DocumentQuery` cascadean.

---

## Flujos de datos clave

### Upload de documento

```
Cliente POST /api/documents/upload  (multipart/form-data)
  → multer diskStorage → backend/uploads/ (temporal)
  → StorageService.uploadFile()
      → Sharp resize + WebP
      → Bunny CDN PUT → URL pública
  → DocumentsService.createDocument({ filePath: cdnUrl })
  → unlink del temporal
  → Respuesta: documento creado
```

### Captura desde cámara (browser)

```
Cliente POST /api/scanner/capture { imageData: base64, personId? }
  → ValidationPipe: CaptureImageDto (data URL regex)
  → ScannerService.saveCapturedImage()
  → decode base64 → Buffer → writeFile temporal
  → StorageService.uploadFile() → CDN URL
  → DocumentsService.createDocument()
  → Respuesta: { documentId, url, originalName }
```

### Escaneo de red (eSCL/AirScan)

```
Cliente POST /api/scanner/network-scan { ipAddress, port?, personId? }
  → ValidationPipe: NetworkScanDto (IsIP, port 1-65535)
  → ScannerService.scanFromNetwork()
  → GET http://{ip}:{port}/eSCL/ScannerStatus              (reachability)
  → POST http://{ip}:{port}/eSCL/ScanJobs (XML ScanSettings) → Location
  → poll GET {jobLocation}/NextDocument cada 2s, timeout 30s
  → StorageService.uploadFile() → CDN URL
  → DocumentsService.createDocument()
  → Respuesta: { documentId, url, originalName }
```

### OCR sobre documento existente

```
Cliente POST /api/ocr/process { documentId, mode, customFields? }
  → ThrottlerGuard (bucket 'ai': 10/min en prod)
  → OcrService.process()
  → DocumentsRepository.findByIdAndUserId()
  → [si status='completed' && extractedData → cache hit, retorna]
  → fetch(document.filePath) → buffer
  → provider.extract(buffer, mode)        // Gemini o LM Studio
  → DocumentsRepository.update({ extractedData, status: 'completed' })
  → Respuesta: { documentId, extractedData }
```

### Ranking de talent pool

```
Cliente POST /api/talent-pool/rank { criterios, candidatos[] }
  → ThrottlerGuard (bucket 'ai')
  → TalentPoolService.rank()
  → genera prompt → LLM → JSON ranking + resumen general
  → INSERT TalentPoolRun snapshot completo
  → Respuesta: { runId, ranking, resumen }
```

---

## Docker

### Servicios (`docker-compose.yml`)

- `postgres` — PostgreSQL 15
- `backend` — API NestJS
- `frontend` — App Next.js

### Volúmenes

- `postgres_data` — datos de PostgreSQL persistentes
- `uploads` — archivos temporales del backend (entre Sharp y upload al CDN)

---

## Documentación relacionada

- [`scanner-flow.md`](./scanner-flow.md) — detalle del protocolo eSCL/AirScan y troubleshooting del escáner de red
- [`../CLAUDE.md`](../CLAUDE.md) — instrucciones del proyecto para herramientas IA
- [`../backend/.env.example`](../backend/.env.example) — variables de entorno del backend
