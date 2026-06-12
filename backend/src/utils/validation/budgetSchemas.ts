import Joi from 'joi';

export const createBudgetSchema = Joi.object({
  category_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Category ID must be a valid UUID'
    }),

  budget_amount: Joi.number()
    .positive()
    .precision(2)
    .max(999999999.99)
    .required()
    .messages({
      'number.positive': 'Budget amount must be greater than 0',
      'number.max': 'Budget amount cannot exceed 999,999,999.99'
    }),

  period: Joi.string()
    .valid('weekly', 'monthly', 'yearly')
    .required()
    .messages({
      'any.only': 'Period must be weekly, monthly, or yearly'
    }),

  start_date: Joi.date()
    .iso()
    .required()
    .messages({
      'date.format': 'Start date must be in ISO format (YYYY-MM-DD)'
    }),

  end_date: Joi.date()
    .iso()
    .min(Joi.ref('start_date'))
    .optional()
    .messages({
      'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
      'date.min': 'End date must be after start date'
    })
});

export const updateBudgetSchema = Joi.object({
  category_id: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.guid': 'Category ID must be a valid UUID'
    }),

  budget_amount: Joi.number()
    .positive()
    .precision(2)
    .max(999999999.99)
    .optional()
    .messages({
      'number.positive': 'Budget amount must be greater than 0',
      'number.max': 'Budget amount cannot exceed 999,999,999.99'
    }),

  period: Joi.string()
    .valid('weekly', 'monthly', 'yearly')
    .optional()
    .messages({
      'any.only': 'Period must be weekly, monthly, or yearly'
    }),

  start_date: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'Start date must be in ISO format (YYYY-MM-DD)'
    }),

  end_date: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'End date must be in ISO format (YYYY-MM-DD)'
    }),

  is_active: Joi.boolean()
    .optional()
});

export const budgetQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional(),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .optional(),

  category_id: Joi.string()
    .uuid()
    .optional(),

  period: Joi.string()
    .valid('weekly', 'monthly', 'yearly')
    .optional(),

  is_active: Joi.boolean()
    .optional(),

  start_date: Joi.date()
    .iso()
    .optional(),

  end_date: Joi.date()
    .iso()
    .min(Joi.ref('start_date'))
    .optional()
    .messages({
      'date.min': 'End date must be after start date'
    }),

  include_category: Joi.boolean()
    .default(false)
    .optional(),

  include_progress: Joi.boolean()
    .default(false)
    .optional(),

  overspent_only: Joi.boolean()
    .default(false)
    .optional(),

  sort: Joi.string()
    .valid('start_date', 'budget_amount', 'progress_percentage', 'created_at')
    .default('start_date')
    .optional(),

  order: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .optional()
});

export const bulkBudgetSchema = Joi.object({
  action: Joi.string()
    .valid('create', 'update', 'delete')
    .required(),

  budgets: Joi.array()
    .items(
      Joi.when('...action', {
        is: 'create',
        then: createBudgetSchema,
        otherwise: Joi.when('...action', {
          is: 'update',
          then: updateBudgetSchema.keys({
            id: Joi.string().uuid().required()
          }),
          otherwise: Joi.object({
            id: Joi.string().uuid().required()
          })
        })
      })
    )
    .min(1)
    .max(20)
    .required()
    .messages({
      'array.min': 'At least one budget is required',
      'array.max': 'Cannot process more than 20 budgets at once'
    })
});
