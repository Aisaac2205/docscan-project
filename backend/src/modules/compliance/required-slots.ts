// Required document slots per Person role.
//
// This is the SINGLE SOURCE OF TRUTH for "how many docs does a person need".
// Both the completeness service AND the validator's presence rules derive
// from this list. Do NOT duplicate this logic anywhere.

export type PersonRoleForSlots = 'candidate' | 'employee';

export const ALL_SLOT_IDS = [
  'cv',
  'id_card',
  'background_penal',
  'background_policial',
  'fiscal_social',
] as const;

export type SlotId = (typeof ALL_SLOT_IDS)[number];

export const SLOT_LABELS: Record<SlotId, string> = {
  cv: 'Currículum Vitae',
  id_card: 'Identificación (DPI o Pasaporte)',
  background_penal: 'Antecedentes Penales',
  background_policial: 'Antecedentes Policíacos',
  fiscal_social: 'RTU / NIT',
};

// Maps a slot to the validator rule id (in compliance.validator) that asserts
// its presence. Used by the completeness service to derive done/missing from
// validator output without duplicating logic.
export const SLOT_TO_PRESENCE_RULE: Record<SlotId, string> = {
  cv: 'cv_presence',
  id_card: 'dpi_presence',
  background_penal: 'background_penal_presence',
  background_policial: 'background_policial_presence',
  fiscal_social: 'rtu_presence',
};

const REQUIRED_BY_ROLE: Record<PersonRoleForSlots, SlotId[]> = {
  candidate: ['cv', 'id_card'],
  employee: ['cv', 'id_card', 'background_penal', 'background_policial', 'fiscal_social'],
};

export function requiredSlotsForRole(role: string): SlotId[] {
  // Unknown roles default to candidate (minimum requirements).
  return REQUIRED_BY_ROLE[(role as PersonRoleForSlots)] ?? REQUIRED_BY_ROLE.candidate;
}
