import type { IdentityData } from '../../types';
import { ProfileSection } from './ProfileSection';
import { ProfileField } from './ProfileField';

interface IdentityPanelProps {
  data: IdentityData | null;
}

export function IdentityPanel({ data }: IdentityPanelProps) {
  return (
    <ProfileSection
      title="Datos de identidad"
      description="Información extraída del DPI o pasaporte."
      source={data?._source ?? null}
      empty={!data}
    >
      {data && (
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
          <ProfileField label="CUI" value={data.cui} />
          <ProfileField label="Primer nombre" value={data.primer_nombre} />
          <ProfileField label="Otros nombres" value={data.otros_nombres} />
          <ProfileField label="Primer apellido" value={data.primer_apellido} />
          <ProfileField label="Segundo apellido" value={data.segundo_apellido} />
          <ProfileField label="Fecha de nacimiento" value={data.fecha_nacimiento} />
          <ProfileField label="Vencimiento del DPI" value={data.fecha_vencimiento} />
          <ProfileField label="Género" value={data.genero} />
          <ProfileField label="Estado civil" value={data.estado_civil} />
          <ProfileField label="Municipio" value={data.municipio_vecindad} />
          <ProfileField label="Departamento" value={data.departamento_vecindad} />
        </dl>
      )}
    </ProfileSection>
  );
}
