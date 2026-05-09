import type { FiscalData } from '../../types';
import { ProfileSection } from './ProfileSection';
import { ProfileField } from './ProfileField';

interface FiscalPanelProps {
  data: FiscalData | null;
}

export function FiscalPanel({ data }: FiscalPanelProps) {
  return (
    <ProfileSection
      title="Datos fiscales y sociales"
      description="Información extraída del RTU, NIT, IGSS y documentos similares."
      source={data?._source ?? null}
      empty={!data}
    >
      {data && (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <ProfileField label="NIT" value={data.nit} />
          <ProfileField label="Nombre / Razón social" value={data.nombre_razon_social} />
          <ProfileField label="Estado contribuyente" value={data.estado_contribuyente} />
          <ProfileField label="Régimen fiscal" value={data.regimen_fiscal} />
          <ProfileField label="Dirección fiscal" value={data.direccion_fiscal} />
          <ProfileField label="Número IGSS" value={data.numero_igss} />
          <ProfileField label="Número patronal" value={data.numero_patronal} />
          <ProfileField label="CUI declarado" value={data.cui_dpi} />
        </dl>
      )}
    </ProfileSection>
  );
}
