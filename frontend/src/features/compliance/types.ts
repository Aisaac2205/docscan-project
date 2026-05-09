export type ValidationStatus = 'pass' | 'warning' | 'fail';
export type ValidationSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface ValidationResult {
  id: string;
  label: string;
  status: ValidationStatus;
  message: string;
  severity: ValidationSeverity;
}

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
