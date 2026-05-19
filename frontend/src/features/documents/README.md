# `features/documents`

Módulo del listado de documentos: tabla paginada con búsqueda, filtros, KPIs y master-detail con panel lateral persistente.

## Arquitectura

```
DocumentsView (orquestador, src/views/DocumentsView/)
├── DocumentsMetricsRow      (3 KPIs uniformes, sparkline en --color-chart-1)
├── DocumentsSearchInput     (debounce 300ms)
├── DocumentsFilters         (tipo · estado · persona · rango fecha)
├── DocumentsTable           (DataTable<Document> con columnas semánticas)
├── DocumentsPagination      (range counter + size selector + paginación numérica)
└── AssignPersonModal        (reuse del modal existente)
```

Click en una fila navega a `/documents/[id]` (vista full-screen,
`DocumentDetailView`). No hay panel lateral persistente: la vista del
documento ocupa toda la pantalla con su chat panel + acciones OCR.

## Reglas duras

- **Estado "Revisión"** es DERIVADO (no existe en backend). `status='completed' AND confidence < CONFIDENCE_REVIEW_THRESHOLD (0.85)` → bucket "review". Helper canónico: `utils/getDisplayStatus.ts`.
- **Una sola constante** para el umbral: `utils/constants.ts → CONFIDENCE_REVIEW_THRESHOLD = 0.85`. Espejo del backend (`backend/src/modules/documents/documents.constants.ts`). La consumen el filtro implícito ("Revisión" → `status=completed&confidenceMax=0.85`), `getDisplayStatus`, `getConfidenceLevel` y el SQL de `stats.needsReview`.
- **Tipos del filtro UI** (cerrado, E.2): `cv · id_card · background_check · medical_cert · fiscal_social · general`. Definido en `utils/documentTypes.ts`.
- **Tokens de color**: solo los existentes en `globals.css`. Cero hex sueltos, cero Tailwind arbitrarios (`bg-blue-*`, etc.).
- **Cero mocks. Cero hardcoded values.**

## Mapeo semántico

| UI            | Componente               | Tokens                                                    |
| ---           | ---                      | ---                                                       |
| Tag de tipo   | `DocumentTypeTag`        | outline neutral con `--color-border-subtle` + `--color-fg-secondary`. CERO color semántico. |
| Badge estado  | `DocumentStatusBadge`    | success / warning / info / danger según `getDisplayStatus`. |
| Confianza     | `ConfidenceText`         | texto coloreado (no badge): high ≥95% → success-fg · 85–94% → warning-fg · <85% → danger-fg · null → fg-tertiary. |
| Persona       | `PersonCell`             | Avatar (iniciales) sobre `--color-surface-card-hover` + nombre o "Sin asignar". |
| Ícono archivo | `DocumentFileIcon`       | PNG oficiales `PDF_file_icon.svg.png` / `docx_icon.svg.png` según mime. Imágenes → mini-preview del CDN. CERO rojo Adobe. |

## URL state

Todo el state del listado vive en query params para permitir deep-linking:

```
?type=cv&status=review&personId=clxxxx&dateFrom=2026-04-01&dateTo=2026-04-30
&search=factura&page=2&limit=25&sort=createdAt&order=desc&selected=clyyyy
```

- `useDocumentsQuery()` lee/escribe filtros + paginación. Cualquier cambio de filtros resetea `page=1`.
- `toApiFilters(state)` traduce el state UI (con `status='review'` derivado) a los filtros del backend.

## Responsivo

Click en fila → `router.push('/documents/[id]')` en todos los breakpoints.
La vista del documento (`DocumentDetailView`) ocupa toda la pantalla y
trae chat panel + acciones OCR/smart-extract.

## Backend que consume

| Endpoint                            | Cuándo                                                                  |
| ---                                 | ---                                                                     |
| `GET /api/documents`                | Listado paginado. Acepta search, dateFrom/dateTo, type, status, personId, confidenceMin/Max, page, limit, sort, order. |
| `GET /api/documents/stats`          | KPIs. Acepta dateFrom/dateTo (default: mes actual). Devuelve total · ocrPrecision · needsReview, cada uno con `value + delta + sparkline[7]`. |
| `GET /api/documents/:id`            | Hidratación directa del doc en `/documents/[id]`.                       |
| `PATCH /api/documents/:id/assign`   | Reasignar persona.                                                      |
| `DELETE /api/documents/:id`         | Eliminar (confirma con `window.confirm`).                               |

## Public API

Otros módulos importan desde `@/features/documents` (ver `index.ts`). No importar de paths internos.

```ts
import {
  documentsClient,
  useDocumentsStats,
  DocumentStatusBadge,
  CONFIDENCE_REVIEW_THRESHOLD,
  type Document,
} from '@/features/documents';
```

## Out of scope (Fase 2+)

- Vista grid con thumbnails server-side.
- Preview interno de PDFs (react-pdf / pdfjs). Fase 1 redirige a CDN URL con "Abrir original".
- Bulk actions, export CSV/XLSX, comando Cmd+K.
- Nuevos document types (pasaporte / contrato / factura / certificado): requieren prompt OCR.
