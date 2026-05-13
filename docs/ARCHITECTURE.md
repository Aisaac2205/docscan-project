# Arquitectura DocScan

## Visión General

DocScan es una plataforma de digitalización de documentos con OCR basado en IA. Monorepo con backend NestJS (puerto 3001) y frontend Next.js 15 (puerto 3000), respaldado por PostgreSQL.

---

## Estructura del Proyecto

```
docscan/
├── backend/
│   ├── src/
│   │   ├── common/
│   │   │   ├── decorators/        # @Public(), @CurrentUser()
│   │   │   └── guards/            # JwtAuthGuard (global)
│   │   ├── config/                # app.config.ts, ocr.config.ts, prisma.module.ts
│   │   └── modules/
│   │       ├── auth/              # Registro, login, JWT strategy
│   │       ├── documents/         # CRUD + upload pipeline
│   │       ├── ocr/               # Extracción de facturas con Gemini
│   │       ├── scanner/           # eSCL/AirScan + captura cámara (base64)
│   │       ├── storage/           # Sharp + Bunny CDN
│   │       └── health/            # Health check
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── uploads/                   # Directorio temporal de multer
├── frontend/
│   └── src/
│       ├── app/                   # Next.js App Router
│       │   ├── (auth)/            # login, register (públicos)
│       │   ├── dashboard/         # Página principal protegida
│       │   ├── documents/         # Galería de documentos
│       │   ├── scan/              # Interfaz de escaneo
│       │   ├── layout.tsx
│       │   ├── page.tsx           # Redirect a /dashboard
│       │   └── error.tsx
│       ├── views/                 # Orquestadores de páginas completas
│       │   ├── DashboardView/
│       │   ├── DocumentsView/
│       │   └── ScannerView/
│       ├── features/              # Módulos aislados por dominio (SRP estricto)
│       │   ├── dashboard/         # hooks (useDashboardStats), components
│       │   ├── documents/         # hooks (useDocumentAction), components, types, store
│       │   ├── ocr/               # components, store, client, types
│       │   └── scanner/           # hooks, components, store, client, types
│       ├── shared/
│       │   ├── api/client.ts      # Axios singleton con interceptores
│       │   ├── hooks/             # useAuth, useDocuments, useOCR, useScanner
│       │   ├── components/        # Layout (Header, Sidebar), ClientAuthWrapper
│       │   └── ui/toast/          # ToastContainer + store Zustand
│       └── middleware.ts          # Protección SSR de rutas
├── docker-compose.yml
└── CLAUDE.md
```

---

## Backend (NestJS)

### Configuración global

- Prefijo global: `/api`
- **JWT Guard registrado como `APP_GUARD`**: todas las rutas requieren autenticación excepto las decoradas con `@Public()`
- `app.config.ts` centraliza toda la configuración con mapeo de variables de entorno

### Módulos

#### AuthModule
- `POST /api/auth/register` y `POST /api/auth/login` decorados con `@Public()`
- Bcrypt con 10 rondas para hash de contraseñas
- JWT con expiración de 24 horas
- `JwtStrategy` extrae `{ id, email }` del payload del token

#### DocumentsModule
- CRUD completo con `DocumentsRepository` (Prisma)
- Upload vía `multer` con `diskStorage` (destino: `backend/uploads/`)
- Pipeline post-upload: `StorageService.uploadFile()` → CDN URL → `DocumentsRepository.create()`
- Los documentos pertenecen al usuario autenticado (`userId` extraído con `@CurrentUser()`)

#### StorageModule
- **Sharp**: redimensiona a máx 4096×4096 (fit: inside), convierte a WebP calidad 85
- **Bunny CDN**: sube vía HTTP PUT con `AccessKey` en cabecera
- `deleteFile()` elimina del CDN al borrar un documento
- Tipos de archivo permitidos: JPEG, PNG, WebP, GIF, TIFF (máx 10 MB)

#### OcrModule
- Usa `@google/genai` con modelo `gemini-2.5-flash`
- Descarga la imagen desde CDN (URL pública) o la lee del disco si es ruta local
- Prompt estructurado para extraer: `proveedor`, `fecha` (YYYY-MM-DD), `total` (number), `nit`
- Respuesta forzada a `application/json` (`responseMimeType`)
- **Caché**: si el documento ya tiene `status: completed` y `extractedData`, devuelve los datos sin llamar a Gemini
- En caso de error, actualiza el documento a `status: failed`

#### ScannerModule
- **`POST /api/scanner/capture`**: acepta imagen en base64 desde la cámara del navegador (WebRTC/WebUSB), la decodifica y la sube al CDN
- **`POST /api/scanner/network-scan`**: habla eSCL/AirScan vía HTTP directo con un escáner por IP — crea job (`POST /eSCL/ScanJobs`), poll a `NextDocument`, sube el resultado al CDN
- **CRUD `/api/scanner/configs`**: gestiona `ScannerConfig` (nombre, IP, puerto) por usuario en BD
- **`GET /api/scanner/configs/:id/ping`**: verifica disponibilidad vía `GET /eSCL/ScannerStatus`
- Sin dependencias de binarios locales ni agentes externos. Toda la comunicación es HTTP estándar (Node `http`/`https`).

#### HealthModule
- `GET /api/health` — verifica estado del servidor y conectividad con la base de datos

