/**
 * Pure helpers: request/response data shaping for the budget API.
 */

/**
 * Maps frontend budget shape to the snake_case format the API expects.
 * @param {Object} data
 * @returns {Object}
 */
export function transformBudgetRequest(data) {
  const transformed = {
    name: data.name.trim(),
    amount: parseFloat(data.amount),
    category_id: data.categoryId || data.category_id,
    period: data.period,
    start_date: data.startDate instanceof Date ? data.startDate.toISOString() : data.startDate,
    is_active: data.isActive !== undefined ? data.isActive : true,
  };

  if (data.endDate) {
    transformed.end_date = data.endDate instanceof Date ? data.endDate.toISOString() : data.endDate;
  }
  if (data.description) {
    transformed.description = data.description.trim();
  }
  if (data.alertThreshold !== undefined) {
    transformed.alert_threshold = parseInt(data.alertThreshold);
  }

  return transformed;
}

/**
 * Maps an API budget object to the camelCase frontend shape.
 * @param {Object} budget
 * @returns {Object|null}
 */
export function transformBudgetResponse(budget) {
  if (!budget) return null;

  const transformed = {
    id: budget.id,
    name: budget.name,
    amount: parseFloat(budget.amount),
    categoryId: budget.category_id,
    period: budget.period,
    startDate: budget.start_date,
    endDate: budget.end_date || null,
    isActive: budget.is_active,
    description: budget.description || '',
    alertThreshold: budget.alert_threshold || 80,
    createdAt: budget.created_at,
    updatedAt: budget.updated_at,
  };

  if (budget.progress) {
    transformed.progress = {
      spent: parseFloat(budget.progress.spent || 0),
      remaining: parseFloat(budget.progress.remaining || budget.amount),
      percentage: parseFloat(budget.progress.percentage || 0),
      isOverBudget: budget.progress.is_over_budget || false,
      daysRemaining: budget.progress.days_remaining || 0,
    };
  }

  if (budget.category) {
    transformed.category = {
      id: budget.category.id,
      name: budget.category.name,
      type: budget.category.type,
      color: budget.category.color,
      icon: budget.category.icon,
    };
  }

  return transformed;
}
