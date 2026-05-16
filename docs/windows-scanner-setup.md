# Configuración del escáner físico en Windows 11

Esta guía cubre cómo dejar lista una impresora o multifuncional con escáner integrado para que DocScan pueda usarla a través del protocolo eSCL (AirScan / Mopria). Aplica a Windows 11, pero el procedimiento de red es el mismo en otros SOs.

---

## 0) Aclaración importante sobre Bluetooth

DocScan **no usa Bluetooth para escanear**, aunque la impresora aparezca pareada por BT en `Configuración → Bluetooth y dispositivos → Impresoras y escáneres`. Bluetooth usa protocolos distintos (SPP/HCRP/OPP) que no son HTTP, mientras que eSCL es HTTP/XML sobre la red local.

Lo que sí necesitamos:

- La impresora debe estar conectada a la **misma red WiFi o Ethernet** que la PC donde corre el backend.
- Debe tener **AirPrint o Mopria habilitado** (la mayoría de las impresoras de los últimos 8 años lo trae activo de fábrica).
- Necesitamos su **dirección IP local** (algo tipo `192.168.X.Y`), no la MAC ni el nombre BT.

Si la impresora **solo** está pareada por BT y no está en la red WiFi, no va a funcionar con DocScan. Hay que conectarla a la red WiFi primero.

---

## 1) Conectar la impresora a la red

Hay tres caminos posibles según cómo viene tu equipo:

### Opción A — Desde el panel táctil de la impresora

1. Panel → `Configuración` o `Setup`.
2. `Red` o `Network Settings`.
3. `Conexión inalámbrica` → `Asistente de configuración WiFi`.
4. Seleccioná tu SSID, ingresá la clave.
5. Esperá el OK. Imprimí una **hoja de estado de red** desde el mismo menú (`Estado de red` → `Imprimir hoja de estado`). Esa hoja te muestra la IP, máscara, gateway, SSID y MAC.

Este es el camino más confiable. Si tu impresora tiene panel táctil, usá este.

### Opción B — Desde Windows 11 (agregar dispositivo)

1. `Configuración` → `Bluetooth y dispositivos` → `Impresoras y escáneres`.
2. Click en `Agregar dispositivo`.
3. Windows descubre vía mDNS/SSDP en la red actual. La impresora aparece si ya está conectada por Ethernet o por WiFi (incluso si lo único que activaste fue Bluetooth, este paso no la va a traer).
4. Si aparece, agregala. Windows va a instalar drivers básicos.

Importante: agregar la impresora en Windows **no la conecta a la red por vos**. Solo registra una impresora ya conectada. Si no aparece, hacé la Opción A primero.

### Opción C — Por cable Ethernet

Si el equipo permite, conectalo directamente al router por cable. El router le asigna IP por DHCP automático. Imprimí una hoja de estado de red para verla.

---

## 2) Obtener la IP del escáner

Cuatro métodos, ordenados de más fiable a menos fiable.

### Método 1 — Hoja de estado de red impresa por el propio dispositivo

Desde el panel: `Configuración` → `Red` → `Imprimir hoja de estado` (el nombre exacto varía: EPSON la llama "Hoja de estado de red", HP "Network configuration page", Brother "Configuración de red").

La hoja muestra:

```
Dirección IP        192.168.1.100
Máscara de subred   255.255.255.0
Puerta de enlace    192.168.1.254
SSID                <tu_red>
Dirección MAC       XX:XX:XX:XX:XX:XX
```

Anotá la **Dirección IP**. Es la que va al `.env`.

### Método 2 — Panel táctil del dispositivo

`Configuración` → `Red` → `Estado` o `Información` → leer la IP en pantalla. Sin imprimir nada.

### Método 3 — Desde Windows con PowerShell

Abrí PowerShell y ejecutá:

```powershell
Get-Printer | Where-Object PortName -like "WSD-*" -or PortName -like "IP_*" | Select-Object Name, PortName
```

