import type { BackgroundData } from '../../types';
import { ProfileSection } from './ProfileSection';
import { ProfileField } from './ProfileField';

interface BackgroundPanelProps {
  data: BackgroundData | null;
}

export function BackgroundPanel({ data }: BackgroundPanelProps) {
  return (
    <ProfileSection
      title="Antecedentes"
      description="Información extraída de antecedentes penales o policiacos."
      source={data?._source ?? null}
      empty={!data}
    >
      {data && (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <ProfileField label="Nombre completo" value={data.nombre_completo} />
          <ProfileField label="CUI / DPI" value={data.cui_dpi} />
          <ProfileField label="¿Tiene antecedentes?" value={data.tiene_antecedentes} />
          <ProfileField label="Delito indicado" value={data.delito_indicado} />
          <ProfileField label="Fecha de emisión" value={data.fecha_emision} />
          <ProfileField label="Boleta / Recibo" value={data.numero_boleta_o_recibo} />
          <ProfileField label="Código de validación" value={data.codigo_validacion} />
        </dl>
      )}
    </ProfileSection>
  );
}
