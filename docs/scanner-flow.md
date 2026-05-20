# Flujo de escaneo en DocScan

Estado: **eSCL (AirScan) sobre red + auto-descubrimiento mDNS + captura por cámara del navegador**.

DocScan no depende de agentes locales, NAPS2, ni binarios instalados. La comunicación con el escáner es HTTP/HTTPS directo desde el backend al dispositivo, vía el protocolo abierto eSCL (extensión de IPP, estandarizada por PWG y empujada por Mopria/Apple AirScan). En LAN puede descubrir escáneres automáticamente por mDNS — tanto en HTTP (`_uscan._tcp`) como en HTTPS (`_uscans._tcp`) — sin que el usuario configure IPs a mano.

---

## 1) Fuentes de imagen soportadas

| Fuente | Endpoint | Quién captura |
| --- | --- | --- |
| Cámara del navegador (WebRTC/WebUSB) | `POST /api/scanner/capture` | Frontend captura, envía base64 |
| Escáner de red con eSCL/AirScan | `POST /api/scanner/network-scan` | Backend habla HTTP con el escáner |

Ambas pasan por el mismo pipeline downstream: `StorageService` (Sharp → WebP → Bunny CDN) → `DocumentsService` (Prisma).

---

## 2) Gestión de escáneres (`ScannerConfig`)

Cada `ScannerConfig` tiene **dueño** (`ownership`) y **origen** (`discoveredVia`):

| `ownership` | `discoveredVia` | Quién lo creó | Quién lo ve | Quién lo borra |
| --- | --- | --- | --- | --- |
| `USER` | `MANUAL` | Usuario via `POST /configs` | Solo su dueño | Solo su dueño |
| `SYSTEM` | `MDNS` | El listener de discovery al ver un anuncio `_uscan._tcp` / `_uscans._tcp` | Cualquier usuario autenticado | Nadie desde la UI (soft offline solamente) |

La regla detrás es simple: si el escáner está físicamente en la LAN del backend, es un recurso compartido de la instancia. Modelarlo por usuario duplicaría el mismo equipo físico para cada cuenta.

### Endpoints

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/scanner/configs` | Lista escáneres visibles para el usuario (`userId=current OR ownership=SYSTEM`) |
| POST | `/api/scanner/configs` | Crea config manual (`name`, `ip`, `port`, `useTls`, `verifyTls`) → `ownership=USER`, `discoveredVia=MANUAL` |
| DELETE | `/api/scanner/configs/:id` | Solo borra USER del propio dueño. SYSTEM responde 403 con mensaje explícito |
| GET | `/api/scanner/configs/:id/ping` | Verifica reachability vía `/eSCL/ScannerStatus`. Actualiza `online` y `lastSeenAt`. SYSTEM pingeable por cualquier user autenticado |
| POST | `/api/scanner/discover` | Fuerza un sweep mDNS + ping de validación. Devuelve `{ scanners, discoveryActive }` |

---

## 3) Auto-descubrimiento mDNS (opt-in)

Habilitado con `SCANNER_DISCOVERY_ENABLED=true`. Por defecto está **apagado**: abre un listener UDP/5353 y dispara el prompt de firewall de Windows.

### Arquitectura

```
                ┌───────────────────────────────┐
                │ ScannerDiscoveryPort          │   (interfaz, sin lib)
                │  start / stop / refresh       │
                │  snapshot                     │
                └──────────────┬────────────────┘
                               │ implements
              ┌────────────────┴────────────────┐
              │                                 │
   BonjourDiscoveryAdapter              NoopDiscoveryAdapter
   (bonjour-service)                    (default cuando flag off)
   ├─ _uscan._tcp   (eSCL HTTP)
   └─ _uscans._tcp  (eSCL HTTPS)
              │
              │ EventEmitter2 ('scanner.discovered' | 'scanner.lost')
              ▼
   ScannerConfigSyncListener  ─→  Prisma upsert por uuid
