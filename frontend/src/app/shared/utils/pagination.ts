import type { Signal } from '@angular/core';
import { computed, signal } from '@angular/core';

export type PageToken = number | 'ellipsis';

/**
 * Calcula los números de página visibles alrededor de la página actual,
 * insertando elipsis cuando hay saltos. Ej.: 1 … 4 5 6 … 12
 */
export function buildPageWindow(current: number, total: number, siblings = 1): PageToken[] {
  if (total <= 1) return total === 1 ? [1] : [];
  const start = Math.max(2, current - siblings);
  const end = Math.min(total - 1, current + siblings);
  const tokens: PageToken[] = [1];
  if (start > 2) tokens.push('ellipsis');
  for (let page = start; page <= end; page++) tokens.push(page);
  if (end < total - 1) tokens.push('ellipsis');
  tokens.push(total);
  return tokens;
}

export interface ClientPagination<T> {
  readonly page: Signal<number>;
  readonly totalPages: Signal<number>;
  readonly items: Signal<T[]>;
  goTo(page: number): void;
  reset(): void;
}

/**
 * Paginación en memoria basada en signals, reutilizable por cualquier listado.
 * La página se ajusta automáticamente si la fuente se reduce.
 */
export function createClientPagination<T>(source: Signal<readonly T[]>, pageSize: number): ClientPagination<T> {
  const requested = signal(1);
  const totalPages = computed(() => Math.max(1, Math.ceil(source().length / pageSize)));
  const page = computed(() => Math.min(requested(), totalPages()));
  const items = computed(() => source().slice((page() - 1) * pageSize, page() * pageSize));

  return {
    page,
    totalPages,
    items,
    goTo: (target: number) => {
      if (target >= 1 && target <= totalPages()) requested.set(target);
    },
    reset: () => requested.set(1),
  };
}
