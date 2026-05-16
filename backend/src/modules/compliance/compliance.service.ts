import { Injectable } from '@nestjs/common';
import { PersonsService } from '../persons/persons.service';
import { runComplianceValidations, ValidationResult, ValidatorInput } from './compliance.validator';
import type { BackgroundData } from '../persons/profile.aggregator';

export interface ComplianceFile {
  personId: string;
  personName: string;
  validations: ValidationResult[];
  summary: {
    pass: number;
    warning: number;
    fail: number;
  };
}

@Injectable()
export class ComplianceService {
  constructor(private readonly personsService: PersonsService) {}

  async getCompliance(personId: string, userId: string): Promise<ComplianceFile> {
    const { person, profile } = await this.personsService.getProfile(userId, personId);

    const input: ValidatorInput = {
      cv: profile.cv ? { present: true } : null,
      identity: profile.identity
        ? { cui: profile.identity.cui, fecha_vencimiento: profile.identity.fecha_vencimiento }
        : null,
      fiscal: profile.fiscal
        ? {
            estatus_iva: profile.fiscal.estatus_iva,
            establecimiento_estado: profile.fiscal.establecimiento_estado,
            cui: profile.fiscal.cui,
          }
        : null,
      background: {
        penal: toClaim(profile.background.penal),
        policial: toClaim(profile.background.policial),
      },
    };

    const validations = runComplianceValidations(input);
    const summary = validations.reduce(
      (acc, v) => ({ ...acc, [v.status]: acc[v.status] + 1 }),
      { pass: 0, warning: 0, fail: 0 } as { pass: number; warning: number; fail: number },
    );

    return {
      personId: person.id,
      personName: person.fullName,
      validations,
      summary,
    };
  }
}

function toClaim(bg: BackgroundData | null) {
  if (!bg) return null;
  return {
    cui_dpi: bg.cui_dpi,
    fecha_emision: bg.fecha_emision,
    tiene_antecedentes: bg.tiene_antecedentes,
  };
}
