/**
 * Pure helper: maps camelCase frontend filter params to the snake_case query
 * params expected by the budget API endpoint.
 */

/**
 * @param {Object} params
 * @returns {Object} API-ready query params (undefined values stripped)
 */
export function buildBudgetQueryParams(params) {
  const {
    page,
    limit,
    period,
    categoryId,
    isActive,
    startDate,
    endDate,
    includeProgress = true,
  } = params;

  const queryParams = {
    page,
    limit,
    period,
    category_id: categoryId,
    is_active: isActive,
    start_date: startDate,
    end_date: endDate,
    include_progress: includeProgress,
  };

  Object.keys(queryParams).forEach(key => {
    if (queryParams[key] === undefined) delete queryParams[key];
  });

  return queryParams;
}
