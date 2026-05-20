# Configuración del escáner en Windows 11

Guía práctica para dejar lista una impresora o multifuncional con escáner integrado para que DocScan pueda usarla por eSCL (AirScan / Mopria). Aplica a Windows 11; el procedimiento de red es el mismo en otros SOs.

Hay **dos caminos** según la red:

- **Camino A — Auto-descubrimiento mDNS** (`SCANNER_DISCOVERY_ENABLED=true`). El backend encuentra el escáner solo. No editás IPs ni te enterás de direcciones. Recomendado para uso real.
- **Camino B — Manual desde la UI** (`POST /api/scanner/configs` o el modal de `/scan`). Cargás IP a mano. Usalo cuando mDNS no llega (WSL2, VLANs distintas, redes corporativas con multicast bloqueado).

Los dos caminos coexisten: nada impide tener el flag prendido y además un escáner manual cargado.

---

## 0) Aclaración importante sobre Bluetooth

DocScan **no usa Bluetooth para escanear**, aunque la impresora aparezca pareada por BT en `Configuración → Bluetooth y dispositivos → Impresoras y escáneres`. Bluetooth usa protocolos distintos (SPP/HCRP/OPP) que no son HTTP; eSCL es HTTP/XML sobre la LAN.

Necesitamos sí o sí:

- Impresora conectada a la **misma red WiFi o Ethernet** que la PC donde corre el backend.
- **AirPrint o Mopria habilitado** (la mayoría de las impresoras de los últimos 8 años lo trae activo de fábrica).

Si la impresora solo está pareada por BT y no en WiFi/Ethernet, no va a funcionar. Conectala primero a la red.

---

## 1) Conectar la impresora a la red

### Opción A — Desde el panel táctil de la impresora

1. Panel → `Configuración` / `Setup`.
2. `Red` o `Network Settings`.
3. `Conexión inalámbrica` → `Asistente de configuración WiFi`.
4. Seleccioná tu SSID, ingresá la clave.
5. Esperá el OK. Imprimí una **hoja de estado de red** (`Estado de red` → `Imprimir hoja de estado`). Te muestra IP, máscara, gateway, SSID y MAC.

Es el camino más confiable. Si tu impresora tiene panel táctil, usalo.

### Opción B — Desde Windows 11 (agregar dispositivo)

`Configuración` → `Bluetooth y dispositivos` → `Impresoras y escáneres` → `Agregar dispositivo`. Windows hace su propio descubrimiento mDNS/SSDP y la lista si ya está conectada por Ethernet o WiFi.

Importante: agregar la impresora en Windows **no la conecta a la red**. Solo registra una impresora ya conectada. Si no aparece, hacé la Opción A primero.

### Opción C — Por cable Ethernet

Conectar al router por cable. Recibe IP por DHCP automático. Imprimí una hoja de estado para ver la IP.

---

## 2) Camino A — Auto-descubrimiento mDNS (recomendado)

### Habilitar en el backend

Editá `backend/.env`:

```bash
SCANNER_DISCOVERY_ENABLED=true
# MDNS_INTERFACE= dejar vacío en la mayoría de los casos
```

Reiniciá el backend. En el log deberías ver:

```
[ScannerDiscovery] Using BonjourDiscoveryAdapter (SCANNER_DISCOVERY_ENABLED=true)
[BonjourDiscoveryAdapter] Scanner discovery listening on _uscan._tcp + _uscans._tcp
```

El adapter browsea **los dos service types en paralelo**: `_uscan._tcp` (eSCL sobre HTTP) y `_uscans._tcp` (eSCL sobre HTTPS). eSCL es una extensión de IPP que puede correr sobre HTTP o HTTPS según la configuración de seguridad del equipo: el firmware viejo (pre-2020) suele anunciar solo HTTP, mientras que las impresoras modernas (EPSON post-2020, HP/Brother nuevas, equipos enterprise) anuncian solo HTTPS o ambos. Si la misma impresora se anuncia en los dos, **HTTPS gana** y la fila queda con `useTls=true`.

### Aceptar el prompt del firewall de Windows

