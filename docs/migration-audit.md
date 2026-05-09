# Migration audit — Fase 5

Auditoría completa del frontend antes de la migración Fase 6. Sin modificar código.

**Stats globales:**
- 70 archivos `.tsx` con **641 usos de `*-stone-*`** (heredan del legacy compat → renderizan slate frío, pero requieren migración explícita)
- 33 archivos con CSS vars legacy (`var(--bg)`, `var(--border)`, `var(--accent)`, etc.) — la mayoría en `className=[var(--border)]` que sigue funcionando vía alias
- 14 archivos con headings hardcodeados (`text-2xl`/`text-3xl`/`text-4xl` + `font-semibold`)
- 22 archivos con colores raw de Tailwind para estados semánticos (`bg-emerald-50`, `text-rose-600`, `bg-amber-100`)
- 25 archivos con patrón eyebrow `uppercase tracking-wider`
- 15 archivos con animation classes (`animate-fade-in`, `stagger-children`, `card-interactive`)
- 7 archivos con `style={{ ... }}` (la mayoría son los de Layout usando `var(--sidebar-width)` etc — uso legítimo de §7)
- 7 archivos con hex hardcodeado (algunos en stroke de SVG — patrón anti-currentColor)
- 4 archivos con `font-bold` (anti-pattern explícito — máximo permitido es 500)

**Severidad:**
- **Alta**: afecta consistencia global, alto blast radius (Layout, KPICard, Auth)
- **Media**: inconsistencia local visible, requiere reemplazo no trivial
- **Baja**: cosmético, reemplazo mecánico

**Esfuerzo:**
- **S**: < 5 min, búsqueda y reemplazo
- **M**: 5-20 min, requiere reestructurar imports y JSX
- **L**: > 20 min, requiere extraer a componente nuevo o reordenar lógica

---

## Wave 0 — Setup verification

### src/shared/components/Layout/AppShell.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| Usa `style={{ paddingLeft: 'var(--sidebar-width)' }}` (legítimo, §7 globals.css) | — | — |
| `p-4 md:p-6 lg:p-8 xl:p-10` — padding arbitrario fuera de spacing convention | Baja | S |

**Notas:** archivo limpio, casi no requiere cambios. Solo verificar que `var(--sidebar-width)`, `var(--header-height)`, `var(--bottom-nav-height)` sigan resolviendo (sí, definidos en §7).

---

## Wave 1 — Layout (afecta todas las rutas)

### src/shared/components/Layout/Header.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 5 usos de `text-stone-*` / `bg-stone-*` | Media | S |
| `border-[var(--border)]` legacy var en 3 lugares → `border-border` | Media | S |
| `bg-white` → `bg-surface-card` | Media | S |
| `text-base tracking-tight` en logo → `text-h4` o equivalente | Baja | S |
| `text-xs font-semibold` para iniciales → migrar a token | Baja | S |
| Inline SVG `LogoutIcon` puede migrar a `lucide-react/LogOut` (regla DECISIÓN G) | Baja | S |
| `min-h-[44px]` en botón → revisar (mobile tap target) | Baja | S |

**Patrones a extraer:** el botón de logout es candidato a `<Button variant="ghost" leftIcon={<LogOut />}>Salir</Button>`. La pill de iniciales es candidata a un `<Avatar>` (pero Avatar no está en el design system → mantener inline o crearlo en una fase futura).

### src/shared/components/Layout/Sidebar.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 9 usos de `text-stone-*` (300, 400, 500, 700, 800, 900) | Alta | M |
| `border-[var(--border)]` legacy var en 2 lugares | Media | S |
| `bg-white` → `bg-surface-card` | Media | S |
| Botones de tab tienen `text-sm font-medium` hardcodeado → migrar a `text-button` | Media | S |
| Eyebrows con `text-[11px] lg:text-xs font-semibold uppercase tracking-wider` (3 ocurrencias) → `text-overline text-overline-uppercase` | Media | S |
| Active state `bg-stone-100 text-stone-900` → `bg-surface-sunken text-fg-primary` | Media | S |
| Hover state `hover:bg-stone-50` → `hover:bg-surface-sunken` | Media | S |
| `space-y-0.5` arbitrario → revisar si gap del Stack equivalente sirve | Baja | S |
| Iconos inline son parte de la identidad — quedan como inline SVG (DECISIÓN G) | — | — |