Te lista las impresoras con sus puertos. Si el puerto se llama `IP_192.168.1.100`, ahí está la IP. Si dice `WSD-...` no te dice la IP directo; en ese caso usá el método 4.

### Método 4 — Escaneo de red con `arp`

```powershell
arp -a
```

Lista todos los dispositivos vistos por tu PC en la red local con IP y MAC. Buscás la línea cuya MAC coincida con la de la impresora (la MAC está en la hoja de estado o en una etiqueta debajo del equipo). El primer octeto de la MAC suele identificar al fabricante (por ejemplo `68:55:D4` es EPSON).

---

## 3) Verificar que la impresora habla eSCL

Antes de tocar el `.env`, confirmá que el dispositivo expone el endpoint eSCL. Desde PowerShell:

```powershell
# Probá primero HTTPS (impresoras modernas)
curl.exe -sk https://192.168.1.100/eSCL/ScannerCapabilities -o $null -w "HTTP %{http_code}`n"

# Si lo anterior falla con error de conexión, probá HTTP plano
curl.exe -s http://192.168.1.100/eSCL/ScannerCapabilities -o $null -w "HTTP %{http_code}`n"
```

Resultados posibles:

| Respuesta | Significado | Acción |
| --- | --- | --- |
| `HTTP 200` por HTTPS | eSCL OK con TLS | `ESCL_DEFAULT_SCANNER_USE_TLS=true`, puerto 443 |
| `HTTP 200` por HTTP | eSCL OK sin TLS | `ESCL_DEFAULT_SCANNER_USE_TLS=false`, puerto 80 |
| `HTTP 307` por HTTP, `HTTP 200` por HTTPS | El dispositivo redirige HTTP a HTTPS (caso EPSON L4360) | Usar HTTPS, certificado autofirmado |
| `HTTP 404` en ambos | eSCL no está activo o la impresora no lo soporta | Revisar panel → `Configuración` → `Servicios` → activar AirPrint / Mopria |
| Timeout / no conecta | No está en la red, IP equivocada, o firewall | Repetir `ping 192.168.1.100` y verificar |

Para ver el detalle de capabilities (formatos, resoluciones, modos de color), corré sin `-o $null`:

```powershell
curl.exe -sk https://192.168.1.100/eSCL/ScannerCapabilities
```

---

## 4) Llenar el `.env`

Editá `backend/.env` y agregá las cinco variables. Ejemplo con un EPSON L4360 conectado por WiFi:

```env
ESCL_DEFAULT_SCANNER_NAME=EPSON L4360
ESCL_DEFAULT_SCANNER_IP=192.168.1.100
ESCL_DEFAULT_SCANNER_PORT=443
ESCL_DEFAULT_SCANNER_USE_TLS=true
ESCL_DEFAULT_SCANNER_VERIFY_TLS=false
```

Reglas para los valores:

| Variable | Valor |
| --- | --- |
| `ESCL_DEFAULT_SCANNER_NAME` | Cualquier texto identificable. Es la clave de matching en DB. Si lo cambiás, se crea un config nuevo (no renombra el anterior). |
| `ESCL_DEFAULT_SCANNER_IP` | La IP que confirmaste en los pasos 2 y 3. |
| `ESCL_DEFAULT_SCANNER_PORT` | `443` para HTTPS, `80` para HTTP. Podés dejarlo vacío y se elige el default según TLS. |
| `ESCL_DEFAULT_SCANNER_USE_TLS` | `true` si pasó el test HTTPS del paso 3, `false` si pasó HTTP. |
| `ESCL_DEFAULT_SCANNER_VERIFY_TLS` | `false` si el certificado es autofirmado (típico en impresoras de consumo). `true` si tenés un cert válido emitido por una CA. |

Reiniciá el backend (`Ctrl+C` y `npm run dev:backend`). En el log debería aparecer una de estas líneas la primera vez que el frontend pida la lista de escáneres:

```
[ScannerService] Env default scanner created: id=cmpXXX user=cmpYYY url=https://192.168.1.100:443
```

```
[ScannerService] Env default scanner updated: id=cmpXXX user=cmpYYY 192.168.1.100:443 -> 192.168.0.50:443 tls=true verify=false
```

A partir de ahí, abrí `http://localhost:3000/scan`: el escáner aparece guardado con el punto verde si está online.

