import { supabaseAdmin } from '../../config/database';
import { FilterOptions, PaginationOptions, SortOptions } from '../BaseRepository';
import { Transaction } from '../../types/transaction';

const CATEGORY_SELECT = `
  *,
  categories (
    id,
    name,
    type,
    color,
    icon
  )
`;

/** Build and execute the find-with-categories query applying filters in index-optimal order. */
export async function buildFindWithCategoriesQuery(
  tableName: string,
  filters: FilterOptions,
  sort: SortOptions,
  pagination?: PaginationOptions
) {
  let query = supabaseAdmin
    .from(tableName)
    .select(CATEGORY_SELECT, pagination ? { count: 'exact' } : {});

  // Equality filters first (best index usage)
  const equalityKeys = ['type', 'category_id', 'id'];
  equalityKeys.forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null) {
      query = query.eq(key, filters[key]);
    }
  });

  // Range filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key.startsWith('gte_')) {
        query = query.gte(key.replace('gte_', ''), value);
      } else if (key.startsWith('lte_')) {
        query = query.lte(key.replace('lte_', ''), value);
      } else if (key.startsWith('gt_')) {
        query = query.gt(key.replace('gt_', ''), value);
      } else if (key.startsWith('lt_')) {
        query = query.lt(key.replace('lt_', ''), value);
      }
    }
  });

  // Pattern matching last (least selective)
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && key.startsWith('ilike_')) {
      query = query.ilike(key.replace('ilike_', ''), value);
    }
  });

  query = query.order(sort.field, { ascending: sort.ascending });

  if (pagination) {
    query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);
  }

  return query;
}

/** Build and execute the advanced-filter query used by import/export. */
export async function buildFindAllWithFiltersQuery(tableName: string, filters: any) {
  let query = supabaseAdmin.from(tableName).select(CATEGORY_SELECT);

  if (filters.type) {
    if (Array.isArray(filters.type)) {
      query = query.in('type', filters.type);
    } else {
      query = query.eq('type', filters.type);
    }
  }

  if (filters.category_ids) {
    query = query.in('category_id', filters.category_ids);
  }

  if (filters.date_from && filters.date_to) {
    query = query.gte('date', filters.date_from).lte('date', filters.date_to);
  } else if (filters.date_from) {
    query = query.gte('date', filters.date_from);
  } else if (filters.date_to) {
    query = query.lte('date', filters.date_to);
  }

  if (filters.amount_min && filters.amount_max) {
    query = query.gte('amount', filters.amount_min).lte('amount', filters.amount_max);
  } else if (filters.amount_min) {
    query = query.gte('amount', filters.amount_min);
  } else if (filters.amount_max) {
    query = query.lte('amount', filters.amount_max);
  }

  if (filters.search) {
    query = query.ilike('description', `%${filters.search}%`);
  }

  return query.order('date', { ascending: false });
}

/** Build the OR-condition string for batch duplicate detection. */
export function buildDuplicateBatchOrConditions(transactions: any[]): string {
  return transactions
    .map(tx =>
      `(type.eq.${tx.type},amount.eq.${tx.amount},description.eq.${tx.description},category_id.eq.${tx.category_id},date.eq.${tx.date})`
    )
    .join(',');
}

/** Reduce raw transaction rows into a keyed duplicates map. */
export function mapToDuplicatesMap(rows: Transaction[]): { [key: string]: Transaction } {
  const result: { [key: string]: Transaction } = {};
  rows.forEach(t => {
    const key = `${t.type}:${t.amount}:${t.description}:${t.category_id}:${t.date}`;
    result[key] = t;
  });
  return result;
}

/** Aggregate raw transaction rows into summary statistics in a single pass. */
export function aggregateSummaryStatistics(rows: { type: string; amount: number }[]) {
  const stats = rows.reduce(
    (acc, t) => {
      const amount = Number(t.amount);
      acc.total_count++;
      if (t.type === 'income') {
        acc.income_count++;
        acc.income_total += amount;
      } else {
        acc.expense_count++;
        acc.expense_total += amount;
      }
      return acc;
    },
    { total_count: 0, income_count: 0, expense_count: 0, income_total: 0, expense_total: 0 }
  );

  return {
    ...stats,
    income_average: stats.income_count > 0
      ? Number((stats.income_total / stats.income_count).toFixed(2))
      : 0,
    expense_average: stats.expense_count > 0
      ? Number((stats.expense_total / stats.expense_count).toFixed(2))
      : 0,
    net_total: Number((stats.income_total - stats.expense_total).toFixed(2))
  };
}
