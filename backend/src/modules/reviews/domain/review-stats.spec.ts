import { buildReviewStats } from './review-stats';

describe('buildReviewStats', () => {
  it('devuelve ceros sin reseñas', () => {
    expect(buildReviewStats([])).toEqual({
      average: 0,
      total: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    });
  });

  it('calcula promedio redondeado y distribución', () => {
    expect(
      buildReviewStats([
        { rating: 5, count: 2 },
        { rating: 4, count: 1 },
      ]),
    ).toEqual({
      average: 4.7,
      total: 3,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 2 },
    });
  });
});
