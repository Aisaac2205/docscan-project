/**
 * Documentación viva del design system. Solo se monta en desarrollo a través
 * de app/(dev)/design/page.tsx — en producción la ruta devuelve 404.
 *
 * Estructura: una sección por componente, con bloques de variants, sizes,
 * states y un ejemplo de uso compuesto al final.
 */

import type { ReactNode } from 'react';
import {
  Stack,
  Cluster,
  Heading,
  PageHeader,
  SectionHeader,
} from '@/shared/components/Layout';
import {
  Button,
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Textarea,
  Select,
  Label,
  Badge,
  Separator,
  Skeleton,
} from '@/shared/components/ui';
import {
  StatCard,
  ChartContainer,
  DataTable,
  EmptyState,
  type DataTableColumn,
} from '@/shared/components/data-display';
import { DocumentsLineChart } from './__chart-example__';

/* ── Iconos auxiliares (solo para los ejemplos) ───────────────────────────── */

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
    <path d="m11 11 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const UserIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 14c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/* ── Mock data y columns para DataTable example ──────────────────────────── */

interface DocRow {
  id: string;
  type: string;
  uploadedAt: string;
  confidence: number;
  status: 'validated' | 'review' | 'error';
}

const docRows: DocRow[] = [
  { id: 'DPI-2024-0142', type: 'DPI',     uploadedAt: '12 may 14:32', confidence: 0.94, status: 'validated' },
  { id: 'DPI-2024-0143', type: 'DPI',     uploadedAt: '12 may 14:28', confidence: 0.62, status: 'review' },
  { id: 'INV-2024-0091', type: 'Factura', uploadedAt: '12 may 13:55', confidence: 0.88, status: 'validated' },
  { id: 'INV-2024-0092', type: 'Factura', uploadedAt: '12 may 12:40', confidence: 0.31, status: 'error' },
];

const docColumns: DataTableColumn<DocRow>[] = [
  { key: 'id', header: 'ID' },
  { key: 'type', header: 'Tipo' },
  { key: 'uploadedAt', header: 'Cargado' },
  {
    key: 'confidence',
    header: 'Confianza',
    align: 'right',
    render: (row) => `${Math.round(row.confidence * 100)}%`,
  },
  {
    key: 'status',
    header: 'Estado',
    align: 'right',
    render: (row) => {
      if (row.status === 'validated') return <Badge variant="success">Validado</Badge>;
      if (row.status === 'review')    return <Badge variant="warning">Revisar</Badge>;
      return <Badge variant="danger">Error</Badge>;
    },
  },
];

function DataTableExample() {
  return (
    <DataTable
      ariaLabel="Documentos recientes"
      columns={docColumns}
      data={docRows}
      getRowKey={(row) => row.id}
    />
  );
}

/* ── Block de ejemplo (eyebrow + frame) ───────────────────────────────────── */

interface ExampleBlockProps {
  label: string;
  children: ReactNode;
  fullWidth?: boolean;
}

function ExampleBlock({ label, children, fullWidth }: ExampleBlockProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-overline text-overline-uppercase text-fg-tertiary">{label}</p>
      <div
        className={
          fullWidth
            ? 'rounded-lg border border-border-subtle bg-surface-card p-4'
            : 'flex flex-wrap items-center gap-3 rounded-lg border border-border-subtle bg-surface-card p-4'
        }
      >
        {children}
      </div>
    </div>
  );
}

function SectionWrapper({ children }: { children: ReactNode }) {
  return <Stack gap="md" className="mt-4">{children}</Stack>;
}

/* ── Galería completa ─────────────────────────────────────────────────────── */

