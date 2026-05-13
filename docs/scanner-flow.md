# Flujo de escaneo en DocScan

Estado: **eSCL (AirScan) sobre red + captura por cámara del navegador**.

DocScan no depende de agentes locales, NAPS2, ni ningún binario instalado en una PC. La comunicación con el escáner es HTTP directo desde el backend al dispositivo, usando el protocolo abierto eSCL (PWG/Mopria).

---

## 1) Fuentes de imagen soportadas

| Fuente | Endpoint | Quién captura |
| --- | --- | --- |
| Cámara del navegador (WebRTC/WebUSB) | `POST /api/scanner/capture` | Frontend captura, envía base64 |
| Escáner de red con eSCL/AirScan | `POST /api/scanner/network-scan` | Backend habla HTTP con el escáner |

Ambas pasan por el mismo pipeline downstream: `StorageService` (Sharp → WebP → Bunny CDN) → `DocumentsService` (Prisma).

---

## 2) Gestión de escáneres (`ScannerConfig`)

Cada usuario puede registrar uno o más escáneres por IP en la base.

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/scanner/configs` | Lista escáneres del usuario |
| POST | `/api/scanner/configs` | Crea config (`name`, `ip`, `port`) |
| DELETE | `/api/scanner/configs/:id` | Elimina config |
| GET | `/api/scanner/configs/:id/ping` | Verifica `online` vía `/eSCL/ScannerStatus` |

---

## 3) Flujo eSCL (network-scan)

1. **Reachability check**: `GET http://{ip}:{port}/eSCL/ScannerStatus`.
2. **Crear job**: `POST http://{ip}:{port}/eSCL/ScanJobs` con XML de `ScanSettings` (intent `Document`, RGB24, 300dpi, JPEG, tamaño carta).
3. **Job location**: el escáner responde `Location: /eSCL/ScanJobs/{jobId}`.
4. **Polling**: `GET {jobLocation}/NextDocument` cada 2s hasta obtener el binario (timeout 30s).
5. **Persistencia**: el buffer se guarda temporal → `StorageService.uploadFile` (Sharp/WebP/Bunny) → `DocumentsService.createDocument`.

---

## 4) Requisitos del escáner

- Compatible con el estándar **eSCL** (Mopria Scan / Apple AirScan). Casi todos los escáneres y multifunción de red modernos lo soportan; el fabricante o modelo es indiferente mientras exponga la API HTTP de eSCL.
- IP estable accesible desde el host del backend.
- Puerto HTTP del servicio eSCL (típicamente `80` o `8080`).

---

## 5) Variables de entorno

El escáner se administra vía `ScannerConfig` en BD, no por variables de entorno. No hay `NAPS2_*`, `SCANNER_AGENT_KEY` ni similares.

---

## 6) Troubleshooting

| Síntoma | Causa probable | Acción |
| --- | --- | --- |
| `ping` devuelve `online: false` | Escáner apagado o IP inválida | Verificar conectividad con `curl http://{ip}/eSCL/ScannerStatus` |
| `network-scan` falla con "El escáner rechazó el trabajo" | Dispositivo sin eSCL o XML no soportado | Confirmar que AirScan esté habilitado en la config del escáner |
| Timeout en `network-scan` | ADF vacío o job lento | Reintentar; revisar bandeja |

---

## 7) Fase 2 (pendiente)

- Descubrimiento mDNS / Bonjour (`_uscan._tcp`) para evitar registrar IPs a mano.
- Tipado fuerte de `ScanSettings` (ColorMode, Intent, Resolution como union types).
- Retry con backoff exponencial específico para `503` en `NextDocument`.
- Parsing real del XML de capabilities (no string match).