La primera vez que el backend abre el socket UDP/5353, Windows Defender pregunta si permitís a `node.exe` recibir tráfico de redes privadas y/o públicas. **Marcá "Redes privadas"** y aceptá. Si lo rechazaste sin querer:

```powershell
# Verificar regla actual
Get-NetFirewallRule -DisplayName "*node*" | Format-Table DisplayName, Direction, Action, Profile

# Crear una regla explícita (ajustá la ruta al node.exe que corre tu backend)
New-NetFirewallRule -DisplayName "DocScan mDNS" `
  -Direction Inbound -Protocol UDP -LocalPort 5353 `
  -Program "C:\Program Files\nodejs\node.exe" `
  -Action Allow -Profile Private
```

### Disparar el descubrimiento

Cuando se prende un escáner eSCL en la LAN, su anuncio mDNS llega y el backend loguea (el ejemplo de abajo es para una impresora que solo expone HTTPS):

```
[BonjourDiscoveryAdapter] Discovered scanner: EPSON L4360 Series @ https://192.168.1.100:443 uuid=4509a320-...
[ScannerConfigSyncListener] Registered discovered scanner: id=cmp... uuid=4509a320-... 192.168.1.100:443
```

Para una impresora que solo expone HTTP cambia el esquema:

```
[BonjourDiscoveryAdapter] Discovered scanner: HP OfficeJet @ http://192.168.1.50:80 uuid=...
```

Si la impresora anuncia los dos transportes, vas a ver el log de HTTPS y, después, una línea `debug` de `HTTP announcement refresh (HTTPS preferred)` por cada renovación del anuncio HTTP.

También podés forzar un sweep en cualquier momento desde el frontend o con curl:

```powershell
$token = "<JWT del usuario>"
curl.exe -X POST http://localhost:3001/api/scanner/discover `
  -H "Authorization: Bearer $token"
```

Devuelve la lista de SYSTEM/MDNS conocidos con `online` actualizado por ping eSCL real.

### Si discovery no encuentra nada

| Causa | Cómo verificar | Solución |
| --- | --- | --- |
| Firewall bloqueando UDP 5353 | `Get-NetFirewallRule -DisplayName "*mdns*"` | Regla del paso anterior |
| Backend corre dentro de WSL2 | `wsl` antes del prompt | Correr el backend en Windows nativo, no en WSL (NAT de WSL bloquea mDNS) |
| Multi-NIC (VPN activa, Docker bridge) | `Get-NetIPAddress -AddressFamily IPv4` muestra varias | Definir `MDNS_INTERFACE=192.168.x.x` con la IP del adaptador correcto |
| Bonjour Service de Apple ocupando 5353 | `Get-Service "Bonjour Service"` | El adapter usa `SO_REUSEADDR`; si pelea igual, parar el servicio: `Stop-Service "Bonjour Service"` |
| Red WiFi de invitados con client isolation | El router no propaga multicast entre clientes | Usar la red WiFi principal o cable Ethernet |
| Escáner anunciando sin TXT `UUID` (firmware muy viejo) | `dns-sd -B _uscan._tcp` lo lista pero sin UUID | Usar Camino B (manual) |
| Impresora moderna que solo expone HTTPS y aparecía como no descubierta antes | Ver log `Discovered scanner @ https://...` o `dns-sd -B _uscans._tcp` | Resuelto: el adapter browsea `_uscan._tcp` y `_uscans._tcp` en paralelo |

---

## 3) Camino B — Configuración manual desde la UI

Cuando mDNS no llega (corporate, VLAN distinta, WSL), cargás la IP a mano vía `POST /api/scanner/configs` o el modal "Agregar escáner" en `/scan`. El config queda `ownership=USER` (solo lo ve quien lo creó).

### 3.1 Obtener la IP del escáner

Cuatro métodos, ordenados de más fiable a menos fiable.

**Método 1 — Hoja de estado de red** impresa por el propio dispositivo. Desde el panel: `Configuración` → `Red` → `Imprimir hoja de estado`. Anotá la **Dirección IP**.

**Método 2 — Panel táctil**. `Configuración` → `Red` → `Estado` → leer la IP en pantalla.