**Patrones a extraer:** los `<button>` con icon+label son candidatos a un `<NavItem>` interno del Layout. No es prioridad de Fase 6 — extraer solo si la migración inline se vuelve repetitiva.

### src/shared/components/Layout/BottomNav.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 4 usos de `text-stone-*` / `bg-stone-*` | Media | S |
| `border-[var(--border)]` legacy var | Media | S |
| `bg-white` → `bg-surface-card` | Media | S |
| `text-[10px] font-medium` → `text-overline` o `text-caption` | Baja | S |
| Active dot `bg-stone-900 rounded-full` → `bg-fg-primary` | Baja | S |

**Patrones a extraer:** mismo `<NavItem>` que Sidebar si extraemos (DRY entre desktop y mobile nav).

---

## Wave 2 — Dashboard

### src/features/dashboard/components/StatCard.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| **ARCHIVO HUÉRFANO** — ningún archivo lo importa (verificado con grep) | Alta | S |
| Naming collision con `src/shared/components/data-display/StatCard.tsx` | Alta | S |
| 3 stone-* | — | — |

**Notas:** **DELETE.** No tiene consumers. La acción de Fase 6 es `git rm`. Después, el nuevo `StatCard` queda libre para cualquier archivo que lo necesite sin colisión de imports.

### src/features/dashboard/components/KPICard.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 10 stone-* | Alta | M |
| 4 colores semánticos raw: `bg-emerald-50`/`text-emerald-700`, `bg-rose-50`/`text-rose-700`, `bg-amber-50`/`text-amber-700` | Alta | M |
| `text-2xl md:text-3xl font-semibold` para value → `text-display-lg` o `text-h1` | Alta | S |
| `text-xs uppercase tracking-wider font-semibold` → `text-overline text-overline-uppercase` | Media | S |
| `font-semibold` (3 ocurrencias) — anti-pattern (max weight = 500) | Alta | S |
| `rounded-xl` para icon container (12px OK, dentro del límite) | — | — |
| `animate-pulse bg-stone-100` para skeleton → `<Skeleton />` del nuevo design system | Media | S |

**DECISIÓN de migración (alta):** el nuevo `StatCard` tiene `variant: 'default' | 'accent'`. KPICard tiene 4 tones (neutral/positive/warning/critical) que reflejan estado semántico. Dos opciones:

1. **Reemplazar KPICard por StatCard nuevo** y perder los tones semánticos coloreados (Vercel/Linear no usan colores en stat cards — la métrica habla sola).
2. **Extender StatCard** con variants `success`/`warning`/`danger` que apliquen a icon background + valueText.

Mi recomendación: **opción 1** — coherencia con la dirección estética enterprise. El "estado" de una KPI se comunica con el delta (verde subió, rojo bajó), no con el background del icon. Decisión a confirmar con vos.

### src/views/DashboardView/DashboardView.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 6 stone-* | Media | S |
| Hex en SVGs `stroke="#A8A29E"` (SearchIcon) → `currentColor` + clase de Tailwind | Media | S |
| Heading inline `<h1 className="text-xl md:text-2xl font-semibold text-stone-900">` → `<PageHeader title="..." />` | Alta | M |
| Eyebrow `text-xs uppercase tracking-wider font-semibold text-stone-400` → `text-overline text-overline-uppercase text-fg-tertiary` | Media | S |
| `font-semibold` para subtitle h2 → `text-h2` (que ya tiene weight 500) | Media | S |
| Search input inline → `<Input leftIcon={<Search />} />` | Alta | M |
| Alert error con `bg-rose-50 border-rose-200 text-rose-700` → `<Alert />` o `<Badge variant="danger" />` (Alert no existe — inline con tokens `bg-danger-bg fg=danger-fg border=danger-border`) | Media | S |
| 9 SVG icons inline en bottom del archivo → migrar a `lucide-react` (Search, FileText, Users, Inbox, Stethoscope, Upload, Download, History, Settings) | Media | M |
| `animate-fade-in` + `stagger-children` legítimo (preservados en globals.css §11) | — | — |
| `mb-5 md:mb-7` y `mb-6 md:mb-8` arbitrarios → revisar consolidación | Baja | S |

