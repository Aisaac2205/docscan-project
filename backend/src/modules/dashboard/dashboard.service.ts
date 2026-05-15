import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import {
  ALL_STATUS_BUCKETS,
  ALL_TYPE_BUCKETS,
  DOCUMENT_STATUS,
  DOCUMENT_TYPE_BUCKET_MAP,
  type DocumentTypeBucket,
  OCR_REVIEW_CONFIDENCE_THRESHOLD,
  type ProcessingStatusBucket,
  WEEK_DAY_LABELS_ES,
} from './dashboard.constants';

// ---------------------------------------------------------------------------
// Response shape — keep in sync with frontend `dashboardApi.ts`.
// All numeric fields are guaranteed-present; values can be 0, never null.
// ---------------------------------------------------------------------------

export interface WeeklyProcessingPoint {
  day: string;        // Spanish weekday short label: "lun", "mar", ...
  procesados: number; // documents with processedAt on this day
  validados: number;  // documents with validatedAt on this day
}

export interface DocumentTypeBucketCount {
  type: DocumentTypeBucket;
  count: number;
  percentage: number; // 0–100, rounded to 1 decimal
}

export interface ProcessingStatusBucketCount {
  status: ProcessingStatusBucket;
  count: number;
  percentage: number; // 0–100, rounded to 1 decimal
}

export interface ActivityItem {
  id: string;
  type: 'document_processed' | 'document_pending' | 'person_created' | 'evaluation_generated';
  title: string;
  detail: string;
  occurredAt: string;
  link?: string;
}

export interface DashboardStats {
  // ── Pre-existing fields (unchanged contract) ──────────────────────────────
  activePersons: number;
  unassignedDocuments: number;
  pendingHealthRecords: number;
  totalPersons: number;
  recentActivity: ActivityItem[];

  // ── Per-metric (MetricCard + sparkline) ───────────────────────────────────
  documentsProcessedToday: number;
  documentsProcessedTodayDelta: number;   // signed % vs yesterday
  documentsProcessedWeekly: number[];     // length 7, oldest → newest

  ocrPrecision: number;                   // 0–100
  ocrPrecisionDelta: number;
  ocrPrecisionWeekly: number[];

  avgProcessingTime: number;              // seconds
  avgProcessingTimeDelta: number;
  avgProcessingTimeWeekly: number[];

  pendingReview: number;
  pendingReviewDelta: number;
  pendingReviewWeekly: number[];

