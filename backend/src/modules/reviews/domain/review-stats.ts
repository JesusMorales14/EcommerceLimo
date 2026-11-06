import { MAX_RATING, MIN_RATING } from '../dto/create-review.dto';

export interface ReviewStats {
  average: number;
  total: number;
  distribution: Record<number, number>;
}

/** Calcula promedio (1 decimal) y distribución a partir del conteo por puntuación. */
export function buildReviewStats(
  counts: readonly { rating: number; count: number }[],
): ReviewStats {
  const distribution: Record<number, number> = {};
  for (let rating = MIN_RATING; rating <= MAX_RATING; rating++)
    distribution[rating] = 0;

  let total = 0;
  let sum = 0;
  for (const { rating, count } of counts) {
    distribution[rating] = count;
    total += count;
    sum += rating * count;
  }
  const average = total ? Math.round((sum / total) * 10) / 10 : 0;
  return { average, total, distribution };
}
