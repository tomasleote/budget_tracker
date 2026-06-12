/**
 * Pure helper: maps camelCase frontend filter params to the snake_case query
 * params expected by the transaction API endpoint.
 */

/**
 * @param {Object} params
 * @returns {Object} API-ready query params (undefined values stripped)
 */
export function buildTransactionQueryParams(params) {
  const {
    page,
    limit,
    type,
    categoryId,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    search,
    sort = 'date',
    order = 'desc',
    includeCategory = true,
  } = params;

  const queryParams = {
    page,
    limit,
    type,
    category_id: categoryId,
    start_date: startDate,
    end_date: endDate,
    min_amount: minAmount,
    max_amount: maxAmount,
    search,
    sort,
    order,
    include_category: includeCategory,
  };

  Object.keys(queryParams).forEach(key => {
    if (queryParams[key] === undefined) delete queryParams[key];
  });

  return queryParams;
}
