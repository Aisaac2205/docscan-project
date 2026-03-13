# DocScan - OCR Scanner de Documentos

Proyecto universitario de digitalización de documentos con OCR integrado.

## 🚀 Tecnologías

- **Backend:** NestJS + TypeScript
- **Frontend:** Next.js 15 + TypeScript + TailwindCSS
- **OCR:** Tesseract.js
- **Base de Datos:** PostgreSQL + Prisma
- **Docker:** Orquestación completa

## 📋 Requisitos Previos

- Node.js 18+
- Docker y Docker Compose

## 🛠️ Instalación

### 1. Instalar dependencias

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install
```

### 2. Levantar base de datos (Docker)

```bash
docker-compose up -d postgres
```

### 3. Sincronizar esquema de Prisma

```bash
cd backend && npx prisma db push
```

## ▶️ Ejecución (Desarrollo)

Se necesitan **dos terminales**:

### Terminal 1 - Backend (puerto 3001)

```bash
cd backend
npm run start:dev
```

### Terminal 2 - Frontend (puerto 3000)

```bash
cd frontend
npm run dev
```

## 🌐 URLs

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api |
| Health Check | http://localhost:3001/api/health |

## 📁 Estructura del Proyecto

```
docscan/
├── backend/              # API NestJS
│   ├── src/
│   ├── prisma/
│   └── package.json
├── frontend/             # App Next.js 15
│   ├── src/
│   └── package.json
├── docker-compose.yml    # Orquestación
└── README.md
```

## 📝 API Endpoints

### Auth
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión

### Documents
- `GET /api/documents` - Listar documentos del usuario
- `GET /api/documents/:id` - Obtener documento específico
- `POST /api/documents/upload` - Subir documento
- `DELETE /api/documents/:id` - Eliminar documento

### Scanner
- `GET /api/scanner/devices` - Listar dispositivos disponibles
- `POST /api/scanner/save` - Guardar imagen escaneada

### OCR
- `POST /api/ocr/process` - Procesar OCR de un documento

### Health
- `GET /api/health` - Estado del servidor y base de datos

## 🐳 Producción con Docker

```bash
# Construir y levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## 🎯 Funcionalidades

1. ✅ Integración TWAIN.js para scanner físico
2. ✅ OCR con Tesseract.js (español)
3. ✅ Upload de documentos (JPG, PNG, PDF)
4. ✅ Almacenamiento PostgreSQL con Prisma
5. ✅ API REST tipada con NestJS
6. ✅ Frontend responsivo con Next.js 15
7. ✅ Autenticación JWT
8. ✅ Visualización y descarga de resultados OCR

## 📄 Licencia

MIT