---

## 5) Cambiar de red (mudarte entre lugares)

Cada router asigna IPs distintas. Cuando te llevés la laptop con DocScan a otra red:

1. Conectá la impresora a la nueva red WiFi (paso 1).
2. Imprimí una nueva hoja de estado o consultá el panel para ver la IP nueva (paso 2).
3. Editá una sola línea en `backend/.env`:
   ```env
   ESCL_DEFAULT_SCANNER_IP=192.168.0.50
   ```
4. Reiniciá backend.
5. Listo. El upsert en `getConfigs()` detecta el cambio de IP y actualiza la config en DB automáticamente al abrir `/scan`.

Tip: en routers domésticos, podés reservar la IP por MAC para que siempre tome la misma. Eso elimina el paso de reedición del `.env` cuando volvés a la misma red.

---

## 6) Cambiar de impresora (otra marca / otro modelo)

Si en la red nueva no hay un EPSON sino un HP, Brother o Canon:

1. Verificá que soporta eSCL/AirScan (paso 3 con la IP del nuevo equipo).
2. Cambiá tres líneas en `.env`:
   ```env
   ESCL_DEFAULT_SCANNER_NAME=HP LaserJet MFP
   ESCL_DEFAULT_SCANNER_IP=192.168.0.20
   ESCL_DEFAULT_SCANNER_USE_TLS=false
   ```
3. (Opcional pero recomendado) Borrá el config anterior desde el modal de `/scan` para que no quede colgado en DB.
4. Reiniciá backend.

El config nuevo se crea automáticamente. El anterior, si no lo borraste, queda inerte pero visible en la lista.

---

## 7) Diagnóstico cuando algo falla

| Síntoma | Diagnóstico | Solución |
| --- | --- | --- |
| `ping 192.168.X.Y` falla | La impresora no está en la red, o IP equivocada | Volver al paso 1-2 |
| `ping` OK, pero curl a eSCL da timeout | Firewall de Windows bloquea, o servicio eSCL apagado | Permitir el puerto en firewall, o reiniciar la impresora |
| curl HTTP da 307 | Redirige a HTTPS | Usar HTTPS en el `.env` |
| curl HTTPS da error de certificado | Cert autofirmado | `ESCL_DEFAULT_SCANNER_VERIFY_TLS=false` |
| El ping del backend da `online: false` pero curl manual da 200 | Falta el flag TLS correcto | Reverificar `USE_TLS` |
| Scan da `Poll timeout` después de 60s | No hay papel en el vidrio, o tapa abierta | Revisar el equipo físicamente |
| Scan da `HTTP 503` y retry no salva | Job viejo bloqueando | Ver jobs activos: `curl -sk https://IP/eSCL/ScannerStatus` y reiniciar impresora si hay muchos `Aborted` |

---

## 8) Comandos útiles de referencia

```powershell
# Lista de impresoras en Windows con sus puertos
Get-Printer | Select-Object Name, PortName, DriverName

# Dispositivos en la red local
arp -a

# Estado actual del escáner por eSCL
curl.exe -sk https://192.168.1.100/eSCL/ScannerStatus

# Capabilities completas (modos, resoluciones, formatos)
curl.exe -sk https://192.168.1.100/eSCL/ScannerCapabilities

# Ping desde la API del backend (requiere JWT)
curl http://localhost:3001/api/scanner/configs/<CONFIG_ID>/ping `
  -H "Authorization: Bearer <JWT>"
```