---

## Frontend (Next.js 15 App Router)

### Autenticación y protección de rutas

- **Token**: se almacena en `localStorage` (clave: `docscan_token`) y en una cookie `docscan_token` (7 días, SameSite=Lax)
- **Middleware SSR** (`middleware.ts`): lee la cookie para proteger `/dashboard`, `/documents`, `/scan` en el servidor; redirige a `/login` si no hay token
- **Cliente Axios** (`shared/api/client.ts`): interceptor de request agrega `Authorization: Bearer <token>`; interceptor de response redirige a `/login` en 401

### Arquitectura Frontend (Feature-Sliced Design)

La aplicación sigue principios estrictos de separación de responsabilidades (SRP) y estructuración por features:

1. **`app/` (Routing Layer):** Rutas puras de Next.js. Única responsabilidad: enrutamiento, lectura de parámetros y Server Components iniciales.
2. **`views/` (Orchestration Layer):** Agrupa múltiples features para armar una pantalla completa (Ej. `DashboardView`).
3. **`features/` (Domain Layer):** Módulos aislados por lógica de negocio. Un feature jamás importa a otro feature.

Cada feature en `src/features/{name}/` se ciñe a la siguiente estructura interna:
- `components/` — componentes de UI puros
- `hooks/` — hooks personalizados con toda la lógica de estado y negocio
- `types/` — interfaces y DTOs estrictamente tipados
- `api/` o `client.ts` — llamadas externas exclusivas del dominio
- `store.ts` — estado global de Zustand (si aplica)

### Rutas

| Ruta | Protegida | Descripción |
|------|-----------|-------------|
| `/` | No | Redirect a `/dashboard` |
| `/login` | No | Formulario de inicio de sesión |
| `/register` | No | Formulario de registro |
| `/dashboard` | Sí | Resumen y acceso rápido |
| `/documents` | Sí | Galería de documentos con OCR |
| `/scan` | Sí | Interfaz de escaneo físico/cámara |

### Shared

- `shared/api/client.ts` — instancia Axios singleton con `setToken()` / `getToken()`
- `shared/hooks/` — `useAuth`, `useDocuments`, `useOCR`, `useScanner`
- `shared/components/Layout/` — `Header`, `Sidebar`
- `shared/ui/toast/` — sistema de notificaciones con Zustand

---

## Base de Datos (Prisma + PostgreSQL)

### Schema

```prisma
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  password  String
  name      String
  documents Document[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model Document {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  originalName  String
  mimeType      String
  filePath      String          // URL pública del CDN
  documentType  String   @default("document")
  rawText       String?
  extractedData Json?           // Datos extraídos por Gemini
  confidence    Float?
  status        String   @default("pending")  // pending | processing | completed | failed
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId])
  @@index([status])
  @@index([documentType])
  @@index([userId, documentType])
}
```

### Notas

- `filePath` almacena la URL pública del CDN (no una ruta local)
- `extractedData` es JSON con los campos extraídos por Gemini: `{ proveedor, fecha, total, nit }`
- `documentType` permite clasificar documentos (actualmente `"document"` por defecto)
- Los documentos se eliminan en cascada al eliminar el usuario

---

## Flujo de Datos

### Upload de documento

```
Cliente (multipart/form-data)
  → DocumentsController.upload()
  → multer diskStorage → backend/uploads/ (temporal)
  → StorageService.uploadFile()
      → Sharp: resize + WebP
      → Bunny CDN PUT → URL pública
  → DocumentsService.createDocument()
      → Prisma: INSERT Document { filePath: CDN URL }
  → Respuesta: documento creado
```

### Procesamiento OCR

```
Cliente POST /api/ocr/process { documentId }
  → OcrService.extractInvoiceData()
  → DocumentsRepository.findByIdAndUserId()
  → [si completed + extractedData → retornar caché]
  → fetch(document.filePath) → imageBuffer
  → GoogleGenAI.models.generateContent(prompt + imagen base64)
  → JSON.parse(response.text)
  → DocumentsRepository.update({ extractedData, status: 'completed' })
  → Respuesta: { documentId, extractedData }
```

### Escaneo desde cámara (browser)

```
Cliente POST /api/scanner/capture { imageData: base64, personId? }
  → ScannerService.saveCapturedImage()
  → decode base64 → Buffer → writeFile temporal
  → StorageService.uploadFile() → CDN URL
  → DocumentsService.createDocument()
  → Respuesta: { documentId, url, originalName }
```

### Escaneo de red (eSCL/AirScan)

```
Cliente POST /api/scanner/network-scan { ipAddress, port?, personId? }
  → ScannerService.scanFromNetwork()
  → GET http://{ip}:{port}/eSCL/ScannerStatus     (reachability)
  → POST http://{ip}:{port}/eSCL/ScanJobs (XML ScanSettings) → Location header
  → poll GET {jobLocation}/NextDocument (cada 2s, hasta 30s)
  → StorageService.uploadFile() → CDN URL
  → DocumentsService.createDocument()
  → Respuesta: { documentId, url, originalName }
```

---

## Docker

### Servicios

- `postgres` — PostgreSQL 15
- `backend` — API NestJS
- `frontend` — App Next.js

### Volúmenes

- `postgres_data` — datos de PostgreSQL
- `uploads` — archivos temporales del backend
