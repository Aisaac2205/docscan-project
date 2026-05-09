# Legacy Tokens Inventory

Inventario completo de aliases deprecados introducidos en Fase 2 (sección 8 de `frontend/src/app/globals.css`) para mantener la aplicación funcional durante la migración del design system.

**Política de eliminación:** cada alias se elimina cuando el último archivo que lo usa es migrado en Fase 6. La columna "Archivos que lo usan" se completa durante la auditoría de Fase 5.

**Formato del comentario en `globals.css`:**

```css
/* @deprecated remove in Phase 6 — use var(--TOKEN-CORRECTO) instead */
```

---

## 1. CSS variables semánticas (`:root`)

| Alias deprecado | Resuelve a | Fase de eliminación | Archivos que lo usan |
|---|---|---|---|
| `--bg` | `var(--color-surface-page)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--surface` | `var(--color-surface-card)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--border` | `var(--color-border)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--border-strong` | `var(--color-border-strong)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--text-1` | `var(--color-fg-primary)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--text-2` | `var(--color-fg-secondary)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--text-3` | `var(--color-fg-tertiary)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--accent` | `var(--color-brand-500)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--accent-hover` | `var(--color-brand-600)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--accent-subtle` | `var(--color-brand-50)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--success` | `var(--color-success-fg)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--success-bg` | `var(--color-success-bg)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--success-border` | `var(--color-success-border)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--error` | `var(--color-danger-fg)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--error-bg` | `var(--color-danger-bg)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--error-border` | `var(--color-danger-border)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--warning` | `var(--color-warning-fg)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--warning-bg` | `var(--color-warning-bg)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--warning-border` | `var(--color-warning-border)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--info` | `var(--color-info-fg)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--info-bg` | `var(--color-info-bg)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--info-border` | `var(--color-info-border)` | Fase 6 | _Pendiente auditoría Fase 5_ |

**Notas de mapeo:**

- `--accent` (azul `#2563EB` original) → `brand-500` (`#205375`). Cambio de hue intencional: el accent del nuevo sistema es naranja `#F66B0E` y se reserva para CTAs únicos. Los usos existentes de `--accent` casi siempre eran links o botones primarios → semánticamente corresponden a `brand-500`, no al nuevo `accent`.
- `--error` → `danger-fg`. Renombrado: la familia se llama `danger` en el nuevo sistema; `--error` queda como alias hasta migrar.
- `--success-bg/-border`, `--error-bg/-border`, `--warning-bg/-border`, `--info-bg/-border` mantienen el sufijo legacy (`-bg`, `-border`) que ya no existe como utility, solo como CSS var. La migración a Tailwind utilities es: `bg-success-bg` → utility `bg-success-bg` (se genera automáticamente desde `--color-success-bg` en `@theme`).

---

## 2. Rampa Tailwind `stone-*` (override de palette default v4)

Override de la rampa default que ship Tailwind v4. Mantiene las utility classes `text-stone-*`, `bg-stone-*`, `border-stone-*`, `ring-stone-*`, etc. funcionales mientras se migran los archivos.

| Alias deprecado | Resuelve a | Fase de eliminación | Archivos que lo usan |
|---|---|---|---|
| `--color-stone-50` | `var(--color-neutral-50)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--color-stone-100` | `var(--color-neutral-100)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--color-stone-200` | `var(--color-neutral-200)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--color-stone-300` | `var(--color-neutral-300)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--color-stone-400` | `var(--color-neutral-400)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--color-stone-500` | `var(--color-neutral-500)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--color-stone-600` | `var(--color-neutral-600)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--color-stone-700` | `var(--color-neutral-700)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--color-stone-800` | `var(--color-neutral-700)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--color-stone-900` | `var(--color-neutral-900)` | Fase 6 | _Pendiente auditoría Fase 5_ |
| `--color-stone-950` | `var(--color-neutral-900)` | Fase 6 | _Pendiente auditoría Fase 5_ |

**Notas de mapeo:**

- La rampa `neutral-*` del nuevo sistema NO tiene stops 800 ni 950. Los aliases `stone-800` y `stone-950` colapsan a `neutral-700` y `neutral-900` respectivamente. Cualquier archivo que dependa de un stop intermedio fino entre 700/900 va a verse ligeramente distinto — esperado, NO bug. Documentar en migración si visualmente requiere ajuste.
- `stone-25` y `stone-75` del CSS legacy original (ver historial git de `globals.css`) NO se preservaron como aliases: no están en la default de Tailwind v4, no se generaba utility class para ellos.

---

## 3. Tokens removidos sin alias

Tokens del `globals.css` legacy que NO tienen alias deprecado porque no se detectó uso o el reemplazo es un cambio mecánico simple. Listarlos acá obliga a verificar en Fase 5 que efectivamente no se usan.

