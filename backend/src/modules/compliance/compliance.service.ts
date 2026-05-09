import { Injectable } from '@nestjs/common';
import { PersonsService } from '../persons/persons.service';
import { runComplianceValidations, ValidationResult, ValidatorInput } from './compliance.validator';

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
      identity: profile.identity
        ? { cui: profile.identity.cui, fecha_vencimiento: profile.identity.fecha_vencimiento }
        : null,
      fiscal: profile.fiscal
        ? { estado_contribuyente: profile.fiscal.estado_contribuyente, cui_dpi: profile.fiscal.cui_dpi }
        : null,
      background: profile.background
        ? {
            fecha_emision: profile.background.fecha_emision,
            cui_dpi: profile.background.cui_dpi,
            tiene_antecedentes: profile.background.tiene_antecedentes,
          }
        : null,
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
