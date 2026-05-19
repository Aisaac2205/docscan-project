import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import {
  CONFIDENCE_REVIEW_THRESHOLD,
  DOCUMENT_STATUS,
} from './documents.constants';
import {
  addDays,
  dayOffsetInWindow,
  endOfDay,
  round1,
  signedDeltaPercent,
  startOfDay,
} from './aggregates/document-aggregates.util';
import type {
  DocumentsMetric,
  DocumentsStatsResponse,
} from './dto/documents-stats-query.dto';

interface ResolvedRange {
  from: Date;
  to: Date;
  previousFrom: Date;
  previousTo: Date;
  /** ventana del sparkline (siempre 7 días terminando en `to`). */
  sparklineFrom: Date;
  sparklineTo: Date;
}

interface DocSlice {
  createdAt: Date;
  status: string;
  confidence: number | null;
}

const SPARKLINE_DAYS = 7;

@Injectable()
export class DocumentsStatsService {
  constructor(private prisma: PrismaService) {}

  async getStats(
    userId: string,
    rawFrom?: string,
    rawTo?: string,
  ): Promise<DocumentsStatsResponse> {
    const range = this.resolveRange(rawFrom, rawTo);

    const [currentSlice, previousSlice, sparklineSlice] = await Promise.all([
      this.fetchSlice(userId, range.from, range.to),
      this.fetchSlice(userId, range.previousFrom, range.previousTo),
      this.fetchSlice(userId, range.sparklineFrom, range.sparklineTo),
    ]);

    const sparklines = this.buildSparklines(
      sparklineSlice,
      range.sparklineFrom,
      SPARKLINE_DAYS,
    );

    return {
      total: this.metric(
        currentSlice.length,
        previousSlice.length,
        sparklines.total,
      ),
      ocrPrecision: this.metric(
        this.avgPrecision(currentSlice),
        this.avgPrecision(previousSlice),
        sparklines.precision,
      ),
      needsReview: this.metric(
        this.countNeedsReview(currentSlice),
        this.countNeedsReview(previousSlice),
        sparklines.needsReview,
      ),
    };
  }

  // -------------------------------------------------------------------------
  // Range resolution
  // -------------------------------------------------------------------------

  private resolveRange(rawFrom?: string, rawTo?: string): ResolvedRange {
    const now = new Date();
    const to = rawTo ? endOfDay(new Date(rawTo)) : endOfDay(now);

    // Default: mes actual (primer día del mes en curso a hoy)
    const defaultFrom = startOfDay(new Date(to.getFullYear(), to.getMonth(), 1));
    const from = rawFrom ? startOfDay(new Date(rawFrom)) : defaultFrom;

    const spanMs = to.getTime() - from.getTime();
    const previousTo = new Date(from.getTime() - 1);
    const previousFrom = new Date(previousTo.getTime() - spanMs);

    // Sparkline: siempre 7 días terminando en `to` (independiente del span).
    const sparklineTo = to;
    const sparklineFrom = startOfDay(addDays(sparklineTo, -(SPARKLINE_DAYS - 1)));

    return { from, to, previousFrom, previousTo, sparklineFrom, sparklineTo };
  }

  // -------------------------------------------------------------------------
  // Aggregation
  // -------------------------------------------------------------------------

  private async fetchSlice(userId: string, from: Date, to: Date): Promise<DocSlice[]> {
    return this.prisma.document.findMany({
      where: {
        userId,
        createdAt: { gte: from, lte: to },
      },
      select: { createdAt: true, status: true, confidence: true },
    });
  }

  private avgPrecision(slice: DocSlice[]): number {
    let sum = 0;
    let count = 0;
    for (const doc of slice) {
      if (
        doc.status === DOCUMENT_STATUS.COMPLETED &&
        typeof doc.confidence === 'number'
      ) {
        sum += doc.confidence * 100;
        count += 1;
      }
    }
    return count > 0 ? round1(sum / count) : 0;
  }

  private countNeedsReview(slice: DocSlice[]): number {
    let count = 0;
    for (const doc of slice) {
      if (doc.status !== DOCUMENT_STATUS.COMPLETED) continue;
      if (doc.confidence === null || doc.confidence < CONFIDENCE_REVIEW_THRESHOLD) {
        count += 1;
      }
    }
    return count;
  }

  private buildSparklines(
    slice: DocSlice[],
    windowStart: Date,
    days: number,
  ): { total: number[]; precision: number[]; needsReview: number[] } {
    const total = new Array<number>(days).fill(0);
    const precisionSum = new Array<number>(days).fill(0);
    const precisionCount = new Array<number>(days).fill(0);
    const needsReview = new Array<number>(days).fill(0);

    for (const doc of slice) {
      const idx = dayOffsetInWindow(doc.createdAt, windowStart, days);
      if (idx < 0) continue;

      total[idx] += 1;

      if (doc.status === DOCUMENT_STATUS.COMPLETED) {
        if (typeof doc.confidence === 'number') {
          precisionSum[idx] += doc.confidence * 100;
          precisionCount[idx] += 1;
        }
        if (doc.confidence === null || doc.confidence < CONFIDENCE_REVIEW_THRESHOLD) {
          needsReview[idx] += 1;
        }
      }
    }

    const precision = precisionSum.map((sum, i) =>
      precisionCount[i] > 0 ? round1(sum / precisionCount[i]) : 0,
    );

    return { total, precision, needsReview };
  }

  private metric(value: number, previous: number, sparkline: number[]): DocumentsMetric {
    return {
      value,
      delta: signedDeltaPercent(value, previous),
      sparkline,
    };
  }
}
