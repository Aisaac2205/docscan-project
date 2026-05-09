import type { MedicalEntry } from '../../types';
import { ProfileSection } from './ProfileSection';

interface MedicalHistoryPanelProps {
  entries: MedicalEntry[];
}

const HEALTH_STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  validated: 'Validada',
  registered: 'Registrada',
  rejected: 'Rechazada',
};

function formatDate(raw: string | null): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function MedicalHistoryPanel({ entries }: MedicalHistoryPanelProps) {
  const totalDays = entries.reduce((acc, e) => acc + (e.dias_reposo ?? 0), 0);

  return (
    <ProfileSection
      title="Historial médico"
      description={
        entries.length === 0
          ? 'Constancias médicas asociadas a esta persona.'
          : `${entries.length} ${entries.length === 1 ? 'constancia' : 'constancias'} · ${totalDays} días de reposo en total`
      }
      empty={entries.length === 0}
      emptyMessage="No hay constancias médicas asociadas todavía."
    >
      <ul className="divide-y divide-stone-100">
        {entries.map((e) => (
          <li key={e.documentId} className="py-3 first:pt-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-stone-800">
                  {e.diagnostico ?? 'Diagnóstico no detectado'}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Del {formatDate(e.fecha_inicio_reposo)} al {formatDate(e.fecha_fin_reposo)}
                  {e.dias_reposo != null && ` · ${e.dias_reposo} ${e.dias_reposo === 1 ? 'día' : 'días'}`}
                </p>
                {e.nombre_medico && (
                  <p className="text-xs text-stone-400 mt-0.5">
                    {e.nombre_medico}
                    {e.numero_colegiado && ` · Col. ${e.numero_colegiado}`}
                  </p>
                )}
              </div>
              <span className="text-xs text-stone-500 flex-shrink-0">
                {HEALTH_STATUS_LABEL[e.healthStatus] ?? e.healthStatus}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </ProfileSection>
  );
}
