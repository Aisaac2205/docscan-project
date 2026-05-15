import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/database.config';
import {
  requiredSlotsForRole,
  SLOT_LABELS,
  SlotId,
  ALL_SLOT_IDS,
} from '../compliance/required-slots';

export interface SlotCounts {
  cv: number;
  id_card: number;
  fiscal_social: number;
  background_penal: number;
  background_policial: number;
}

export interface CompletenessSummary {
  done: number;
  total: number;
  missing: SlotId[];
}

export interface CompletenessDetail extends CompletenessSummary {
  slots: {
    id: SlotId;
    label: string;
    required: boolean;
    satisfied: boolean;
  }[];
}

/**
 * Computes done/total/missing for a single person given their role and the
 * counts of documents per slot. Pure function — no I/O. Used by both the
 * single-person endpoint and the bulk list aggregation.
 */
export function computeCompleteness(role: string, counts: SlotCounts): CompletenessSummary {
  const required = requiredSlotsForRole(role);
  const missing = required.filter((slot) => counts[slot] === 0);
  return {
    done: required.length - missing.length,
    total: required.length,
    missing,
  };
}

export function computeCompletenessDetail(role: string, counts: SlotCounts): CompletenessDetail {
  const required = new Set(requiredSlotsForRole(role));
  const summary = computeCompleteness(role, counts);
  return {
    ...summary,
    slots: ALL_SLOT_IDS.map((id) => ({
      id,
      label: SLOT_LABELS[id],
      required: required.has(id),
      satisfied: counts[id] > 0,
    })),
  };
}

const EMPTY_COUNTS: SlotCounts = {
  cv: 0,
  id_card: 0,
  fiscal_social: 0,
  background_penal: 0,
  background_policial: 0,
};

type CountsRow = {
  personId: string;
  cv: bigint | number;
  id_card: bigint | number;
  fiscal_social: bigint | number;
  background_penal: bigint | number;
  background_policial: bigint | number;
};

@Injectable()
export class PersonsCompletenessService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Bulk aggregation: a single SQL GROUP BY query that returns slot counts per
   * person. No N+1, no loop in the service.
   *
   * Scope is constrained by userId (security) and optionally by personIds
   * (to align with a paginated list response).
   */
  async getCountsForPersons(
    userId: string,
    personIds?: string[],
  ): Promise<Map<string, SlotCounts>> {
    if (personIds && personIds.length === 0) {
      return new Map();
    }

    // Note: we LEFT JOIN documents so persons with zero docs still appear in
    // the result with all-zero counts. tipo_emisor lives inside the JSON column
    // `extractedData` — we read it with the ->> operator.
    const rows = await (personIds
      ? this.prisma.$queryRaw<CountsRow[]>`
          SELECT
            p.id AS "personId",
            COUNT(d.id) FILTER (WHERE d."documentType" = 'cv') AS "cv",
            COUNT(d.id) FILTER (WHERE d."documentType" = 'id_card') AS "id_card",
            COUNT(d.id) FILTER (WHERE d."documentType" = 'fiscal_social') AS "fiscal_social",
            COUNT(d.id) FILTER (
              WHERE d."documentType" = 'background_check'
                AND d."extractedData"->>'tipo_emisor' = 'penal'
            ) AS "background_penal",
            COUNT(d.id) FILTER (
              WHERE d."documentType" = 'background_check'
                AND d."extractedData"->>'tipo_emisor' = 'policial'
            ) AS "background_policial"
          FROM "Person" p
          LEFT JOIN "Document" d ON d."personId" = p.id
          WHERE p."userId" = ${userId}
            AND p.id IN (${prismaInList(personIds)})
          GROUP BY p.id
        `
      : this.prisma.$queryRaw<CountsRow[]>`
          SELECT
            p.id AS "personId",
            COUNT(d.id) FILTER (WHERE d."documentType" = 'cv') AS "cv",
            COUNT(d.id) FILTER (WHERE d."documentType" = 'id_card') AS "id_card",
            COUNT(d.id) FILTER (WHERE d."documentType" = 'fiscal_social') AS "fiscal_social",
            COUNT(d.id) FILTER (
              WHERE d."documentType" = 'background_check'
                AND d."extractedData"->>'tipo_emisor' = 'penal'
            ) AS "background_penal",
            COUNT(d.id) FILTER (
              WHERE d."documentType" = 'background_check'
                AND d."extractedData"->>'tipo_emisor' = 'policial'
            ) AS "background_policial"
          FROM "Person" p
          LEFT JOIN "Document" d ON d."personId" = p.id
          WHERE p."userId" = ${userId}
          GROUP BY p.id
        `);

    const map = new Map<string, SlotCounts>();
    for (const row of rows) {
      map.set(row.personId, {
        cv: Number(row.cv),
        id_card: Number(row.id_card),
        fiscal_social: Number(row.fiscal_social),
        background_penal: Number(row.background_penal),
        background_policial: Number(row.background_policial),
      });
    }
    return map;
  }

  /**
   * Single-person completeness. Reuses the bulk aggregation with a 1-element
   * filter so there's no code path duplication.
   */
  async getForPerson(
    userId: string,
    personId: string,
    role: string,
  ): Promise<CompletenessDetail> {
    const counts = await this.getCountsForPersons(userId, [personId]);
    return computeCompletenessDetail(role, counts.get(personId) ?? EMPTY_COUNTS);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Builds a parameterized SQL fragment for `IN (...)` with `string` values.
 * Each id is bound as a parameter via Prisma.sql — no injection surface.
 */
function prismaInList(ids: string[]): Prisma.Sql {
  return Prisma.join(ids.map((id) => Prisma.sql`${id}`));
}
