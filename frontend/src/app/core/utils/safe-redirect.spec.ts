import { safeRedirect } from './safe-redirect';

describe('safeRedirect', () => {
  it.each([
    ['/checkout', '/checkout'],
    ['https://malicioso.com', '/'],
    ['//malicioso.com', '/'],
    ['/\\malicioso.com', '/'],
    [undefined, '/'],
  ])('safeRedirect(%s) → %s', (input, expected) => {
    expect(safeRedirect(input)).toBe(expected);
  });
});
