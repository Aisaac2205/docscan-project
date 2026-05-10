# Legacy Tokens Inventory — MIGRACIÓN COMPLETADA ✅

> **Estado final (Wave 10):** todos los aliases legacy fueron eliminados de `frontend/src/app/globals.css` sección 8. El design system migration está al 100%.

## Resultado final

| Métrica | Baseline | Final |
|---|---|---|
| Total usos `*-stone-*` | 641 | **0 ✅** |
| Archivos con `*-stone-*` | 70 | **0 ✅** |
| Archivos con legacy CSS var (`var(--bg)`/`var(--border)`/etc) | 33 | **0 ✅** |
| Usos de `font-bold`/`font-extrabold`/`font-black` | 4 | **0 ✅** |
| Lint problems | 16 | 8 (pre-existentes, no del design system) |
| Build status | ✅ pasa | ✅ pasa |

## Evolución por wave

| Wave | Scope | Stones eliminados | Archivos cerrados |
|---|---|---|---|
| W1 | Layout (Header, Sidebar, BottomNav) | 27 | 3 |
| W2 | Componentes legacy compartidos (StatCard huérfano DELETE, KPICard→StatCard nuevo, StatusBadge/PersonStatusBadge → wrappers Badge, ToastContainer) | 26 | 5 |
| W3 | Auth (login, register) | 28 | 2 |
| W4 | Dashboard (DashboardView + 7 componentes) | 46 | 8 |
| W5 | Documents (2 views + 9 componentes) | 119 | 11 |
| W6 | Scanner (View + 12 componentes, dividido 6a/6b) | 270 | 13 |
| W7 | Persons (2 views + form + 8 profile panels) | 117 | 12 |
| W8 | Talent pool (View + 7 componentes) | 91 | 8 |
| W9 | Health/Compliance/Inbox/MarkdownRenderer/error.tsx | 47 | 10 |
| W10 | **Cleanup final**: eliminar sección 8 legacy compat de globals.css | — | — |

## Migración completada — referencia histórica

### Mapeo de tokens originales → tokens nuevos

| Token legacy (eliminado) | Reemplazo |
|---|---|
| `var(--bg)` | `var(--color-surface-page)` o utility `bg-surface-page` |
| `var(--surface)` | `var(--color-surface-card)` o utility `bg-surface-card` |
| `var(--border)` | `var(--color-border)` o utility `border-border` |
| `var(--border-strong)` | `var(--color-border-strong)` o utility `border-border-strong` |
| `var(--text-1)` | `var(--color-fg-primary)` o utility `text-fg-primary` |
| `var(--text-2)` | `var(--color-fg-secondary)` o utility `text-fg-secondary` |
| `var(--text-3)` | `var(--color-fg-tertiary)` o utility `text-fg-tertiary` |
| `var(--accent)` (azul `#2563EB`) | `var(--color-brand-500)` o utility `bg-brand-500`/`text-fg-link` |
| `var(--accent-hover)` | `var(--color-brand-600)` |
| `var(--accent-subtle)` | `var(--color-brand-50)` |
| `var(--success/-bg/-border)` | `var(--color-success-fg/-bg/-border)` o utilities `text-success-fg`/`bg-success-bg`/`border-success-border` |
| `var(--error/-bg/-border)` | `var(--color-danger-fg/-bg/-border)` (renombrado a danger en nuevo sistema) |
| `var(--warning/-bg/-border)` | `var(--color-warning-fg/-bg/-border)` |
| `var(--info/-bg/-border)` | `var(--color-info-fg/-bg/-border)` |
| `text-stone-*` (warm) | `text-fg-*` semánticos o `text-neutral-*` (slate frío) |
| `bg-stone-*` | `bg-surface-*` semánticos o `bg-neutral-*` |
| `border-stone-*` | `border-border` / `border-border-subtle` / `border-border-strong` |
| `font-bold/extrabold/black` | máximo permitido `font-medium` (500). Headings usan `text-h1..h4` que tienen weight 500 default. |

### Vars dinámicos preservados (NO son legacy)

Estos siguen vivos en `globals.css` §7 — no son aliases deprecados, son layout vars que cambian con media queries:

- `var(--sidebar-width)` (0px mobile / 260px lg)
- `var(--header-height)` (56px / 64px lg)
- `var(--bottom-nav-height)` (60px mobile / 0px lg)

### Vars dinámicos eliminados

Estos vars dinámicos del legacy se eliminaron sin reemplazo (los archivos que los usaban se migraron a clases Tailwind directas):

- `var(--text-heading-xl/-lg)` → utilities `text-h1`/`text-h2`/`text-display-lg`
- `var(--text-body)`, `var(--text-label)` → `text-body`/`text-caption`/`text-overline`
- `var(--space-page)`, `var(--space-card)` → `p-4 md:p-6 lg:p-8`/`p-4 md:p-5`
- `var(--shadow-card/-elevated/-modal)` → `shadow-sm`/`shadow-md`
- `var(--sidebar-icon-size)`, `var(--sidebar-label-size)`, `var(--sidebar-sublabel-size)` → utility class `.sidebar-icon` (preservada en `globals.css` §10) o tamaños fijos
- `var(--header-logo-size)`, `var(--header-avatar-size)` → tamaños fijos en componente (`w-[26px] lg:w-[30px]`)

### Patrones duplicados aún sin extraer (deuda técnica)

Marcados durante la auditoría pero no se extrajeron a componentes en esta migración. Quedan como inline en cada feature. Si se reúsan más en el futuro, considerar extracción:

- **Modal pattern** (4 archivos: AssignPersonModal, ExtractedDataModal, WifiModal, CameraModal) — falta `<Modal>` en design system
- **Chat bubble** (2 archivos: DocumentChatPanel, OCRChatPanel) — pattern divergente, podría extraerse a `<ChatBubble>`
- **Drop zone** (3 archivos: DocumentUpload, ScannerDropZone, UploadZone) — patterns similares pero distintos
- **Form field group** (3 forms densos: PersonForm, CriteriaForm, ExtractionConfigPanel) — `<FormField>` extraíble

### Próxima sesión: posibles mejoras post-migración

- Crear `<Modal>` en design system y migrar los 4 modales
- Crear `<Avatar>` para Header (reemplazar pill de iniciales)
- Documentar el design system en `docs/design-system.md` (filosofía, tokens, componentes, ejemplos)
- Considerar dark mode (estructura preparada en globals.css §12 — comentario)