**Patrones a extraer:** la barra superior (eyebrow + h1 + search input) es exactamente un `PageHeader` con `breadcrumb` y `actions` slot — migración directa.

### src/features/dashboard/components/WelcomeBanner.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 2 stone-* | Baja | S |
| `text-2xl` heading hardcodeado | Media | S |

### src/features/dashboard/components/ActionCard.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 4 stone-* | Media | S |
| `card-interactive` legacy class (preservada — sin cambio funcional) | — | — |
| Probable patrón candidato a `<Card variant="interactive">` con CardHeader+CardContent | Media | M |

### src/features/dashboard/components/RecentDocumentCard.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 7 stone-* | Media | S |
| Hex hardcodeado | Media | S |
| `card-interactive` (preservado) | — | — |
| Raw `bg-amber-*` / `bg-emerald-*` para status | Media | S |
| Patrón duplicado con `DocumentCard.tsx` — candidato a unificar | Alta | L |

### src/features/dashboard/components/RecentActivity.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 12 stone-* | Alta | M |
| `stagger-children` (preservado) | — | — |

### src/features/dashboard/components/HardwareCard.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 7 stone-* | Media | S |
| `card-interactive` (preservado) | — | — |

### src/features/dashboard/components/UploadZone.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 7 stone-* | Media | S |
| Hex hardcodeado | Media | S |

### src/features/dashboard/components/DashboardFooter.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 2 stone-* | Baja | S |

---

## Wave 3 — Auth

### src/app/(auth)/login/page.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 13 stone-* | Alta | M |
| Hex hardcodeado | Media | S |
| `font-bold` → max permitido 500 | Alta | S |
| `text-2xl` para título → `text-h1` o `text-display-lg` | Media | S |
| Inputs inline → `<Input />` con `<Label />` | Alta | M |
| Botón inline → `<Button variant="primary" loading={...} />` | Alta | S |

### src/app/(auth)/register/page.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 15 stone-* | Alta | M |
| Hex hardcodeado | Media | S |
| `font-bold` (2 ocurrencias) → max permitido 500 | Alta | S |
| `text-3xl` → `text-display-lg` | Media | S |
| Mismo patrón que login — migración paralela | Alta | M |

---

## Wave 4 — Scanner

### src/views/ScannerView/ScannerView.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 8 stone-* | Media | M |
| Heading hardcodeado → `<PageHeader />` | Media | S |
| Patrón `uppercase tracking` (2x) → `text-overline-uppercase` | Baja | S |

### src/features/scanner/components/WifiModal.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 25 stone-* (max del proyecto) | Alta | L |
| 5 patrones uppercase tracking | Media | S |
| Likely tiene su propio modal pattern duplicado con otros modales | Alta | L |

### src/features/scanner/components/ExtractionConfigPanel.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 24 stone-* | Alta | L |
| `font-bold` | Alta | S |
| 6 patrones uppercase tracking | Media | S |
| `card-interactive` (preservado) | — | — |
| Form complejo — múltiples Inputs/Selects/Textareas inline | Alta | L |

### src/features/scanner/components/OCRResultPanel.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 19 stone-* | Alta | M |
| 2 uppercase tracking | Media | S |
| Status displays — candidatos a `<Badge variant="..." />` | Media | M |

### src/features/scanner/components/OCRChatPanel.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 17 stone-* | Alta | M |
| Chat bubbles inline — patrón a extraer si se duplica con `DocumentChatPanel` | Media | L |

### src/features/scanner/components/ScannerDropZone.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 14 stone-* | Alta | M |
| Drop zone pattern → posible `<DropZone>` component si se reusa | Media | L |

### src/features/scanner/components/ResultPanel.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 12 stone-* | Alta | M |
| Hex hardcodeado | Media | S |

### src/features/scanner/components/RecentScansFeed.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 10 stone-* | Media | M |
| 2 uppercase tracking | Media | S |
| `stagger-children` (preservado) | — | — |

### src/features/scanner/components/ScannerMetricsBar.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 7 stone-* | Media | S |
| `font-bold` | Alta | S |
| `text-2xl` heading | Media | S |
| `style={{...}}` con valores arbitrarios | Media | S |
| Métricas inline → ideal candidato a `<StatCard>` | Alta | M |

