# DocScan - Plataforma de Digitalización de Documentos (RRHH)

Proyecto de digitalización de documentos con OCR integrado. Monorepo con backend NestJS y frontend Next.js.

## ⚠️ Escáner físico: alcance real

La integración de escáner físico está orientada a **entornos locales/on-premise**.

- ✅ Soportado: PC Windows local + NAPS2 + Scanner Agent + Backend DocScan.
- ❌ No soportado: escaneo de hardware físico directo desde web pública.

Este flujo se mantiene como **demo sólida para operación local**.

---

## Documentación clave (on-prem)

1. **`SCANNER.md`**  
   Arquitectura, límites, contrato backend, troubleshooting y checklist operativo.
2. **`scanner-agent/README.md`**  
   Instalación del agente local, variables `.env`, modos (`scan`, `flush-queue`, `daemon`).
3. **`backend/.env.example`**  
   Variables mínimas del backend (incluye `SCANNER_AGENT_KEY`).

---

## Tecnologías

| Capa | Tecnología |
|------|------------|
| Backend | NestJS + TypeScript |
| Frontend | Next.js (App Router) + React |
| OCR / IA | Google Gemini / LM Studio |
| Almacenamiento | Bunny CDN + Sharp |
| Scanner físico (on-prem) | NAPS2 CLI + Scanner Agent |
| Base de datos | PostgreSQL + Prisma |
| Estado global | Zustand |

---

## Requisitos previos

- Node.js 18+
- Docker y Docker Compose
- PostgreSQL (vía docker-compose)
- Cuenta Bunny CDN (si querés almacenamiento remoto)
- API key de Gemini o instancia de LM Studio
- Para scanner on-prem: Windows 10/11 + NAPS2

---

## Instalación (stack general)

### 1) Instalar dependencias

```bash
npm run install:all
```

### 2) Configurar entorno backend

```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env` con tus valores.

### 3) Levantar base de datos

```bash
docker-compose up -d postgres
```

### 4) Sincronizar schema

```bash
npm run db:push
# o
npm run db:migrate
```

### 5) Levantar app

```bash
npm run dev:backend
npm run dev:frontend
```

---

## Guía corta: cómo agregar `.env` correctamente

### Backend (`backend/.env`)

1. Crear archivo desde plantilla:

```bash
cp backend/.env.example backend/.env
```

2. Completar al menos:

- `DATABASE_URL`
- `JWT_SECRET`
- `BUNNY_STORAGE_ZONE`
- `BUNNY_STORAGE_ACCESS_KEY`
- `BUNNY_STORAGE_HOST`
- `BUNNY_CDN_BASE_URL`
- `SCANNER_AGENT_KEY` (si usarás scanner on-prem)

#### Cómo generar `SCANNER_AGENT_KEY` segura

PowerShell:

```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
($bytes | ForEach-Object { $_.ToString("x2") }) -join ""
```

Luego usar el MISMO valor en:

- `backend/.env` → `SCANNER_AGENT_KEY=...`
- `scanner-agent/.env` → `SCANNER_AGENT_KEY=...`

Si no coinciden, el backend rechazará peticiones del agent con `401`.

3. Guardar y reiniciar backend.

### Scanner Agent (`scanner-agent/.env`)

1. Crear desde plantilla:

```bash
cd scanner-agent
copy .env.example .env
```

2. Completar obligatorias:

- `NAPS2_PATH`
- `SCAN_TEMP_DIR`
- `BACKEND_BASE_URL`
- `SCANNER_AGENT_KEY` (**debe coincidir** con backend)
- `TARGET_USER_ID`
- `EXTRACTION_MODE`

3. Completar operativas recomendadas:

- `QUEUE_RETRY_BASE_MS`
- `HEARTBEAT_INTERVAL_MS`
- `FLUSH_INTERVAL_MS`
- `SCANNER_AGENT_ID`
- `SCANNER_AGENT_VERSION`

> Más detalle y ejemplos completos en `scanner-agent/README.md`.

---

## Inicio rápido del flujo on-prem scanner

1. Revisar `SCANNER.md`.
2. Configurar backend `.env` con `SCANNER_AGENT_KEY`.
3. Instalar NAPS2 y validar CLI en Windows.
4. Configurar `scanner-agent/.env`.
5. Ejecutar:

```bash
cd scanner-agent
npm install
npm run dev
```

Modo continuo:

```bash
npm run dev:daemon
```

---

## URLs locales

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001/api`
- Health: `http://localhost:3001/api/health`

---

## Licencia

MIT
