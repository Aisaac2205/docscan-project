# SCANNER.md — Guía sólida de escáner físico (On-Prem) para DocScan

> Estado: **DEMO funcional para entornos locales (on-premise)**.
>
> **No hay soporte de escaneo físico directo desde navegador web público**.  
> Este flujo está diseñado para oficinas/empresas con escáner físico conectado localmente a una PC Windows.

---

## 1) Qué resuelve esta integración

Permite que una empresa escanee documentos físicos con ADF y que DocScan procese OCR automáticamente:

1. Escáner físico (Epson/Ricoh) → NAPS2 CLI.
2. NAPS2 genera PDF temporal local.
3. Scanner Agent sube el PDF al backend (`/api/ocr/scan`).
4. Backend crea el `Document` y ejecuta OCR.
5. Si hay caída de red/backend, el PDF queda en cola local y se reintenta.

---

## 2) Alcance y limitaciones (importante)

### Incluido en esta demo

- Flujo local Windows 10/11 Pro.
- Escaneo con NAPS2 Console.
- Subida segura por `x-scanner-agent-key`.
- OCR automático tras la subida.
- Cola local persistente para no perder documentos.
- Idempotencia por `x-job-id` para evitar duplicados.

### No incluido / fuera de alcance actual

- Soporte de escaneo físico 100% web/browser-only.
- Gestión centralizada multi-sucursal de agentes.
- Observabilidad enterprise completa (dashboard de agentes, alerting avanzado).

---

## 3) Requisitos técnicos

## Hardware soportado (objetivo)

- Epson WorkForce ES-865 (ADF)
- Ricoh ScanSnap iX2500 (ADF)

## Sistema operativo

- Windows 10/11 Pro

## Software

- NAPS2 instalado (GUI + Console)
- Node.js 20+
- Backend DocScan activo por HTTPS

## Red

- Salida HTTPS habilitada (443)
- Sin proxy (o proxy configurado explícitamente en entorno corporativo)

---

## 4) Instalación de NAPS2 (paso a paso)

1. Descargar NAPS2 desde el sitio oficial.
2. Instalar con ruta por defecto.
3. Confirmar existencia del ejecutable CLI:

```powershell
Test-Path "C:\Program Files\NAPS2\NAPS2.Console.exe"
```

Debe devolver `True`.

4. Abrir NAPS2 GUI y crear un perfil de escaneo (recomendado):
   - Source: ADF / Duplex
   - DPI: 300
   - Size: A4 (o Letter)
   - Color

5. Probar CLI manual:

```powershell
"C:\Program Files\NAPS2\NAPS2.Console.exe" -o "C:\TempScans\smoke_test.pdf" -a -f
```

Si falla `-a`, usar fallback sin perfil:

```powershell
"C:\Program Files\NAPS2\NAPS2.Console.exe" -o "C:\TempScans\smoke_test.pdf" --noprofile --driver twain --source duplex --dpi 300 --pagesize a4 --bitdepth color -f
```

---

## 5) Backend DocScan — contrato de integración

## Endpoints machine-to-machine

- `POST /api/ocr/scan`
  - Header obligatorio: `x-scanner-agent-key`
  - Header opcional: `x-job-id` (idempotencia)
  - `multipart/form-data`:
    - `file` (PDF)
    - `userId`
    - `extractionMode`
    - `customFields` (opcional, JSON)

- `POST /api/ocr/scan/error`
  - Reporte de fallo definitivo del agente.

- `POST /api/ocr/scan/heartbeat`
  - Señal periódica de salud del agente.

## Seguridad

- Clave compartida: `SCANNER_AGENT_KEY` (backend + agent).
- Nunca commitear `.env` real.
- Rotar secret en despliegues corporativos.

---

## 6) Flujo operativo recomendado

1. Operador carga papel en ADF.
2. Agent ejecuta scan (`mode=scan`).
3. Si upload/OCR OK:
   - backend responde `documentId`
   - PDF temporal se borra localmente.
4. Si upload falla:
   - PDF se guarda en cola persistente local.
5. `mode=flush-queue` o `mode=daemon` sube pendientes automáticamente.

---

## 7) Modo DEMO vs Producción

## Demo (actual)

- Un agente local por estación.
- Cola JSON local.
- Logging estructurado en stdout.

## Producción sugerida (futuro)

- Servicio Windows administrado (NSSM/Task Scheduler/SCM).
- Persistencia de heartbeat/estado en DB.
- Panel de observabilidad de agentes.
- Alertas por cola acumulada o heartbeat ausente.

---

## 8) Troubleshooting rápido

## NAPS2 no encuentra el escáner

- Verificar drivers TWAIN/WIA del fabricante.
- Probar desde GUI de NAPS2 primero.
- Confirmar que otra app no esté bloqueando el dispositivo.

## PDF no se sube

- Revisar `BACKEND_BASE_URL`.
- Revisar `SCANNER_AGENT_KEY` en ambos lados.
- Validar certificado TLS si usan HTTPS interno.

## Archivos quedan en cola