  // ── Charts ────────────────────────────────────────────────────────────────
  weeklyProcessing: WeeklyProcessingPoint[];        // length 7
  documentTypes: DocumentTypeBucketCount[];         // length 5 (fixed buckets)
  processingStatus: ProcessingStatusBucketCount[];  // length 4 (fixed buckets)
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

/**
 * Returns the lunes-first weekday index (0 = lun, 6 = dom) for a given date.
 * JS's getDay() is sunday-first (0 = sun, 6 = sat), so we shift.
 */
function weekdayIndexEs(d: Date): number {
  const js = d.getDay(); // 0 sun … 6 sat
  return (js + 6) % 7;   // 0 lun … 6 dom
}

/**
 * Computes signed delta % between today and yesterday.
 * - both 0    → 0
 * - prev 0    → +100 if curr > 0
 * - else      → ((curr - prev) / prev) * 100, rounded to 1 decimal
 */
function signedDeltaPercent(current: number, previous: number): number {
  if (current === previous) return 0;
  if (previous === 0) return current > 0 ? 100 : -100;
  const raw = ((current - previous) / previous) * 100;
  return Math.round(raw * 10) / 10;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// Minimal slice from Document needed for in-memory aggregation.
interface DocSlice {
  documentType: string;
  status: string;
  confidence: number | null;
  processingDurationMs: number | null;
  processedAt: Date | null;
  validatedAt: Date | null;
}

// ---------------------------------------------------------------------------

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(userId: string): Promise<DashboardStats> {
    const now = new Date();
    const todayStart = startOfDay(now);
    const yesterdayStart = addDays(todayStart, -1);
    const weekStart = addDays(todayStart, -6); // 7-day window: weekStart..todayStart+1d

    // ── Pre-existing aggregations (kept verbatim from the previous version) ──
    const [
      activePersons,
      unassignedDocuments,
      pendingHealth,
      totalPersons,
      recent,
      weekDocs,
      pendingReviewSnapshot,
      pendingReviewSnapshotYesterday,
      statusCounts,
      typeCounts,
    ] = await Promise.all([
      this.prisma.person.count({ where: { userId, status: 'active' } }),
      this.prisma.document.count({ where: { userId, personId: null } }),
      this.prisma.document
        .findMany({
          where: { userId, documentType: 'medical_cert', status: DOCUMENT_STATUS.COMPLETED },
          select: { extractedData: true },
        })
        .then((docs) =>
          docs.filter((d) => {
            const data = (d.extractedData ?? {}) as Record<string, unknown>;
            const health = (data._health ?? {}) as Record<string, unknown>;
            const s = health.status;
            return !s || s === 'pending';
          }).length,
        ),
      this.prisma.person.count({ where: { userId } }),
      this.prisma.document.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          originalName: true,
          documentType: true,
          status: true,
          createdAt: true,
          personId: true,
          person: { select: { id: true, fullName: true } },
        },
      }),

      // ── Documents processed (or validated) inside the 7-day window ───────
      this.prisma.document.findMany({
        where: {
          userId,
          OR: [
            { processedAt: { gte: weekStart } },
            { validatedAt: { gte: weekStart } },
          ],
        },
        select: {
          documentType: true,
          status: true,
          confidence: true,
          processingDurationMs: true,
          processedAt: true,
          validatedAt: true,
        },
      }) as Promise<DocSlice[]>,

      // ── pendingReview snapshot — current count of completed-but-low-confidence ─
      this.prisma.document.count({
        where: {
          userId,
          status: DOCUMENT_STATUS.COMPLETED,
          OR: [
            { confidence: { lt: OCR_REVIEW_CONFIDENCE_THRESHOLD } },
            { confidence: null },
          ],
        },
      }),

      // Same snapshot evaluated as of "end of yesterday" — best-effort delta
      // without a historical snapshots table.
      // TODO: real "delta vs yesterday" needs a daily-snapshots table or audit log.
      this.prisma.document.count({
        where: {
          userId,
          status: DOCUMENT_STATUS.COMPLETED,
          processedAt: { lt: todayStart },
          OR: [
            { confidence: { lt: OCR_REVIEW_CONFIDENCE_THRESHOLD } },
            { confidence: null },
          ],
        },
      }),

      // ── Processing status — all-time, current state per user ─────────────
      this.prisma.document.findMany({
        where: { userId },
        select: { status: true, confidence: true },
      }),

      // ── Document type chart — count over the 7-day window (matches the ───
      // weekly context of the dashboard). Empty state copy "Sin documentos
      // procesados esta semana" follows this scope.
      this.prisma.document.findMany({
        where: { userId, processedAt: { gte: weekStart } },
        select: { documentType: true },
      }),
    ]);

    // ── Per-day bucketing for the 7-day window ───────────────────────────────
    const procesadosByDay = new Array<number>(7).fill(0);
    const validadosByDay = new Array<number>(7).fill(0);
    const confidenceSumByDay = new Array<number>(7).fill(0);
    const confidenceCountByDay = new Array<number>(7).fill(0);
    const durationSumByDay = new Array<number>(7).fill(0);
    const durationCountByDay = new Array<number>(7).fill(0);
    const reviewByDay = new Array<number>(7).fill(0);

    for (const doc of weekDocs) {
      if (doc.processedAt) {
        const dayOffset = Math.floor(
          (startOfDay(doc.processedAt).getTime() - weekStart.getTime()) / 86_400_000,
        );
        if (dayOffset >= 0 && dayOffset < 7) {
          procesadosByDay[dayOffset] += 1;
          if (typeof doc.confidence === 'number') {
            confidenceSumByDay[dayOffset] += doc.confidence * 100;
            confidenceCountByDay[dayOffset] += 1;
          }
          if (typeof doc.processingDurationMs === 'number') {
            durationSumByDay[dayOffset] += doc.processingDurationMs / 1000;
            durationCountByDay[dayOffset] += 1;
          }
          const needsReview =
            doc.status === DOCUMENT_STATUS.COMPLETED &&
            (doc.confidence === null || doc.confidence < OCR_REVIEW_CONFIDENCE_THRESHOLD);
          if (needsReview) reviewByDay[dayOffset] += 1;
        }
      }
      if (doc.validatedAt) {
        const dayOffset = Math.floor(
          (startOfDay(doc.validatedAt).getTime() - weekStart.getTime()) / 86_400_000,
        );
        if (dayOffset >= 0 && dayOffset < 7) {
          validadosByDay[dayOffset] += 1;
        }
      }
    }

    // Today is dayOffset 6, yesterday is 5 in our window.
    const todayIdx = 6;
    const yesterdayIdx = 5;

    const documentsProcessedToday = procesadosByDay[todayIdx];
    const documentsProcessedYesterday = procesadosByDay[yesterdayIdx];
    const documentsProcessedTodayDelta = signedDeltaPercent(
      documentsProcessedToday,
      documentsProcessedYesterday,
    );

    const precisionToday =
      confidenceCountByDay[todayIdx] > 0
        ? round1(confidenceSumByDay[todayIdx] / confidenceCountByDay[todayIdx])
        : 0;
    const precisionYesterday =
      confidenceCountByDay[yesterdayIdx] > 0
        ? confidenceSumByDay[yesterdayIdx] / confidenceCountByDay[yesterdayIdx]
        : 0;
    const ocrPrecisionDelta = signedDeltaPercent(precisionToday, precisionYesterday);

    const avgTimeToday =
      durationCountByDay[todayIdx] > 0
        ? round1(durationSumByDay[todayIdx] / durationCountByDay[todayIdx])
        : 0;
    const avgTimeYesterday =
      durationCountByDay[yesterdayIdx] > 0
        ? durationSumByDay[yesterdayIdx] / durationCountByDay[yesterdayIdx]
        : 0;
    const avgProcessingTimeDelta = signedDeltaPercent(avgTimeToday, avgTimeYesterday);

    const pendingReviewDelta = signedDeltaPercent(
      pendingReviewSnapshot,
      pendingReviewSnapshotYesterday,
    );

    const ocrPrecisionWeekly = confidenceSumByDay.map((sum, i) =>
      confidenceCountByDay[i] > 0 ? round1(sum / confidenceCountByDay[i]) : 0,
    );
    const avgProcessingTimeWeekly = durationSumByDay.map((sum, i) =>
      durationCountByDay[i] > 0 ? round1(sum / durationCountByDay[i]) : 0,
    );

    // ── weeklyProcessing chart payload ───────────────────────────────────────
    const weeklyProcessing: WeeklyProcessingPoint[] = procesadosByDay.map((procesados, i) => {
      const dayDate = addDays(weekStart, i);
      return {
        day: WEEK_DAY_LABELS_ES[weekdayIndexEs(dayDate)],
        procesados,
        validados: validadosByDay[i],
      };
    });

    // ── documentTypes chart — fixed 5 buckets ────────────────────────────────
    const typeBucketCounts: Record<DocumentTypeBucket, number> = {
      cv: 0, dpi: 0, contrato: 0, pasaporte: 0, factura: 0,
    };
    for (const doc of typeCounts) {
      const bucket = DOCUMENT_TYPE_BUCKET_MAP[doc.documentType];
      if (bucket) typeBucketCounts[bucket] += 1;
    }
    const typeTotal = ALL_TYPE_BUCKETS.reduce((acc, t) => acc + typeBucketCounts[t], 0);
    const documentTypes: DocumentTypeBucketCount[] = ALL_TYPE_BUCKETS.map((type) => ({
      type,
      count: typeBucketCounts[type],
      percentage: typeTotal > 0 ? round1((typeBucketCounts[type] / typeTotal) * 100) : 0,
    }));

    // ── processingStatus chart — fixed 4 buckets, derived from current state ─
    const statusBucketCounts: Record<ProcessingStatusBucket, number> = {
      completado: 0, pendiente: 0, revision: 0, error: 0,
    };
    for (const doc of statusCounts) {
      if (doc.status === DOCUMENT_STATUS.PENDING) {
        statusBucketCounts.pendiente += 1;
      } else if (doc.status === DOCUMENT_STATUS.FAILED) {
        statusBucketCounts.error += 1;
      } else if (doc.status === DOCUMENT_STATUS.COMPLETED) {
        const lowConfidence =
          doc.confidence === null || doc.confidence < OCR_REVIEW_CONFIDENCE_THRESHOLD;
        if (lowConfidence) statusBucketCounts.revision += 1;
        else statusBucketCounts.completado += 1;
      }
      // Documents with statuses outside the known set are ignored on purpose;
      // surfacing an "other" bucket would muddle the chart for the user.
    }
    const statusTotal = ALL_STATUS_BUCKETS.reduce(
      (acc, s) => acc + statusBucketCounts[s],
      0,
    );
    const processingStatus: ProcessingStatusBucketCount[] = ALL_STATUS_BUCKETS.map(
      (status) => ({
        status,
        count: statusBucketCounts[status],
        percentage: statusTotal > 0
          ? round1((statusBucketCounts[status] / statusTotal) * 100)
          : 0,
      }),
    );

    return {
      activePersons,
      unassignedDocuments,
      pendingHealthRecords: pendingHealth,
      totalPersons,
      recentActivity: recent.map((doc) => this.toActivity(doc)),

      documentsProcessedToday,
      documentsProcessedTodayDelta,
      documentsProcessedWeekly: procesadosByDay,

      ocrPrecision: precisionToday,
      ocrPrecisionDelta,
      ocrPrecisionWeekly,

      avgProcessingTime: avgTimeToday,
      avgProcessingTimeDelta,
      avgProcessingTimeWeekly,

      pendingReview: pendingReviewSnapshot,
      pendingReviewDelta,
      pendingReviewWeekly: reviewByDay,

      weeklyProcessing,
      documentTypes,
      processingStatus,
    };
  }

  private toActivity(doc: {
    id: string;
    originalName: string;
    documentType: string;
    status: string;
    createdAt: Date;
    personId: string | null;
    person?: { id: string; fullName: string } | null;
  }): ActivityItem {
    const occurredAt = doc.createdAt.toISOString();
    const link = doc.person ? `/persons/${doc.person.id}` : `/documents/${doc.id}`;
    const personSuffix = doc.person ? ` · ${doc.person.fullName}` : ' · Sin asignar';

    if (doc.status === DOCUMENT_STATUS.COMPLETED) {
      return {
        id: doc.id,
        type: 'document_processed',
        title: doc.originalName,
        detail: `Documento procesado${personSuffix}`,
        occurredAt,
        link,
      };
    }
    return {
      id: doc.id,
      type: 'document_pending',
      title: doc.originalName,
      detail: `${doc.status}${personSuffix}`,
      occurredAt,
      link,
    };
  }
}
