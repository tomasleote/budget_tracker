/**
 * Shared repository result and query option types.
 * The concrete data layer is Firestore (see repositories/firestore).
 */
export interface DatabaseResult<T> {
  data: T | null;
  error: string | null;
  count?: number;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  offset: number;
}

// Index signature is intentionally `any`: filter values span strings, numbers,
// booleans and null across all repositories, and consumers build these freely.
export interface FilterOptions {
  [key: string]: any;
}

export interface SortOptions {
  field: string;
  ascending: boolean;
}
