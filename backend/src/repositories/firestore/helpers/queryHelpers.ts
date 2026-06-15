/**
 * In-memory filtering, sorting and pagination for Firestore repositories.
 * Per-user subcollections are small, so we read a user's collection and apply
 * these in process - mirroring the operator semantics the API layer already
 * encodes in filter keys (gte_, lte_, ilike_, is_null_).
 */
import { FilterOptions, SortOptions, PaginationOptions } from '../../BaseRepository';

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Unknown error';
}

function compare(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

export function applyFilters<T extends { id: string }>(items: T[], filters: FilterOptions): T[] {
  return items.filter(item => {
    const rec = item as Record<string, unknown>;
    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined) continue;

      if (key.startsWith('gte_')) {
        if (compare(rec[key.slice(4)], value) < 0) return false;
      } else if (key.startsWith('lte_')) {
        if (compare(rec[key.slice(4)], value) > 0) return false;
      } else if (key.startsWith('ilike_')) {
        const field = rec[key.slice(6)];
        const search = String(value).toLowerCase().replace(/%/g, '');
        if (!String(field ?? '').toLowerCase().includes(search)) return false;
      } else if (key.startsWith('is_null_')) {
        const field = rec[key.slice(8)];
        if (field !== null && field !== undefined) return false;
      } else if (value === null) {
        if (rec[key] !== null && rec[key] !== undefined) return false;
      } else if (rec[key] !== value) {
        return false;
      }
    }
    return true;
  });
}

export function applySorting<T extends { id: string }>(items: T[], sort: SortOptions): T[] {
  const { field, ascending } = sort;
  return [...items].sort((a, b) => {
    const av = (a as Record<string, unknown>)[field];
    const bv = (b as Record<string, unknown>)[field];
    if (av === null || av === undefined) return ascending ? -1 : 1;
    if (bv === null || bv === undefined) return ascending ? 1 : -1;
    const c = compare(av, bv);
    return ascending ? c : -c;
  });
}

export function paginate<T>(items: T[], pagination?: PaginationOptions): T[] {
  if (!pagination) return items;
  return items.slice(pagination.offset, pagination.offset + pagination.limit);
}