### src/features/scanner/components/SourceCard.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 6 stone-* | Media | S |
| `card-interactive` (preservado) | — | — |
| Card pattern → migrar a `<Card variant="interactive">` | Media | S |

### src/features/scanner/components/CameraModal.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 6 stone-* | Media | S |

### src/features/scanner/components/ScanResultBar.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 5 stone-* | Media | S |

### src/features/scanner/components/OCRPanel.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 3 stone-* | Baja | S |
| `font-bold` | Alta | S |

---

## Wave 5 — Documents

### src/views/DocumentsView/DocumentsView.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 5 stone-* | Media | S |
| Heading hardcodeado → `<PageHeader />` | Media | S |

### src/views/DocumentDetailView/DocumentDetailView.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 17 stone-* | Alta | M |

### src/features/documents/components/DocumentCard.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 8 stone-* | Media | M |
| `border-[var(--border)]` legacy var | Media | S |
| `hover:text-red-500 hover:bg-red-50` raw color (debería ser `hover:bg-danger-bg`) | Media | S |
| Card pattern manual (`bg-white rounded-xl border ...`) → `<Card variant="interactive">` | Alta | M |
| `text-sm lg:text-base` arbitrario → consolidar en token | Baja | S |

### src/features/documents/components/DocumentChatPanel.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 19 stone-* | Alta | M |
| 3 uppercase tracking | Media | S |
| Chat pattern duplicado con OCRChatPanel — extraer `<ChatBubble>` | Alta | L |

### src/features/documents/components/ExtractedFieldsPanel.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 16 stone-* | Alta | M |
| 5 uppercase tracking | Media | S |
| Field rows → posible `<DataTable>` o `<DefinitionList>` | Media | M |

### src/features/documents/components/AssignPersonModal.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 16 stone-* | Alta | M |
| 2 uppercase tracking | Media | S |
| `card-interactive` (preservado) | — | — |
| Modal pattern duplicado (3+ modales en el proyecto) — extraer `<Modal>` (no en design system actual) | Alta | L |

### src/features/documents/components/ExtractedDataModal.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 12 stone-* | Alta | M |
| `card-interactive` (preservado) | — | — |
| Modal pattern duplicado | Alta | L |

### src/features/documents/components/DocumentUpload.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 13 stone-* | Alta | M |
| Drop zone pattern duplicado con ScannerDropZone | Alta | L |

### src/features/documents/components/InboxItem.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 10 stone-* | Media | M |
| 2 uppercase tracking | Media | S |

### src/features/documents/components/StatusBadge.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 3 stone-* | Baja | S |
| Wrapper sobre status — posible reemplazo directo por `<Badge variant="..." />` | Alta | S |

### src/features/documents/components/AssignPersonButton.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 3 stone-* | Baja | S |
| Botón inline → `<Button>` | Media | S |

### src/app/documents/[id]/page.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 1 stone-* | Baja | S |

---

## Wave 6 — Persons

### src/views/PersonsView/PersonsView.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 13 stone-* | Alta | M |
| 1 uppercase tracking | Media | S |

### src/views/PersonDetailView/PersonDetailView.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 15 stone-* | Alta | M |
| 1 uppercase tracking | Media | S |

### src/features/persons/components/PersonForm.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 12 stone-* | Alta | L |
| 7 uppercase tracking (formulario denso) | Media | S |
| Inputs/Selects inline → `<Input>`/`<Select>` | Alta | L |

### src/features/persons/components/PersonPicker.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 12 stone-* | Alta | M |

### src/features/persons/components/PersonCard.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 4 stone-* | Media | S |
| Card pattern → `<Card>` | Media | S |

### src/features/persons/components/PersonStatusBadge.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 6 stone-* | Media | S |
| Reemplazo directo por `<Badge>` | Alta | S |

### src/features/persons/components/profile/EvaluationsPanel.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 21 stone-* | Alta | L |
| 4 uppercase tracking | Media | S |

### src/features/persons/components/profile/DocumentsPanel.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 13 stone-* | Alta | M |

### src/features/persons/components/profile/ConflictsPanel.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 6 stone-* | Media | S |
| 1 uppercase tracking | Media | S |

### src/features/persons/components/profile/MedicalHistoryPanel.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 5 stone-* | Media | S |

