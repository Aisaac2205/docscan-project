# DocScan - Plataforma de Digitalización de Documentos (RRHH)

Proyecto de digitalización de documentos con OCR integrado. Monorepo con backend NestJS y frontend Next.js.

## Escaneo: arquitectura actual

DocScan soporta dos fuentes de imagen:

- **Cámara del navegador** (`POST /api/scanner/capture`): el frontend captura desde WebRTC/WebUSB y envía base64 al backend.
- **Escáner de red vía eSCL/AirScan** (`POST /api/scanner/network-scan`): el backend habla HTTP directo con el escáner por IP, sin agentes intermedios.

Los escáneres se administran como `ScannerConfig` (CRUD en `/api/scanner/configs`) con ping a `/eSCL/ScannerStatus`.

> Más detalle en `docs/SCANNER.md` y `docs/ARCHITECTURE.md`.

---

## Tecnologías

| Capa             | Tecnología                   |
| ---------------- | ---------------------------- |
| Backend          | NestJS + TypeScript          |
| Frontend         | Next.js (App Router) + React |
| OCR / IA         | Google Gemini / LM Studio    |
| Almacenamiento   | Bunny CDN + Sharp            |
| Escáner de red   | eSCL / AirScan (HTTP nativo) |
| Base de datos    | PostgreSQL + Prisma          |
| Estado global    | Zustand                      |

---

## Requisitos previos

- Node.js 18+
- Docker y Docker Compose
- PostgreSQL (vía docker-compose)
- Cuenta Bunny CDN (si querés almacenamiento remoto)
- API key de Gemini o instancia de LM Studio
- Para escaneo de red: dispositivo compatible con AirScan/eSCL accesible por IP desde el backend

---

## Instalación

### 1) Instalar dependencias

```bash
npm run install:all
```

### 2) Configurar entorno backend

```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env` con tus valores. Mínimo requerido:

- `DATABASE_URL`
- `JWT_SECRET`
- `BUNNY_STORAGE_ZONE`
- `BUNNY_STORAGE_ACCESS_KEY`
- `BUNNY_STORAGE_HOST`
- `BUNNY_CDN_BASE_URL`
- `GEMINI_API_KEY` (o configuración de LM Studio)

### 3) Levantar base de datos

```bash
docker-compose up -d postgres
```

### 4) Sincronizar schema

```bash
cd backend
npx prisma db push
npx prisma generate
```

### 5) Levantar app

```bash
npm run dev:backend
npm run dev:frontend
```

---

## URLs locales

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001/api`
- Health: `http://localhost:3001/api/health`

---

## Licencia

MIT