export function DesignSystemGallery() {
  return (
    <Stack gap="xl" className="max-w-5xl mx-auto p-8">
      <PageHeader
        title="Design system"
        description="Galería de componentes ui/ y layout/. Solo visible en desarrollo."
        breadcrumb={
          <span className="text-overline text-overline-uppercase text-fg-tertiary">
            Diseño · DocScan
          </span>
        }
      />

      {/* ============================== BUTTON ============================== */}
      <section>
        <SectionHeader title="Button" description="Acciones del sistema con 5 variants y 3 sizes." />
        <SectionWrapper>
          <ExampleBlock label="Variants">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="link">Link</Button>
          </ExampleBlock>

          <ExampleBlock label="Sizes">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </ExampleBlock>

          <ExampleBlock label="States">
            <Button>Default</Button>
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
            <p className="text-caption text-fg-tertiary basis-full">
              Hover y focus son estados runtime — interactuá con el botón para verlos.
            </p>
          </ExampleBlock>

          <ExampleBlock label="Con icons">
            <Button leftIcon={<SearchIcon />}>Buscar</Button>
            <Button rightIcon={<PlusIcon />}>Agregar</Button>
            <Button variant="ghost" leftIcon={<UserIcon />}>Mi cuenta</Button>
          </ExampleBlock>

          <ExampleBlock label="asChild — renderiza otro elemento manteniendo estilos">
            <Button asChild variant="link">
              <a href="#">Esto es un anchor estilizado como link button</a>
            </Button>
          </ExampleBlock>

          <ExampleBlock label="Uso compuesto" fullWidth>
            <Card>
              <CardHeader>
                <Heading level={4} as="h3">Confirmar eliminación</Heading>
                <CardDescription>
                  Esta acción no se puede deshacer.
                </CardDescription>
              </CardHeader>
              <CardFooter className="justify-end">
                <Button variant="ghost">Cancelar</Button>
                <Button variant="danger">Eliminar</Button>
              </CardFooter>
            </Card>
          </ExampleBlock>
        </SectionWrapper>
      </section>

      <Separator />

      {/* ============================== CARD ================================ */}
      <section>
        <SectionHeader title="Card" description="Contenedor base con 3 variants y 5 subcomponentes." />
        <SectionWrapper>
          <ExampleBlock label="Variants" fullWidth>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <Heading level={4} as="h3">Default</Heading>
                  <CardDescription>Border simple, sin sombra.</CardDescription>
                </CardHeader>
                <CardContent>Para listas y panels.</CardContent>
              </Card>
              <Card variant="elevated">
                <CardHeader>
                  <Heading level={4} as="h3">Elevated</Heading>
                  <CardDescription>Sombra sutil, sin border.</CardDescription>
                </CardHeader>
                <CardContent>Destaca sobre otras cards.</CardContent>
              </Card>
              <Card variant="interactive" tabIndex={0}>
                <CardHeader>
                  <Heading level={4} as="h3">Interactive</Heading>
                  <CardDescription>Hover muestra sombra. Cursor pointer.</CardDescription>
                </CardHeader>
                <CardContent>Para listas clickeables.</CardContent>
              </Card>
            </div>
          </ExampleBlock>

          <ExampleBlock label="Uso compuesto — card con header, content, footer y badge" fullWidth>
            <Card>
              <CardHeader>
                <Cluster justify="between">
                  <Stack gap="xs">
                    <Heading level={4} as="h3">Documento DPI-2024-0142</Heading>
                    <CardDescription>Cargado el 12 de mayo, 14:32</CardDescription>
                  </Stack>
                  <Badge variant="success">Procesado</Badge>
                </Cluster>
              </CardHeader>
              <CardContent>
                <p className="text-body">
                  La extracción identificó 8 campos con confianza promedio del 94%.
                </p>
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="ghost" size="sm">Ver detalle</Button>
                <Button size="sm">Validar</Button>
              </CardFooter>
            </Card>
          </ExampleBlock>
        </SectionWrapper>
      </section>

      <Separator />

      {/* ============================== INPUT =============================== */}
      <section>
        <SectionHeader title="Input" description="Campo de texto single-line con sizes, states e icons." />
        <SectionWrapper>
          <ExampleBlock label="Sizes" fullWidth>
            <Stack gap="sm" className="max-w-md">
              <Input inputSize="sm" placeholder="Small (sm)" />
              <Input inputSize="md" placeholder="Medium (md) — default" />
              <Input inputSize="lg" placeholder="Large (lg)" />
            </Stack>
          </ExampleBlock>

          <ExampleBlock label="States" fullWidth>
            <Stack gap="sm" className="max-w-md">
              <Input placeholder="Default" />
              <Input disabled defaultValue="Disabled — no editable" />
              <Input hasError defaultValue="invalid@" />
              <p className="text-caption text-fg-tertiary">
                Hover y focus son runtime. El error reemplaza el border y el outline.
              </p>
            </Stack>
          </ExampleBlock>

          <ExampleBlock label="Con icons" fullWidth>
            <Stack gap="sm" className="max-w-md">
              <Input leftIcon={<SearchIcon />} placeholder="Buscar..." />
              <Input rightIcon={<UserIcon />} placeholder="Con rightIcon" />
            </Stack>
          </ExampleBlock>

          <ExampleBlock label="Uso compuesto — form field con label + helper" fullWidth>
            <Stack gap="xs" className="max-w-md">
              <Label htmlFor="ex-email" required>Email</Label>
              <Input id="ex-email" type="email" placeholder="nombre@empresa.com" />
              <span className="text-caption text-fg-tertiary">
                Lo usaremos para enviarte la confirmación.
              </span>
            </Stack>
          </ExampleBlock>
        </SectionWrapper>
      </section>

      <Separator />

      {/* ============================== TEXTAREA ============================ */}
      <section>
        <SectionHeader title="Textarea" description="Texto multilínea. Mismo naming `textareaSize` para consistencia." />
        <SectionWrapper>
          <ExampleBlock label="Sizes" fullWidth>
            <Stack gap="sm" className="max-w-md">
              <Textarea textareaSize="sm" placeholder="Small (sm)" rows={2} />
              <Textarea textareaSize="md" placeholder="Medium (md) — default" rows={2} />
              <Textarea textareaSize="lg" placeholder="Large (lg)" rows={2} />
            </Stack>
          </ExampleBlock>

          <ExampleBlock label="States" fullWidth>
            <Stack gap="sm" className="max-w-md">
              <Textarea placeholder="Default" rows={2} />
              <Textarea disabled defaultValue="Disabled — no editable" rows={2} />
              <Textarea hasError defaultValue="Texto demasiado corto." rows={2} />
            </Stack>
          </ExampleBlock>

          <ExampleBlock label="Uso compuesto — comentario de revisión" fullWidth>
            <Stack gap="xs" className="max-w-md">
              <Label htmlFor="ex-comment">Comentario interno</Label>
              <Textarea
                id="ex-comment"
                rows={3}
                placeholder="Anotaciones para el siguiente revisor..."
              />
              <Cluster justify="end">
                <Button size="sm">Guardar comentario</Button>
              </Cluster>
            </Stack>
          </ExampleBlock>
        </SectionWrapper>
      </section>

      <Separator />

      {/* ============================== SELECT ============================== */}
      <section>
        <SectionHeader title="Select" description="Select nativo con chevron custom." />
        <SectionWrapper>
          <ExampleBlock label="Sizes" fullWidth>
            <Stack gap="sm" className="max-w-md">
              <Select selectSize="sm" defaultValue="">
                <option value="" disabled>Small</option>
                <option value="a">Opción A</option>
              </Select>
              <Select selectSize="md" defaultValue="">
                <option value="" disabled>Medium — default</option>
                <option value="a">Opción A</option>
              </Select>
              <Select selectSize="lg" defaultValue="">
                <option value="" disabled>Large</option>
                <option value="a">Opción A</option>
              </Select>
            </Stack>
          </ExampleBlock>

          <ExampleBlock label="States" fullWidth>
            <Stack gap="sm" className="max-w-md">
              <Select defaultValue="a">
                <option value="a">Default</option>
              </Select>
              <Select disabled defaultValue="a">
                <option value="a">Disabled</option>
              </Select>
              <Select hasError defaultValue="">
                <option value="" disabled>Error — elegí una opción</option>
                <option value="a">Opción A</option>
              </Select>
            </Stack>
          </ExampleBlock>

          <ExampleBlock label="Con leftIcon" fullWidth>
            <Stack gap="sm" className="max-w-md">
              <Select leftIcon={<UserIcon />} defaultValue="">
                <option value="" disabled>Asignar a...</option>
                <option value="ana">Ana Pérez</option>
                <option value="luis">Luis Gómez</option>
              </Select>
            </Stack>
          </ExampleBlock>

          <ExampleBlock label="Uso compuesto — filter row" fullWidth>
            <Cluster gap="sm" wrap>
              <Stack gap="xs">
                <Label htmlFor="ex-status">Estado</Label>
                <Select id="ex-status" defaultValue="all">
                  <option value="all">Todos</option>
                  <option value="pending">Pendientes</option>
                  <option value="completed">Completados</option>
                </Select>
              </Stack>
              <Stack gap="xs">
                <Label htmlFor="ex-type">Tipo</Label>
                <Select id="ex-type" defaultValue="all">
                  <option value="all">Todos</option>
                  <option value="dpi">DPI</option>
                  <option value="invoice">Factura</option>
                </Select>
              </Stack>
            </Cluster>
          </ExampleBlock>
        </SectionWrapper>
      </section>

      <Separator />

      {/* ============================== LABEL =============================== */}
      <section>
        <SectionHeader title="Label" description="Asocia inputs via htmlFor. Soporta marcador de campo requerido." />
        <SectionWrapper>
          <ExampleBlock label="Variants">
            <Label>Label simple</Label>
            <Label required>Label requerido</Label>
          </ExampleBlock>

          <ExampleBlock label="Uso compuesto — par label + input" fullWidth>
            <Stack gap="xs" className="max-w-md">
              <Label htmlFor="ex-name" required>Nombre completo</Label>
              <Input id="ex-name" placeholder="Como aparece en el documento" />
            </Stack>
          </ExampleBlock>
        </SectionWrapper>
      </section>

      <Separator />

      {/* ============================== BADGE =============================== */}
      <section>
        <SectionHeader title="Badge" description="6 variants semánticas × 2 sizes." />
        <SectionWrapper>
          <ExampleBlock label="Variants">
            <Badge>Default</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="success">Completado</Badge>
            <Badge variant="warning">Confianza baja</Badge>
            <Badge variant="danger">Error</Badge>
            <Badge variant="accent">Nuevo</Badge>
          </ExampleBlock>

          <ExampleBlock label="Sizes">
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
          </ExampleBlock>

          <ExampleBlock label="Uso compuesto — fila de tabla" fullWidth>
            <div className="rounded-md border border-border-subtle">
              <div className="flex items-center justify-between p-3 border-b border-border-subtle">
                <Stack gap="xs">
                  <span className="text-body">DPI-2024-0142</span>
                  <span className="text-caption text-fg-tertiary">Procesado hace 2 minutos</span>
                </Stack>
                <Badge variant="success">Validado</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border-b border-border-subtle">
                <Stack gap="xs">
                  <span className="text-body">DPI-2024-0143</span>
                  <span className="text-caption text-fg-tertiary">Confianza 62%</span>
                </Stack>
                <Badge variant="warning">Revisar</Badge>
              </div>
              <div className="flex items-center justify-between p-3">
                <Stack gap="xs">
                  <span className="text-body">DPI-2024-0144</span>
                  <span className="text-caption text-fg-tertiary">OCR falló</span>
                </Stack>
                <Badge variant="danger">Error</Badge>
              </div>
            </div>
          </ExampleBlock>
        </SectionWrapper>
      </section>

      <Separator />

      {/* ============================== SEPARATOR =========================== */}
      <section>
        <SectionHeader title="Separator" description="Divider horizontal o vertical, opcional con label." />
        <SectionWrapper>
          <ExampleBlock label="Horizontal" fullWidth>
            <Stack gap="md" className="w-full">
              <p className="text-body">Bloque de arriba</p>
              <Separator />
              <p className="text-body">Bloque de abajo</p>
            </Stack>
          </ExampleBlock>

          <ExampleBlock label="Horizontal con label" fullWidth>
            <div className="w-full">
              <Separator label="Otra sección" />
            </div>
          </ExampleBlock>

          <ExampleBlock label="Vertical" fullWidth>
            <Cluster gap="md" align="center" className="h-12">
              <span className="text-body">Izquierda</span>
              <Separator orientation="vertical" />
              <span className="text-body">Centro</span>
              <Separator orientation="vertical" />
              <span className="text-body">Derecha</span>
            </Cluster>
          </ExampleBlock>
        </SectionWrapper>
      </section>

      <Separator />

      {/* ============================== SKELETON ============================ */}
      <section>
        <SectionHeader title="Skeleton" description="Placeholder de loading. Respeta prefers-reduced-motion." />
        <SectionWrapper>
          <ExampleBlock label="Tamaños" fullWidth>
            <Stack gap="sm" className="max-w-md">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </Stack>
          </ExampleBlock>

          <ExampleBlock label="Uso compuesto — card en loading" fullWidth>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-4 w-2/3 mt-1" />
              </CardHeader>
              <CardContent>
                <Stack gap="sm">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-4/6" />
                </Stack>
              </CardContent>
            </Card>
          </ExampleBlock>
        </SectionWrapper>
      </section>

      <Separator label="Layout primitives" />

      {/* ============================== HEADING ============================= */}
      <section>
        <SectionHeader title="Heading" description="Niveles 1-4 con override de tag via prop `as`." />
        <SectionWrapper>
          <ExampleBlock label="Niveles" fullWidth>
            <Stack gap="sm">
              <Heading level={1}>Heading nivel 1 — text-h1</Heading>
              <Heading level={2}>Heading nivel 2 — text-h2</Heading>
              <Heading level={3}>Heading nivel 3 — text-h3</Heading>
              <Heading level={4}>Heading nivel 4 — text-h4</Heading>
            </Stack>
          </ExampleBlock>

          <ExampleBlock label="Override de tag" fullWidth>
            <Heading level={2} as="div">
              Visualmente h2, semánticamente div (caso: hero sin estructura de heading real)
            </Heading>
          </ExampleBlock>

          <ExampleBlock label="Uso compuesto — jerarquía de página" fullWidth>
            <Stack gap="md">
              <Heading level={1}>Documentos pendientes</Heading>
              <Stack gap="sm">
                <Heading level={2}>DPI-2024-0142</Heading>
                <Heading level={3}>Datos extraídos</Heading>
                <p className="text-body text-fg-secondary">8 campos detectados con confianza promedio del 94%.</p>
              </Stack>
            </Stack>
          </ExampleBlock>
        </SectionWrapper>
      </section>

      <Separator />

      {/* ====================== PageHeader / SectionHeader ================== */}
      <section>
        <SectionHeader title="PageHeader & SectionHeader" description="Composición de encabezados con actions y breadcrumb." />
        <SectionWrapper>
          <ExampleBlock label="PageHeader completo" fullWidth>
            <PageHeader
              title="Personas"
              description="Gestión de empleados, candidatos y contactos."
              breadcrumb={
                <span className="text-overline text-overline-uppercase text-fg-tertiary">
                  Inicio · Personas
                </span>
              }
              actions={
                <>
                  <Button variant="secondary" leftIcon={<SearchIcon />}>Buscar</Button>
                  <Button leftIcon={<PlusIcon />}>Agregar persona</Button>
                </>
              }
            />
          </ExampleBlock>

          <ExampleBlock label="SectionHeader con action" fullWidth>
            <SectionHeader
              title="Documentos recientes"
              description="Últimos 30 días."
              action={<Button variant="ghost" size="sm">Ver todos</Button>}
            />
          </ExampleBlock>
        </SectionWrapper>
      </section>

      <Separator />

      <Separator label="Data display" />

      {/* ============================== STAT CARD =========================== */}
      <section>
        <SectionHeader title="StatCard" description="Métrica grande con label, valor, delta opcional e icon." />
        <SectionWrapper>
          <ExampleBlock label="Variants y deltas" fullWidth>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Documentos procesados" value="2,134" delta={12} deltaLabel="vs mes anterior" />
              <StatCard label="Tasa de error" value="1.4%" delta={-3} deltaLabel="vs mes anterior" />
              <StatCard label="Confianza promedio" value="94.2%" />
            </div>
          </ExampleBlock>

          <ExampleBlock label="Variant accent + icon" fullWidth>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard
                variant="accent"
                label="Pendientes de validación"
                value="42"
                delta={8}
                deltaLabel="vs ayer"
                icon={<SearchIcon />}
              />
              <StatCard
                label="Personas activas"
                value="128"
                icon={<UserIcon />}
              />
            </div>
          </ExampleBlock>
        </SectionWrapper>
      </section>

      <Separator />

      {/* ============================== CHART CONTAINER ===================== */}
      <section>
        <SectionHeader title="ChartContainer" description="Shell para gráficas Recharts. Inyectá tu chart como children." />
        <SectionWrapper>
          <ExampleBlock label="Line chart con paleta chart-1..3, tooltip y legend custom" fullWidth>
            <ChartContainer
              title="Documentos por mes"
              description="Procesados, pendientes y errores en los últimos 6 meses."
              actions={<Button variant="ghost" size="sm">Exportar</Button>}
              footer={<span className="text-caption text-fg-tertiary">Datos actualizados hace 5 minutos</span>}
            >
              <DocumentsLineChart />
            </ChartContainer>
          </ExampleBlock>
        </SectionWrapper>
      </section>

      <Separator />

      {/* ============================== DATA TABLE ========================== */}
      <section>
        <SectionHeader title="DataTable" description="Tabla presentacional. Sin sorting/filtering en esta fase." />
        <SectionWrapper>
          <ExampleBlock label="Tabla básica con render custom y alignment" fullWidth>
            <DataTableExample />
          </ExampleBlock>
        </SectionWrapper>
      </section>

      <Separator />

      {/* ============================== EMPTY STATE ========================= */}
      <section>
        <SectionHeader title="EmptyState" description="Mensaje cuando no hay datos." />
        <SectionWrapper>
          <ExampleBlock label="Con icon, descripción y action" fullWidth>
            <Card>
              <CardContent>
                <EmptyState
                  icon={
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="4" y="3" width="13" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                      <rect x="7" y="6" width="13" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M11 11h6M11 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  }
                  title="Sin documentos"
                  description="Cuando subas un documento o lo escanees aparecerá acá."
                  action={<Button leftIcon={<PlusIcon />}>Subir documento</Button>}
                />
              </CardContent>
            </Card>
          </ExampleBlock>
        </SectionWrapper>
      </section>

      <Separator label="Layout primitives" />

      {/* ============================== STACK & CLUSTER ===================== */}
      <section>
        <SectionHeader title="Stack & Cluster" description="Composición vertical (Stack) y horizontal (Cluster)." />
        <SectionWrapper>
          <ExampleBlock label="Stack — gaps" fullWidth>
            <Card>
              <CardContent>
                <Stack gap="lg">
                  <p className="text-overline text-overline-uppercase text-fg-tertiary">gap=&quot;lg&quot;</p>
                  <Stack gap="sm">
                    <div className="bg-surface-sunken h-6 rounded" />
                    <div className="bg-surface-sunken h-6 rounded" />
                    <div className="bg-surface-sunken h-6 rounded" />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </ExampleBlock>

          <ExampleBlock label="Cluster — justify y align" fullWidth>
            <Card>
              <CardContent>
                <Stack gap="md">
                  <p className="text-overline text-overline-uppercase text-fg-tertiary">
                    justify=&quot;between&quot; align=&quot;center&quot;
                  </p>
                  <Cluster justify="between" align="center">
                    <Badge variant="info">Pendiente</Badge>
                    <Cluster gap="xs">
                      <Button size="sm" variant="ghost">Editar</Button>
                      <Button size="sm">Aprobar</Button>
                    </Cluster>
                  </Cluster>
                </Stack>
              </CardContent>
            </Card>
          </ExampleBlock>
        </SectionWrapper>
      </section>
    </Stack>
  );
}
