/** Respuesta paginada estándar. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function paginate<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): Paginated<T> {
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}
