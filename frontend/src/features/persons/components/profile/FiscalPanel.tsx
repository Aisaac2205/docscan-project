import type { FiscalData } from '../../types';
import { ProfileSection } from './ProfileSection';
import { ProfileField } from './ProfileField';

interface FiscalPanelProps {
  data: FiscalData | null;
}

export function FiscalPanel({ data }: FiscalPanelProps) {
  return (
    <ProfileSection
      title="Registro Tributario Unificado (RTU)"
      description="Información extraída de la Constancia RTU emitida por la SAT."
      source={data?._source ?? null}
      empty={!data}
    >
      {data && (
        <div className="space-y-6">
          {/* Identificación */}
          <SubSection title="Identificación">
            <ProfileField label="NIT" value={data.nit} />
            <ProfileField label="Nombre completo" value={data.nombre_completo} />
            <ProfileField label="CUI" value={data.cui} />
            <ProfileField label="Fecha de nacimiento" value={data.fecha_nacimiento} />
            <ProfileField label="Vencimiento del CUI" value={data.fecha_vencimiento_cui} />
            <ProfileField label="Sexo" value={data.sexo} />
            <ProfileField label="Nacionalidad" value={data.nacionalidad} />
            <ProfileField label="Estado civil" value={data.estado_civil} />
          </SubSection>

          {/* Actividad económica */}
          <SubSection title="Actividad económica">
            <ProfileField label="Código" value={data.actividad_economica_codigo} />
            <ProfileField label="Descripción" value={data.actividad_economica_descripcion} />
            <ProfileField label="Clasificación" value={data.actividad_economica_clasificacion} />
            <ProfileField label="Sector económico" value={data.sector_economico} />
            <ProfileField label="Cámara empresarial" value={data.participa_camara_empresarial} />
            <ProfileField label="Gremial" value={data.participa_gremial} />
          </SubSection>

          {/* Establecimiento */}
          <SubSection title="Establecimiento">
            <ProfileField label="Nombre comercial" value={data.establecimiento_nombre} />
            <ProfileField label="Actividad" value={data.establecimiento_actividad} />
            <ProfileField label="Inicio de operaciones" value={data.establecimiento_fecha_inicio} />
            <ProfileField label="Estado" value={data.establecimiento_estado} />
            <ProfileField label="Clasificación" value={data.establecimiento_clasificacion} />
            <ProfileField label="Tipo" value={data.establecimiento_tipo} />
          </SubSection>

          {/* Afiliación IVA */}
          <SubSection title="Afiliación IVA">
            <ProfileField label="Tipo de contribuyente" value={data.tipo_contribuyente} />
            <ProfileField label="Régimen" value={data.regimen_fiscal} />
            <ProfileField label="Periodo impositivo" value={data.periodo_impositivo} />
            <ProfileField label="Forma de cálculo" value={data.forma_calculo_iva} />
            <ProfileField label="Estatus" value={data.estatus_iva} />
            <ProfileField label="Vigente desde" value={data.iva_fecha_desde} />
          </SubSection>

          {/* Características especiales + vigencia */}
          <SubSection title="Estatus y vigencia">
            <ProfileField label="Emisor de factura electrónica" value={data.es_emisor_fel} />
            <ProfileField label="FEL desde" value={data.fel_fecha_desde} />
            <ProfileField label="Última actualización" value={data.fecha_ultima_actualizacion} />
            <ProfileField label="Vigente hasta" value={data.vigente_hasta} />
          </SubSection>

        </div>
      )}
    </ProfileSection>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-overline text-overline-uppercase text-fg-secondary mb-2">
        {title}
      </h4>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">{children}</dl>
    </div>
  );
}