**Método 3 — PowerShell**.

```powershell
Get-Printer | Where-Object { $_.PortName -like "WSD-*" -or $_.PortName -like "IP_*" } |
  Select-Object Name, PortName
```

Si el puerto se llama `IP_192.168.1.100`, ahí está. Si dice `WSD-...`, no te la da directo; usá el método 4.

**Método 4 — `arp -a`**. Lista todos los dispositivos vistos en la LAN con IP y MAC. Buscás la MAC de la impresora (impresa en una etiqueta debajo del equipo o en la hoja de estado).

### 3.2 Verificar que habla eSCL

```powershell
# HTTPS primero (impresoras modernas redirigen acá)
curl.exe -sk https://192.168.1.100/eSCL/ScannerCapabilities -o $null -w "HTTPS %{http_code}`n"

# Fallback HTTP
curl.exe -s http://192.168.1.100/eSCL/ScannerCapabilities -o $null -w "HTTP %{http_code}`n"
```

| Respuesta | Significado | Acción |
| --- | --- | --- |
| `HTTPS 200` | eSCL con TLS | `useTls=true`, puerto `443` |
| `HTTP 200` | eSCL sin TLS | `useTls=false`, puerto `80` |
| `HTTP 307` + `HTTPS 200` | Redirige HTTP a HTTPS (típico EPSON L4360) | Usar HTTPS, certificado autofirmado |
| `404` en ambos | eSCL apagado | Activar AirPrint / Mopria en el panel |
| Timeout | No está en la red, IP mal, firewall | `Test-NetConnection 192.168.1.100 -Port 80` |

### 3.3 Crear el config

Desde la UI: `/scan` → "Agregar escáner" → completar nombre, IP, puerto (`443` HTTPS / `80` HTTP), `useTls`, `verifyTls` (`false` para cert autofirmado).

O por API:

```powershell
$token = "<JWT del usuario>"
curl.exe -X POST http://localhost:3001/api/scanner/configs `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{"name":"EPSON L4360","ip":"192.168.1.100","port":443,"useTls":true,"verifyTls":false}'
```

| Campo | Valor |
| --- | --- |
| `name` | Texto identificable en la UI |
| `ip` | IP confirmada en 3.1 + 3.2 |
| `port` | `443` (HTTPS) o `80` (HTTP). Si lo omitís, default según `useTls` |
| `useTls` | `true` si pasó el test HTTPS, `false` si HTTP |
| `verifyTls` | `false` para certificado autofirmado (típico consumo). `true` si hay cert de CA real |

El escáner aparece en la lista con punto verde si está online (ping automático).

---

## 4) Cambiar de red (mudarte entre lugares)

### Con discovery activo (Camino A)

Nada para hacer en el backend. Conectá la impresora a la nueva red WiFi (paso 1), prendela, esperá que anuncie. El listener actualiza la IP en DB matcheando por UUID — el `ScannerConfig` es el mismo, solo cambian las piezas del transporte (`ip`, `port`, `useTls`). Si la impresora también cambió de HTTP a HTTPS al cambiar de firmware o de red (las redes corporativas muchas veces fuerzan HTTPS), el listener actualiza los tres juntos como un set coherente.

### Con configuración manual (Camino B)

1. Conectar la impresora a la nueva red.
2. Obtener la IP nueva (sección 3.1).
3. Borrar el config viejo (`DELETE /api/scanner/configs/:id`) y crear uno nuevo con la IP actualizada (sección 3.3), o editarlo desde el modal de `/scan`.

Tip: en routers domésticos, reservá la IP por MAC para que siempre tome la misma. Eso elimina rehacer el config al volver a la misma red.

---

## 5) Cambiar de impresora (otra marca / otro modelo)

### Con discovery activo

Nada. Apagás el viejo, prendés el nuevo, el listener lo registra como una nueva fila SYSTEM/MDNS. La vieja queda con `online=false` y `lastSeenAt` viejo. Hoy no se purga automático (queda pendiente hasta que haya rol admin); si te molesta visualmente, no aparece online en el modal de `/scan` con badge verde.

### Con configuración manual

1. Verificar que la nueva soporta eSCL (sección 3.2 con la IP nueva).
2. Crear un config nuevo (sección 3.3) con los datos de la impresora nueva.
3. Borrar el config viejo desde la UI o `DELETE /api/scanner/configs/:id`.

---

## 6) Permisos y ownership: qué pasa en multi-usuario

DocScan trata los escáneres descubiertos por mDNS (`discoveredVia=MDNS`) como **recurso del sistema** (`ownership=SYSTEM`): cualquier usuario autenticado de la instancia los ve y los puede usar. Razón: mDNS solo encuentra dispositivos en la LAN del backend → es una instalación on-prem por organización.

Los escáneres cargados manualmente desde el modal de `/scan` o `POST /configs` son `ownership=USER`: solo los ve su dueño.

| Acción | USER | SYSTEM |
| --- | --- | --- |
| Listar en `/configs` | Solo su dueño | Todos |
| Ping (`/configs/:id/ping`) | Solo su dueño | Todos |
| Usar para escanear (`/network-scan` por IP) | N/A (el endpoint toma IP directa del DTO, no del config) | N/A |
| Borrar (`DELETE /configs/:id`) | Solo su dueño | **Nadie desde la UI** (403 con mensaje) |

El purge de SYSCONFIG SYSTEM viejos por TTL queda **pendiente** — necesita rol admin en `User`, que no existe.

---

## 7) Diagnóstico rápido

| Síntoma | Diagnóstico | Solución |
| --- | --- | --- |
| `ping 192.168.X.Y` falla | Impresora no está en la red o IP equivocada | Volver a sección 1-3.1 |
| Ping de red OK, curl a eSCL da timeout | Firewall de Windows / eSCL apagado | Permitir puerto, reiniciar impresora |
| curl HTTP da 307 | Redirige a HTTPS | Usar HTTPS en `.env` |
| curl HTTPS da error de certificado | Cert autofirmado | `verifyTls=false` al crear el config |
| Backend dice `online: false` pero curl manual da 200 | Falta flag TLS correcto | Reverificar `useTls` en el config |
| Scan da `Poll timeout` después de 60s | Sin papel, tapa abierta, equipo en standby | Revisar físicamente, reintentar |
| Scan da `HTTP 503` y retry no salva | Job viejo bloqueando | `curl -sk https://IP/eSCL/ScannerStatus`, reiniciar impresora si hay muchos `Aborted` |
| Discovery prendido pero `discover` devuelve `discoveryActive: false` | Adapter degradado al arranque | Revisar log de `BonjourDiscoveryAdapter` (firewall, multi-NIC) |
| Discovery prendido, escáner vivo, `scanners: []` | mDNS no llega | Sección 2: firewall, WSL, multi-NIC, client isolation |