```

El `ScannerService` no conoce mDNS. Habla con la interfaz `ScannerDiscoveryPort` por DI; cambiar de lib o sacar discovery solo toca el adapter.

### Dual transport (HTTP + HTTPS)

eSCL es HTTP-based pero el anuncio mDNS se divide en dos service types según el transporte que expone el dispositivo:

| Service type | Transporte | Cuándo aparece |
| --- | --- | --- |
| `_uscan._tcp` | HTTP eSCL | Firmware viejo, default en impresoras de consumo pre-2020 |
| `_uscans._tcp` | HTTPS eSCL | EPSON post-2020, HP/Brother modernos, equipos enterprise |

El adapter browsea los **dos en paralelo**. Cuando el mismo UUID aparece en ambos, **HTTPS gana** (HTTPS es el default del firmware moderno y los certificados autofirmados se cubren con el flag `verifyTls=false`).

Política de "perdido": si el dispositivo deja de anunciarse en un transporte pero sigue vivo en el otro, **no** se marca offline. Solo cuando ambos browsers dejan de verlo se emite `scanner.lost`. Esto evita flap cuando un firmware ratea anuncios.

### Matching de identidad

El anchor de identidad es el TXT record `UUID=` del anuncio (mismo UUID en `_uscan._tcp` y `_uscans._tcp` cuando el equipo expone los dos). **Nunca la IP**. La IP cambia (DHCP, mudarse de red); el UUID viaja con el firmware del equipo.

| Evento | Acción |
| --- | --- |
| Anuncio `up` con UUID nuevo | Insert `ScannerConfig { ownership: SYSTEM, discoveredVia: MDNS, online: true, useTls: según transporte }` |
| Anuncio `up` con UUID conocido | Update transporte completo (`ip`, `port`, `useTls`), `mdnsName`, `online=true`, `lastSeenAt`. **No** toca `name` ni `verifyTls` (no son derivables del anuncio) |
| Anuncio `up` HTTP cuando ya hay HTTPS para el mismo UUID | Refresca `observedAt` interno; no se emite evento (no se baja de HTTPS a HTTP) |
| Anuncio `down` en un solo transporte (el otro sigue vivo) | Sin cambios — partial lost interno, log debug |
| Anuncio `down` en los dos transportes | Soft offline: `online=false`. Nunca delete |
| Anuncio sin UUID | Descartado (log debug) |
| Anuncio con `rs != eSCL` | Descartado (otro tipo de servicio uscan no soportado) |

### Política de offline

Soft-only. Un escáner que desaparece de la red queda en DB con `online=false` y su último `lastSeenAt`. El borrado definitivo de SYSTEM por TTL queda **pendiente** hasta que exista un rol admin (hoy no hay; ver `User` en `schema.prisma`).

### Endpoint manual

`POST /api/scanner/discover` dispara:

1. `discovery.refresh()` → mDNS PTR query nueva, espera 1.5 s para anuncios.
2. Query DB de los SYSTEM/MDNS conocidos.
3. **Ping eSCL en paralelo** (`Promise.allSettled`) — mDNS solo dice "estoy en la red", no garantiza que HTTP responda (sleep, 503). Confirma reachability real.
4. Devuelve `{ scanners, discoveryActive: true }`.

Si `SCANNER_DISCOVERY_ENABLED=false`, el endpoint sigue respondiendo: devuelve los SYSTEM existentes con `discoveryActive: false`. Esto simplifica el frontend (un solo flujo, no dos).

---

## 4) Flujo eSCL (network-scan)

1. **Reachability**: `GET http(s)://{ip}:{port}/eSCL/ScannerStatus`.
2. **Crear job**: `POST .../eSCL/ScanJobs` con XML de `ScanSettings` (intent `Document`, RGB24, 300dpi, JPEG, tamaño carta). Retry 4 s en 503.
3. **Job location**: el escáner responde `Location: /eSCL/ScanJobs/{jobId}`.
4. **Polling**: `GET {jobLocation}/NextDocument` cada 1.5 s hasta obtener el binario (timeout 60 s — la primera página tras idle en algunos EPSON puede pasar 30 s por warmup).
5. **DELETE** del job (best-effort).
6. **Persistencia**: buffer → temporal en disco → `StorageService.uploadFile` (Sharp → WebP → Bunny) → `DocumentsService.createDocument`.

---

## 5) Requisitos del escáner

- Compatible con **eSCL** (extensión de IPP, Mopria Scan / Apple AirScan) sobre HTTP o HTTPS. Casi cualquier multifunción de red de los últimos 8 años lo expone.
- Para uso manual: IP estable accesible desde el host del backend.
- Para discovery: el equipo debe anunciarse por mDNS en alguno de los dos service types (`_uscan._tcp` HTTP o `_uscans._tcp` HTTPS, UDP 5353) en la misma LAN que el backend. Esto **no funciona** si:
  - El backend corre en WSL2 (NAT bloquea mDNS hacia la LAN del host).
  - El escáner está en una VLAN distinta del backend.
  - El WiFi tiene client isolation activado (común en redes de invitados).

En esos casos, el flujo manual (`POST /configs`) queda como salida.

---

## 6) Variables de entorno

```bash
# Master switch del feature scanner (true por default)
SCANNER_ENABLED=true

# Auto-descubrimiento mDNS (opt-in: abre UDP/5353)
SCANNER_DISCOVERY_ENABLED=false

# Fuerza el browser mDNS a bindear una NIC IPv4 específica (multi-NIC, VPN, Docker, WSL)
MDNS_INTERFACE=
```

---

## 7) Troubleshooting

| Síntoma | Causa probable | Acción |
| --- | --- | --- |
| `/configs/:id/ping` devuelve `online: false` | Escáner apagado, IP cambió, firewall | `curl -sk http(s)://{ip}/eSCL/ScannerStatus` |
| `network-scan` falla con "El escáner rechazó el trabajo" | Dispositivo sin eSCL o XML no soportado | Confirmar AirScan habilitado en panel del escáner |
| Timeout en `network-scan` | ADF vacío, vidrio sin papel, equipo en warmup | Reintentar; revisar bandeja |
| `discover` devuelve `discoveryActive: false` con flag prendido | mDNS no arrancó (firewall, socket ocupado, NIC inválida) | Revisar log: `Could not start mDNS discovery, running degraded: ...` |
| `discover` devuelve `scanners: []` con flag prendido y escáner vivo | Multi-NIC tomó la interfaz equivocada, o VLAN/WSL bloquea mDNS | Definir `MDNS_INTERFACE=192.168.x.x` con la IP del adaptador correcto |
| Escáner recién encontrado aparece `online: false` | mDNS lo vio pero eSCL HTTP no responde (sleep, 503) | Esperar warmup; volver a llamar `/discover` |

---

## 8) Pendientes conocidos

- **TTL purge para SYSTEM/MDNS** desconectados hace > N días — requiere rol admin en `User`, que no existe todavía.
- **Tipado fuerte de `ScanSettings`** (ColorMode, Intent, Resolution como union types).
- **Parsing real del XML de capabilities** (hoy hace string match).
- **DTO acepta solo IP, no hostnames** — `NetworkScanDto` usa `@IsIP()`. Para `.local` o hostnames con DNS interno hace falta reemplazar el validador.
