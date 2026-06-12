import Joi from 'joi';

export const importOptionsSchema = Joi.object({
  format: Joi.string().valid('csv', 'xlsx').optional(),
  type: Joi.string().valid('transactions', 'categories', 'budgets', 'full').default('transactions'),
  validateData: Joi.string().valid('true', 'false').default('true'),
  skipDuplicates: Joi.string().valid('true', 'false').default('false'),
  updateExisting: Joi.string().valid('true', 'false').default('false'),
  dateFormat: Joi.string().optional(),
  delimiter: Joi.string().optional(),
  encoding: Joi.string().valid('utf8', 'latin1', 'ascii').default('utf8')
});

export const exportQuerySchema = Joi.object({
  format: Joi.string().valid('csv', 'xlsx').default('xlsx'),
  type: Joi.string().valid('transactions', 'categories', 'budgets', 'full').default('full'),
  includeHeaders: Joi.string().valid('true', 'false').default('true'),
  includeMetadata: Joi.string().valid('true', 'false').default('false'),
  start_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
  category_ids: Joi.alternatives().try(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).optional(),
  transaction_types: Joi.alternatives().try(
    Joi.string().valid('income', 'expense'),
    Joi.array().items(Joi.string().valid('income', 'expense'))
  ).optional(),
  budget_periods: Joi.alternatives().try(
    Joi.string().valid('weekly', 'monthly', 'yearly'),
    Joi.array().items(Joi.string().valid('weekly', 'monthly', 'yearly'))
  ).optional(),
  fields: Joi.string().optional()
});

export const templateParamsSchema = Joi.object({
  type: Joi.string().valid('transactions', 'categories', 'budgets').required()
});

export const templateQuerySchema = Joi.object({
  format: Joi.string().valid('csv', 'xlsx').default('xlsx'),
  includeExamples: Joi.string().valid('true', 'false').default('true'),
  includeInstructions: Joi.string().valid('true', 'false').default('true')
});