### src/features/persons/components/profile/ProfileSection.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 5 stone-* | Media | S |

### src/features/persons/components/profile/CompliancePanel.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 4 stone-* | Media | S |

### src/features/persons/components/profile/ProfileField.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 2 stone-* | Baja | S |
| 1 uppercase tracking | Media | S |

---

## Wave 7 — Talent pool

### src/views/TalentPoolView/TalentPoolView.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 10 stone-* | Media | M |

### src/features/talent-pool/components/EvaluationPanel.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 17 stone-* | Alta | L |

### src/features/talent-pool/components/DocumentPicker.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 12 stone-* | Alta | M |

### src/features/talent-pool/components/CriteriaForm.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 12 stone-* | Alta | L |
| Form pattern denso | Alta | L |

### src/features/talent-pool/components/HistorySection.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 10 stone-* | Media | M |

### src/features/talent-pool/components/ListField.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 10 stone-* | Media | M |

### src/features/talent-pool/components/RankingResult.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 6 stone-* | Media | S |

### src/features/talent-pool/components/CandidateCard.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 6 stone-* | Media | S |
| Card pattern → `<Card>` | Media | S |

---

## Wave 8 — Health, Compliance, Inbox, misc

### src/views/HealthView/HealthView.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 8 stone-* | Media | M |
| 1 uppercase tracking | Media | S |
| Heading hardcodeado | Media | S |

### src/views/InboxView/InboxView.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 8 stone-* | Media | M |
| 1 uppercase tracking | Media | S |

### src/features/health/components/HealthRecordCard.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 9 stone-* | Media | S |
| 2 uppercase tracking | Media | S |
| Card pattern → `<Card>` | Media | S |

### src/features/health/components/HealthActions.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 8 stone-* | Media | S |

### src/features/health/components/HealthFilters.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 3 stone-* | Baja | S |

### src/features/compliance/components/ValidationSummary.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 6 stone-* | Media | S |
| 1 uppercase tracking | Media | S |

### src/features/compliance/components/ValidationList.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 7 stone-* | Media | S |
| 1 uppercase tracking | Media | S |

### src/shared/ui/toast/ToastContainer.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 4 stone-* | Media | S |
| Vive en `src/shared/ui/` (no en `src/shared/components/ui/`) — considerar mover | Baja | M |

### src/shared/components/MarkdownRenderer/MarkdownRenderer.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| 2 stone-* | Baja | S |

### src/app/error.tsx
| Problema | Severidad | Esfuerzo |
|---|---|---|
| `font-bold` | Alta | S |
| Hex (probable) | Media | S |

---

## Patrones duplicados detectados (extracción candidata a `ui/` futura)

| Patrón | Archivos involucrados | Recomendación |
|---|---|---|
| Modal | AssignPersonModal, ExtractedDataModal, WifiModal, CameraModal | Crear `<Modal>` en design system (no está en Fases 3/4) — **NO bloqueante** para Fase 6 |
| Chat bubbles | DocumentChatPanel, OCRChatPanel | `<ChatBubble>` interno o duplicar — decidir caso por caso |
| Drop zone | DocumentUpload, ScannerDropZone, UploadZone | Posible `<DropZone>` — esperar Fase 6 |
| Form field group (Label + Input + helper) | PersonForm, CriteriaForm, ExtractionConfigPanel | Posible `<FormField>` — esperar Fase 6 |
| Card de status (status pill + datos + acciones) | DocumentCard, RecentDocumentCard, HealthRecordCard, CandidateCard, PersonCard, SourceCard | Reusar `<Card variant="interactive">` directamente — no nuevo componente |

---

## Migración deprecada → eliminación de aliases

Cuando termine cada Wave, actualizar `docs/legacy-tokens-inventory.md`:

- Wave 1 (Layout): elimina usos de `var(--border)` en 3 archivos → si nadie más los usa, eliminar `--border` del legacy compat.
- Wave 2-3 (Dashboard + Auth): elimina mayoría de `text-stone-*` de alta visibilidad.
- Wave 8: cierre — eliminar todos los aliases que quedaron en cero usos.

Verificación final de Fase 6: `grep -r "stone-" frontend/src` debe retornar 0. Mismo con `var(--bg|--border|--text-1|--accent)`.
