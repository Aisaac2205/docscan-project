# DocScan - Plataforma de Digitalización de Documentos (RRHH)

Proyecto de digitalización de documentos enfocado en Recursos Humanos con OCR integrado mediante IA (soporte para CVs, DPIs, Constancias Médicas y Documentos Fiscales). Monorepo con backend NestJS y frontend Next.js 15.

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Backend | NestJS + TypeScript |
| Frontend | Next.js 15 (App Router) + TypeScript + TailwindCSS |
| OCR / IA | Google Gemini 2.5 Flash / Modelos Locales (LM Studio) usando API OpenAI |
| Almacenamiento | Bunny CDN + Sharp (optimización de imágenes) |
| Scanner físico | NAPS2 CLI (con fallback a imagen de muestra) |
| Base de datos | PostgreSQL + Prisma ORM |
| Estado global | Zustand |
| HTTP cliente | Axios |
| Docker | Orquestación completa |

## Requisitos Previos

- Node.js 18+
- Docker y Docker Compose
- Cuenta en [Bunny CDN](https://bunny.net) (para almacenamiento de archivos)
- API Key de Google Gemini o instancia local de LM Studio (para OCR)
- NAPS2 instalado (opcional, para scanner físico)

## Instalación

### 1. Instalar dependencias

```bash
npm run install:all
```

### 2. Configurar variables de entorno

```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env` con los valores correspondientes (ver sección de Variables de Entorno).

### 3. Levantar base de datos

```bash
docker-compose up -d postgres
```

### 4. Sincronizar esquema de base de datos

```bash
npm run db:push        # desarrollo rápido (sin migración)
# o
npm run db:migrate     # crear y aplicar migración
```

## Ejecución en Desarrollo

```bash
# Terminal 1 - Backend (puerto 3001)
npm run dev:backend

# Terminal 2 - Frontend (puerto 3000)
npm run dev:frontend
```

## Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `DATABASE_URL` | Cadena de conexión PostgreSQL | Sí |
| `JWT_SECRET` | Secreto para firmar tokens JWT | Sí |
| `GEMINI_API_KEY` | API Key de Google Gemini para OCR | No (si usas LM Studio) |
| `BUNNY_STORAGE_ZONE` | Zona de almacenamiento Bunny CDN | Sí |
| `BUNNY_STORAGE_ACCESS_KEY` | Access key de Bunny CDN | Sí |
| `BUNNY_STORAGE_HOST` | Host de storage de Bunny | Sí |
| `BUNNY_CDN_BASE_URL` | URL base del CDN para acceso público | Sí |
| `NEXT_PUBLIC_API_URL` | URL base de la API (frontend) | Sí |
| `OCR_PROVIDER` | `gemini` o `lmstudio` (por defecto `gemini`) | No |
| `LMSTUDIO_BASE_URL` | URL de LM Studio (default: `http://127.0.0.1:1234/v1`) | No |
| `LMSTUDIO_MODEL` | Nombre del modelo en LM Studio (opcional) | No |
| `NAPS2_CLI_PATH` | Ruta a `naps2.console.exe` | No |
| `NAPS2_FORCE_MOCK` | `true` para omitir NAPS2 y usar imagen de muestra | No |

## URLs

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api |
| Health Check | http://localhost:3001/api/health |

## Estructura del Proyecto

```
docscan/
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── common/             # Guards, decoradores
│   │   ├── config/             # Configuración global
│   │   └── modules/
│   │       ├── auth/           # JWT + bcrypt
│   │       ├── documents/      # CRUD + upload
│   │       ├── ocr/            # Gemini 2.5 Flash
│   │       ├── scanner/        # NAPS2 CLI
│   │       ├── storage/        # Sharp + Bunny CDN
│   │       └── health/         # Health check
│   ├── prisma/                 # Schema y migraciones
│   └── mocks/                  # Imagen de muestra para mock scan
├── frontend/                   # App Next.js 15
│   └── src/
│       ├── app/                # Rutas (App Router - UI routing y RSC)
│       ├── views/              # Vistas orquestadoras (Feature Composition)
│       ├── features/           # Módulos por dominio (Aislados: hooks, components, types)
│       └── shared/             # API client, hooks, UI compartida
├── docker-compose.yml
├── CLAUDE.md
└── README.md
```

## API Endpoints

### Auth (públicos)
- `POST /api/auth/register` — Registro de usuario
- `POST /api/auth/login` — Inicio de sesión → devuelve JWT

### Documents (requieren JWT)
- `GET /api/documents` — Listar documentos del usuario autenticado
- `GET /api/documents/:id` — Obtener documento por ID
- `POST /api/documents/upload` — Subir imagen (multipart/form-data, campo `file`)
- `DELETE /api/documents/:id` — Eliminar documento

### Scanner (requieren JWT)
- `GET /api/scanner/devices` — Listar perfiles NAPS2 disponibles
- `POST /api/scanner/scan` — Disparar escaneo físico vía NAPS2 (body: `{ deviceId? }`)
- `POST /api/scanner/capture` — Guardar imagen capturada en base64 (body: `{ imageData }`)

### OCR (requiere JWT)
- `POST /api/ocr/process` — Extraer datos del documento usando modelo IA (body: `{ documentId, mode }`)
- `POST /api/ocr/analyze` — Analizar visualmente el documento para diagnosticar qué es (body: `{ documentId }`)
- `POST /api/ocr/query` — Hacer una pregunta textual en chat usando el documento de contexto (body: `{ documentId, question }`)

### Health
- `GET /api/health` — Estado del servidor y base de datos

## Flujo Principal

```
Usuario sube imagen
  → multer guarda en disco temporalmente
  → Sharp optimiza a WebP (máx 4096×4096, calidad 85)
  → Bunny CDN almacena la imagen y devuelve URL pública
  → Prisma guarda el documento con la URL CDN en PostgreSQL
  → Usuario solicita OCR
  → OcrService descarga la imagen desde CDN
  → Gemini 2.5 Flash extrae: proveedor, fecha, total, NIT
  → Resultado JSON se persiste en Document.extractedData
```

## Producción con Docker

```bash
npm run docker:build    # Construir imágenes
npm run docker:up       # Levantar todos los servicios
docker-compose logs -f  # Ver logs
docker-compose down     # Detener servicios
```

## Funcionalidades Implementadas

1. Autenticación JWT con registro y login
2. Upload de imágenes con optimización automática (Sharp → WebP)
3. Almacenamiento en Bunny CDN
4. OCR enfocado en RRHH (CVs, DPIs, Constancias Médicas, RTUs, etc.)
5. Caché de resultados OCR (no re-procesa si ya está completado)
6. Escaneo físico vía NAPS2 CLI con fallback a imagen de muestra
7. Captura de imágenes en base64 desde cámara/webcam
8. Frontend con rutas protegidas (middleware SSR + cookie `docscan_token`)
9. Inteligencia Artificial multi-proveedor (Google Gemini o modelos locales vía LM Studio)
10. Chat conversacional sobre documentos individuales (Query API)

## Configurar LM Studio (Modelos Locales de IA)

El backend soporta oficialmente conectarse a instancias locales de _LM Studio_ (u otros compatibles con API de OpenAI) para ofrecer privacidad de datos total al procesar los documentos RRHH.

Para habilitarlo:

1. Abre **LM Studio**.
2. Dirígete a la vista "Local Server" y levanta el servidor (generalmente en `http://127.0.0.1:1234/v1`).
3. Carga un modelo preferiblemente **multimodal/Vision** en caso de que tus documentos sean imágenes y no PDFs (ej: Llava, Qwen-VL).
4. Configura en `backend/.env` las siguientes variables (ajusta las URLs si ejecutas backend dentro de un Docker y LM Studio en el host):

```env
OCR_PROVIDER=lmstudio
LMSTUDIO_BASE_URL=http://127.0.0.1:1234/v1
LMSTUDIO_MODELS_URL=http://127.0.0.1:1234/v1/models
# LMSTUDIO_MODEL=nombre_modelo_opcional # (deja vacío para usar el listado activo por defecto)
```

5. Reinicia el API (`npm run dev:backend`) para re-cargar estas variables.

## Licencia

MIT
