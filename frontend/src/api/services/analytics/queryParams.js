/**
 * Pure helpers: build snake_case query param objects for analytics endpoints.
 * Each function strips undefined values before returning.
 */

function stripUndefined(obj) {
  Object.keys(obj).forEach(key => {
    if (obj[key] === undefined) delete obj[key];
  });
  return obj;
}

export function buildOverviewQueryParams({ startDate, endDate, groupBy = 'month' }) {
  return stripUndefined({ start_date: startDate, end_date: endDate, group_by: groupBy });
}

export function buildTrendsQueryParams({ startDate, endDate, interval = 'daily', categoryId }) {
  return stripUndefined({
    start_date: startDate,
    end_date: endDate,
    interval,
    category_id: categoryId,
  });
}

export function buildCategoryAnalyticsQueryParams({ startDate, endDate, limit = 10, type }) {
  return stripUndefined({ start_date: startDate, end_date: endDate, limit, type });
}

export function buildInsightsQueryParams({ startDate, endDate }) {
  return stripUndefined({ start_date: startDate, end_date: endDate });
}

export function buildBudgetPerformanceQueryParams({ startDate, endDate, categoryId }) {
  return stripUndefined({ start_date: startDate, end_date: endDate, category_id: categoryId });
}