| Token legacy | Reemplazo | Verificar en Fase 5 |
|---|---|---|
| `--color-stone-25` | `var(--color-neutral-50)` (más cercano) | ¿algún archivo usa `text-stone-25`/`bg-stone-25`? |
| `--color-stone-75` | `var(--color-neutral-100)` (más cercano) | ¿algún archivo usa `text-stone-75`/`bg-stone-75`? |
| `--color-accent-50` (azul `#EFF6FF` legacy) | `var(--color-brand-50)` | ¿uso de `bg-accent-50`/`border-accent-50` con expectativa de azul claro? |
| `--color-accent-100` (azul `#DBEAFE` legacy) | `var(--color-brand-100)` | ¿uso de `bg-accent-100`? |
| `--color-accent-500` (azul `#3B82F6` legacy) | `var(--color-brand-500)` | ¿uso de `bg-accent-500`/`text-accent-500`? **CRÍTICO**: el nuevo `accent-500` es naranja, hay riesgo de cambio visual inesperado. |
| `--color-accent-600` (azul `#2563EB` legacy) | `var(--color-brand-600)` | mismo caso que arriba |
| `--color-accent-700` (azul `#1D4ED8` legacy) | `var(--color-brand-700)` | mismo caso que arriba |
| `--shadow-card` | `var(--shadow-sm)` | uso directo de `var(--shadow-card)` en inline styles |
| `--shadow-elevated` | `var(--shadow-md)` | uso directo de `var(--shadow-elevated)` en inline styles |
| `--shadow-modal` | `var(--shadow-md)` (no hay `lg`/`xl` en nuevo sistema) | uso directo de `var(--shadow-modal)` |
| `--radius` (default 6px) | `var(--radius-md)` | uso directo de `var(--radius)` |
| `--radius-2xl` (20px legacy) | `var(--radius-xl)` (12px) | **CRÍTICO**: cambio visual, antiguo era 20px, nuevo máximo es 12px |
| `--text-heading-xl` (fluid) | utility `text-h1` o `text-display-lg` | uso de `var(--text-heading-xl)` en inline styles |
| `--text-heading-lg` (fluid) | utility `text-h2` | uso de `var(--text-heading-lg)` |
| `--text-body` (fluid) | utility `text-body` o `text-body-lg` | uso de `var(--text-body)` |
| `--text-label` (fluid) | utility `text-caption` o `text-overline` | uso de `var(--text-label)` |
| `--space-page` (fluid) | clases `px-6 lg:px-8 py-6 lg:py-8` | uso de `var(--space-page)` |
| `--space-card` (fluid) | clases `p-6` (default) o `p-4`/`p-8` | uso de `var(--space-card)` |
| `--sidebar-icon-size` (responsive) | utility `.sidebar-icon` (preservada) | uso de `var(--sidebar-icon-size)` directo |
| `--sidebar-label-size` (responsive) | utility `text-overline` o `text-caption` | uso de `var(--sidebar-label-size)` |
| `--sidebar-sublabel-size` (responsive) | utility `text-caption` | uso de `var(--sidebar-sublabel-size)` |
| `--header-logo-size` (responsive) | size hardcodeado en componente Header | uso de `var(--header-logo-size)` |
| `--header-avatar-size` (responsive) | size hardcodeado en componente Avatar | uso de `var(--header-avatar-size)` |

**Riesgo conocido:** los tres tokens `--color-accent-*` legacy resolvían a azul. El nombre se mantiene en el nuevo sistema pero el color cambió a naranja. Cualquier uso actual (probablemente botones primarios o links) va a renderizarse con `accent-500: #F66B0E` en lugar del azul `#2563EB` original. Auditoría de Fase 5 debe identificar estos usos como prioridad alta antes de empezar Fase 6, para decidir caso por caso si el archivo en cuestión necesita el nuevo `accent` (cambio intencional) o `brand-500` (preservar el azul original).

---

## 4. Workflow de eliminación (Fase 6)

Por cada archivo migrado en Fase 6:

1. Buscar todos los aliases deprecados que el archivo consume (grep por nombre del var o utility class).
2. Reemplazar por el token nuevo según las tablas de arriba.
3. Marcar el archivo en la columna "Archivos que lo usan" con `[x] migrado en Fase 6`.
4. Cuando la columna de un alias quede vacía (todos los usos migrados), eliminar el alias de `globals.css` sección 8.
5. Commit dedicado por alias eliminado (ej: `chore(design-system): drop --bg legacy alias`).

**Definition of Done de Fase 6:** sección 8 de `globals.css` queda vacía y se elimina del archivo. El override de la rampa `stone-*` también se elimina, dejando que Tailwind v4 use su default (que ya no se va a usar porque ningún archivo referencia `*-stone-*`).
