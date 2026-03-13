# Arquitectura DocScan
## Vision General
DocScan es una aplicacion de digitalizacion de documentos con OCR integrada. El proyecto sigue una arquitectura monorepo con un backend NestJS y un frontend Next.js 15.
## Estructura del Proyecto
```
docscan/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── common/          # Decoradores, guards, filtros
│   │   ├── config/         # Configuracion global
│   │   ├── modules/        # Modulos de la aplicacion
│   │   │   ├── auth/       # Autenticacion JWT
│   │   │   ├── documents/  # Gestion de documentos
│   │   │   ├── ocr/        # Procesamiento OCR
│   │   │   ├── scanner/    # Integracion scanner
│   │   │   └── health/     # Health check
│   │   └── uploads/        # Archivos subidos
│   ├── prisma/             # Schema de base de datos
│   └── package.json
├── frontend/               # App Next.js 15
│   ├── src/
│   │   ├── app/           # Páginas y layouts
│   │   ├── components/    # Componentes React
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Clientes API
│   │   ├── services/      # Servicios
│   │   └── types/         # Tipos TypeScript
│   └── package.json
├── docker-compose.yml
└── README.md
```
## Backend (NestJS)
### Modulos
#### Auth Module
Maneja autenticacion de usuarios con JWT.
- `AuthController`: Endpoints de login y registro
- `AuthService`: Logica de autenticacion
- `JwtStrategy`: Validacion de tokens JWT
#### Documents Module
Gestion de documentos subidos por usuarios.
- `DocumentsController`: CRUD de documentos
- `DocumentsService`: Logica de negocio
- `DocumentsRepository`: Acceso a datos Prisma
#### OCR Module
Procesamiento de OCR con Tesseract.js.
- `OcrController`: Endpoint para procesar OCR
- `OcrService`: Integracion con Tesseract.js
- Soporte para español (spa)
#### Scanner Module
Integracion con escaner fisico via TWAIN.
- `ScannerController`: Endpoints de escaneo
- `ScannerService`: Logica de captura de imagen
#### Health Module
Verificacion del estado del servidor.
- `HealthController`: Endpoint de health check
### Seguridad
- JWT para autenticacion
- Bcrypt para hash de contrasenas
- Guards para proteccion de rutas
- Decorador @Public() para rutas publicas
### Configuracion
- `app.config.ts`: Configuracion general (puerto, JWT)
- `database.config.ts`: Servicio Prisma
- `ocr.config.ts`: Configuracion OCR (idioma, confianza minima)
## Frontend (Next.js 15)
### Stack
- Next.js 15 con App Router
- React 19
- TailwindCSS para estilos
- Zustand para estado global
- Axios para HTTP
### Componentes
- `ScannerWidget`: Interface de escaneo
- `DocumentUpload`: Upload de archivos
- `OCRResult`: Visualizacion de resultados
- `Header`: Barra de navegacion
- `Sidebar`: Menu lateral
### Hooks Personalizados
- `useAuth`: Autenticacion (login, register, logout)
- `useOCR`: Procesamiento de OCR
- `useScanner`: Control de escaner
- `useDocuments`: Gestion de documentos
- `useApi`: Cliente HTTP
### Rutas
- `/` - Dashboard principal
- `/login` - Inicio de sesion
- `/register` - Registro de usuario
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
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  originalName String
  mimeType     String
  filePath     String
  rawText      String?
  confidence   Float?
  status       String   @default("pending")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  @@index([userId])
  @@index([status])
}
```
### Modelos
#### User
Almacena informacion de usuarios.
- email: Unico e indexado
- password: Hash de bcrypt
- Relation one-to-many con Document
#### Document
Almacena documentos procesados.
- userId: FK a User
- originalName: Nombre original del archivo
- mimeType: Tipo MIME del archivo
- filePath: Ruta en disco
- rawText: Texto extraido por OCR
- confidence: Nivel de confianza del OCR
- status: Estado (pending, processing, completed, failed)
### Indices
- `userId`: Para busquedas por usuario
- `status`: Para filtrar por estado
## API Endpoints
### Auth
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
### Documents
- `GET /api/documents` - Listar documentos
- `GET /api/documents/:id` - Obtener documento
- `POST /api/documents/upload` - Subir documento
- `DELETE /api/documents/:id` - Eliminar documento
### Scanner
- `GET /api/scanner/devices` - Listar dispositivos
- `POST /api/scanner/save` - Guardar escaneo
### OCR
- `POST /api/ocr/process` - Procesar OCR
### Health
- `GET /api/health` - Health check
## Flujo de Datos
1. Usuario se registra/login desde frontend
2. Backend genera JWT token
3. Frontend almacena token en localStorage
4. Requests subsiguientes incluyen token en header
5. Backend valida token en JwtAuthGuard
6. Documentos se guardan en disco y referencia en BD
7. OCR procesa imagenes y guarda texto extraido
## Docker
### Servicios
- `postgres`: Base de datos PostgreSQL 15
- `backend`: API NestJS
- `frontend`: App Next.js
### Volumenes
- `postgres_data`: Datos de PostgreSQL
- `uploads`: Archivos subidos