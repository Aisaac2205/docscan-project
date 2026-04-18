# Scanner Agent — Instalación y operación (Windows + NAPS2)

> Este componente es el puente entre escáner físico local y DocScan OCR.
>
> **Importante:** esta integración está orientada a entornos **on-prem/locales**.  
> No está pensada para escanear hardware físico directamente desde una web pública.

---

## 1) Qué hace el agent

1. Ejecuta NAPS2 Console para crear un PDF temporal.
2. Envía el PDF al backend (`POST /api/ocr/scan`).
3. Si la subida falla, guarda el PDF en cola persistente local.
4. Reintenta pendientes (`flush-queue`) o automáticamente (`daemon`).
5. Envía heartbeat operativo (`/api/ocr/scan/heartbeat`) en modo daemon.

---

## 2) Requisitos

- Windows 10/11 Pro
- Node.js 20+
- NAPS2 instalado
- Backend DocScan operativo por HTTPS

---

## 3) Instalar NAPS2 correctamente

1. Instalar NAPS2 con configuración estándar.
2. Confirmar ruta CLI:

```powershell
Test-Path "C:\Program Files\NAPS2\NAPS2.Console.exe"
```

3. Crear perfil en NAPS2 GUI (recomendado para `-a`):
   - ADF
   - Duplex
   - 300 DPI
   - A4/Carta
   - Color

4. Prueba manual:

```powershell
"C:\Program Files\NAPS2\NAPS2.Console.exe" -o "C:\TempScans\agent_probe.pdf" -a -f
```

Si falla por perfil, usar `NAPS2_ARGUMENTS` con fallback `--noprofile`.

---

## 4) Instalación del agent

Desde `scanner-agent/`:

```bash
npm install
```

Copiar variables de entorno:

```bash
copy .env.example .env
```

Completar `.env`.

---

## 5) Variables de entorno (.env)

Obligatorias:

- `NAPS2_PATH`  
  Ej: `C:\Program Files\NAPS2\NAPS2.Console.exe`
- `SCAN_TEMP_DIR`  
  Ej: `C:\TempScans`
- `BACKEND_BASE_URL`  
  Ej: `https://tu-backend.local`
- `SCANNER_AGENT_KEY`  
  Debe coincidir con backend `SCANNER_AGENT_KEY`
- `TARGET_USER_ID`  
  Usuario dueño de los documentos subidos
- `EXTRACTION_MODE`  
  `cv | id_card | fiscal_social | medical_cert | general | custom`

### Ejemplo real mínimo

```env
NAPS2_PATH=C:\Program Files\NAPS2\NAPS2.Console.exe
SCAN_TEMP_DIR=C:\TempScans
BACKEND_BASE_URL=https://localhost
SCANNER_AGENT_KEY=mi_clave_super_secreta
TARGET_USER_ID=cm9j5abc123xyz
EXTRACTION_MODE=general
```

Operativas:

- `QUEUE_RETRY_BASE_MS` (default sugerido 15000)
- `QUEUE_FILE_PATH` (opcional)
- `SCANNER_AGENT_ID` (ej. `rrhh-pc-01`)
- `SCANNER_AGENT_VERSION` (ej. `1.0.0`)
- `HEARTBEAT_INTERVAL_MS` (ej. 60000)
- `FLUSH_INTERVAL_MS` (ej. 30000)
- `NAPS2_ARGUMENTS` (opcional con `{output}`)

### Ejemplo operativo recomendado

```env
QUEUE_RETRY_BASE_MS=15000
HEARTBEAT_INTERVAL_MS=60000
FLUSH_INTERVAL_MS=30000
SCANNER_AGENT_ID=rrhh-pc-01
SCANNER_AGENT_VERSION=1.0.0
```

### Validación rápida de `.env`

1. Verificar que el path de NAPS2 exista:

```powershell
Test-Path "C:\Program Files\NAPS2\NAPS2.Console.exe"
```

2. Verificar que el backend esté accesible:

```powershell
curl https://TU_BACKEND/api/health
```

3. Confirmar que `SCANNER_AGENT_KEY` del agent y backend sea exactamente el mismo valor.

---

## 6) Modos de ejecución

## A) Escaneo inmediato (manual)

```bash
npm run dev
```

o compilado:

```bash
npm run build
npm start
```

## B) Procesar cola pendiente

```bash
npm run dev:flush-queue
```

o compilado:

```bash
npm run flush-queue
```

## C) Servicio continuo (recomendado)

```bash
npm run dev:daemon
```

o compilado:

```bash
npm run daemon
```

Daemon:
- hace flush periódico de cola,
- envía heartbeat,
- permite operación más estable en oficina.

---

## 7) Seguridad mínima recomendada

- Nunca hardcodear `SCANNER_AGENT_KEY`.
- No versionar `.env` real.
- Limitar acceso de red del host agente al backend requerido.
- Rotar `SCANNER_AGENT_KEY` si hay sospecha de exposición.

### Cómo generar `SCANNER_AGENT_KEY` segura

PowerShell (Windows):

```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
($bytes | ForEach-Object { $_.ToString("x2") }) -join ""
```

Node:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Usá el mismo valor en:

- `backend/.env` → `SCANNER_AGENT_KEY=...`
- `scanner-agent/.env` → `SCANNER_AGENT_KEY=...`

Si no coinciden, el backend rechazará requests del agent con `401`.

---

## 8) Consejos prácticos de operación

- Usá `SCAN_TEMP_DIR` en disco local rápido (evitar red compartida para temporales).
- Programá `daemon` al inicio de sesión/equipo.
- Revisá cola si hay cortes de red prolongados.
- Si un escáner se vuelve inestable, validar primero scan manual en GUI antes de culpar al agent.

---

## 9) Troubleshooting

## Error de autenticación en backend

- Revisar `x-scanner-agent-key` (agent) vs `SCANNER_AGENT_KEY` (backend).

## Scan falla antes de subir

- Probar comando NAPS2 manual.
- Ajustar `NAPS2_ARGUMENTS`.
- Revisar driver TWAIN/WIA.

## Upload falla por SSL/HTTPS

- Verificar validez de certificado y hostname.
- Confirmar conectividad de la PC agente al backend.

## Cola no se vacía

- Ejecutar `flush-queue` manual para diagnóstico.
- Ver logs JSON de errores (`response status`, timeout, TLS, etc.).

---

## 10) Relación con docs raíz

- `../SCANNER.md` describe arquitectura, límites y flujo on-prem.
- `../README.md` tiene índice rápido y redirecciones.