---

## 8) Comandos útiles

```powershell
# Impresoras Windows con puertos
Get-Printer | Select-Object Name, PortName, DriverName

# Dispositivos en la LAN
arp -a

# Estado eSCL directo (HTTPS o HTTP según expone el equipo)
curl.exe -sk https://192.168.1.100/eSCL/ScannerStatus
curl.exe -s  http://192.168.1.100/eSCL/ScannerStatus

# Capabilities (modos, resoluciones, formatos)
curl.exe -sk https://192.168.1.100/eSCL/ScannerCapabilities

# Listar anuncios mDNS de ambos transportes (requiere Bonjour de Apple o dns-sd)
dns-sd -B _uscan._tcp     # HTTP eSCL
dns-sd -B _uscans._tcp    # HTTPS eSCL

# Forzar discovery desde la API (requiere JWT)
$token = "..."
curl.exe -X POST http://localhost:3001/api/scanner/discover `
  -H "Authorization: Bearer $token"

# Ping de un config concreto
curl.exe http://localhost:3001/api/scanner/configs/<CONFIG_ID>/ping `
  -H "Authorization: Bearer $token"

# Estado del firewall sobre node
Get-NetFirewallRule -DisplayName "*node*" | Format-Table DisplayName, Direction, Action, Profile

# Bonjour Service de Apple (si está instalado y pelea por 5353)
Get-Service "Bonjour Service"
```