- Esperado cuando backend/red no está disponible.
- Ejecutar `flush-queue` manual o usar modo `daemon`.

---

## 9) Checklist de aceptación

- [ ] Se escanea con Epson ES-865 o Ricoh iX2500.
- [ ] Se genera PDF local.
- [ ] Se sube a `/api/ocr/scan` con header de agente.
- [ ] OCR devuelve resultado y se crea documento.
- [ ] Si backend cae, PDF entra a cola y luego se sube.
- [ ] No hay duplicados en reintentos (`x-job-id`).

---

## 10) Documentación relacionada

- `scanner-agent/README.md` → instalación y operación del agente.
- `README.md` (raíz) → visión general del proyecto y enlaces rápidos.

---

## 11) Cómo configurar variables de entorno (ENV) sin errores

## Backend (`backend/.env`)

1. Crear archivo desde el ejemplo:

```bash
cp backend/.env.example backend/.env
```

2. Completar valores críticos:

- `DATABASE_URL`
- `JWT_SECRET`
- `BUNNY_STORAGE_ZONE`
- `BUNNY_STORAGE_ACCESS_KEY`
- `BUNNY_STORAGE_HOST`
- `BUNNY_CDN_BASE_URL`
- `SCANNER_AGENT_KEY` ← clave compartida con el agent

3. Reiniciar backend después de editar `.env`.

## Scanner Agent (`scanner-agent/.env`)

1. Crear archivo desde plantilla:

```bash
cd scanner-agent
copy .env.example .env
```

2. Set obligatorio:

- `NAPS2_PATH` (ruta real de `NAPS2.Console.exe`)
- `SCAN_TEMP_DIR` (ej. `C:\TempScans`)
- `BACKEND_BASE_URL` (ej. `https://mi-backend.local`)
- `SCANNER_AGENT_KEY` (debe ser exactamente igual al backend)
- `TARGET_USER_ID` (usuario destino en DocScan)
- `EXTRACTION_MODE`

3. Set operativo recomendado:

- `QUEUE_RETRY_BASE_MS=15000`
- `HEARTBEAT_INTERVAL_MS=60000`
- `FLUSH_INTERVAL_MS=30000`
- `SCANNER_AGENT_ID=rrhh-pc-01`
- `SCANNER_AGENT_VERSION=1.0.0`

## Reglas de oro de ENV

- No usar comillas innecesarias si no hace falta.
- No dejar espacios al final (`KEY=value`).
- No versionar archivos `.env` reales.
- Si cambiás variables, reiniciá proceso/backend-agent.

---

## 12) `SCANNER_AGENT_KEY`: qué es, para qué sirve y cómo generarla de forma segura

## ¿Qué es?

`SCANNER_AGENT_KEY` es un **secreto compartido** entre:

- Backend DocScan (`backend/.env`)
- Scanner Agent (`scanner-agent/.env`)

El agent lo envía en cada request HTTP en el header:

- `x-scanner-agent-key: <secret>`

El backend valida ese valor antes de aceptar:

- subida de PDFs (`/api/ocr/scan`)
- reportes de error (`/api/ocr/scan/error`)
- heartbeats (`/api/ocr/scan/heartbeat`)

Si no coincide, la request se rechaza con `401`.

## ¿Para qué sirve?

Sirve como autenticación **machine-to-machine** del agente local.

Sin esta clave, cualquier cliente que conozca tu endpoint podría intentar enviar archivos.

## ¿Qué tan segura debe ser?

Debe ser una clave:

- larga (mínimo 32 bytes reales)
- aleatoria (no inventada a mano)
- única por ambiente (dev/staging/prod)

Recomendado:

- 64 caracteres hex (32 bytes)
- o 48+ caracteres base64 URL-safe

## Cómo generar una key segura

### Opción A — PowerShell (Windows, recomendado)

Generar 32 bytes aleatorios en hex:

```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
($bytes | ForEach-Object { $_.ToString("x2") }) -join ""
```

### Opción B — Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Opción C — OpenSSL

```bash
openssl rand -hex 32
```

## Dónde colocarla

Usar el **mismo valor** en ambos:

- `backend/.env`
  - `SCANNER_AGENT_KEY=<valor_generado>`
- `scanner-agent/.env`
  - `SCANNER_AGENT_KEY=<valor_generado>`

## Buenas prácticas de seguridad (importante)

1. No commitear jamás `.env` real al repo.
2. No compartir la key por chats públicos/capturas.
3. Rotar la key periódicamente (ej. cada 90 días).
4. Rotar inmediatamente si sospechás filtración.
5. Usar una key distinta por cada entorno.
6. Preferir HTTPS siempre (evitar HTTP plano).
7. En equipos compartidos, restringir lectura de `.env` al usuario del servicio.

## Procedimiento de rotación (sin downtime largo)

1. Generar nueva key.
2. Actualizar `backend/.env`.
3. Reiniciar backend.
4. Actualizar `scanner-agent/.env` en cada estación.
5. Reiniciar agent.
6. Verificar heartbeat y scan.

> Si backend ya cambió de key y agent no, verás 401 hasta alinear ambos.
