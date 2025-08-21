import Joi from 'joi';

// Category validation schemas
export const createCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Category name is required',
      'string.max': 'Category name must be 50 characters or less'
    }),
  
  type: Joi.string()
    .valid('income', 'expense')
    .required()
    .messages({
      'any.only': 'Type must be either "income" or "expense"'
    }),
  
  color: Joi.string()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .required()
    .messages({
      'string.pattern.base': 'Color must be a valid hex color code (e.g., #FF0000)'
    }),
  
  icon: Joi.string()
    .trim()
    .min(1)
    .required()
    .messages({
      'string.empty': 'Icon is required'
    }),
  
  description: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description must be 200 characters or less'
    }),
  
  parent_id: Joi.string()
    .uuid()
    .optional()
    .allow(null)
    .messages({
      'string.guid': 'Parent ID must be a valid UUID'
    })
});

export const updateCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .optional()
    .messages({
      'string.empty': 'Category name cannot be empty',
      'string.max': 'Category name must be 50 characters or less'
    }),
  
  type: Joi.string()
    .valid('income', 'expense')
    .optional()
    .messages({
      'any.only': 'Type must be either "income" or "expense"'
    }),
  
  color: Joi.string()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .optional()
    .messages({
      'string.pattern.base': 'Color must be a valid hex color code (e.g., #FF0000)'
    }),
  
  icon: Joi.string()
    .trim()
    .min(1)
    .optional()
    .messages({
      'string.empty': 'Icon cannot be empty'
    }),
  
  description: Joi.string()
    .trim()
    .max(200)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description must be 200 characters or less'
    }),
  
  is_active: Joi.boolean()
    .optional(),
  
  parent_id: Joi.string()
    .uuid()
    .optional()
    .allow(null)
    .messages({
      'string.guid': 'Parent ID must be a valid UUID'
    })
});

export const categoryQuerySchema = Joi.object({
  type: Joi.string()
    .valid('income', 'expense')
    .optional(),
  
  is_active: Joi.boolean()
    .optional(),
  
  parent_id: Joi.alternatives()
    .try(
      Joi.string().uuid(),
      Joi.string().valid('null'),
      Joi.valid(null)
    )
    .optional(),
  
  include_children: Joi.boolean()
    .optional()
    .default(false),
  
  sort_by: Joi.string()
    .valid('name', 'type', 'created_at', 'updated_at')
    .optional(),
  
  sort_order: Joi.string()
    .valid('asc', 'desc')
    .optional()
});

export const bulkCategorySchema = Joi.object({
  action: Joi.string()
    .valid('create', 'update', 'delete')
    .required(),
  
  categories: Joi.array()
    .items(
      Joi.when('...action', {
        is: 'create',
        then: createCategorySchema,
        otherwise: Joi.when('...action', {
          is: 'update',
          then: updateCategorySchema.keys({
            id: Joi.string().uuid().required()
          }),
          otherwise: Joi.object({
            id: Joi.string().uuid().required()
          })
        })
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one category is required'
    })
});

// Transaction validation schemas
export const createTransactionSchema = Joi.object({
  type: Joi.string()
    .valid('income', 'expense')
    .required()
    .messages({
      'any.only': 'Type must be either "income" or "expense"'
    }),
  
  amount: Joi.number()
    .positive()
    .precision(2)
    .max(999999999.99)
    .required()
    .messages({
      'number.positive': 'Amount must be greater than 0',
      'number.max': 'Amount cannot exceed 999,999,999.99'
    }),
  
  description: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Description is required',
      'string.max': 'Description must be 200 characters or less'
    }),
  
  category_id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.guid': 'Category ID must be a valid UUID'
    }),
  
  date: Joi.date()
    .iso()
    .max('now')
    .required()
    .messages({
      'date.max': 'Date cannot be in the future',
      'date.format': 'Date must be in ISO format (YYYY-MM-DD)'
    })
});

export const updateTransactionSchema = Joi.object({
  type: Joi.string()
    .valid('income', 'expense')
    .optional()
    .messages({
      'any.only': 'Type must be either "income" or "expense"'
    }),
  
  amount: Joi.number()
    .positive()
    .precision(2)
    .max(999999999.99)
    .optional()
    .messages({
      'number.positive': 'Amount must be greater than 0',
      'number.max': 'Amount cannot exceed 999,999,999.99'
    }),
  
  description: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .optional()
    .messages({
      'string.empty': 'Description cannot be empty',
      'string.max': 'Description must be 200 characters or less'
    }),
  
  category_id: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.guid': 'Category ID must be a valid UUID'
    }),
  
  date: Joi.date()
    .iso()
    .max('now')
    .optional()
    .messages({
      'date.max': 'Date cannot be in the future',
      'date.format': 'Date must be in ISO format (YYYY-MM-DD)'
    })
});

export const transactionQuerySchema = Joi.object({
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
  
  type: Joi.string()
    .valid('income', 'expense')
    .optional(),
  
  category_id: Joi.string()
    .uuid()
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
  
  min_amount: Joi.number()
    .min(0)
    .precision(2)
    .optional(),
  
  max_amount: Joi.number()
    .min(Joi.ref('min_amount'))
    .precision(2)
    .optional()
    .messages({
      'number.min': 'Max amount must be greater than min amount'
    }),
  
  search: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional(),
  
  sort: Joi.string()
    .valid('date', 'amount', 'description', 'created_at')
    .default('date')
    .optional(),
  
  order: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .optional(),
  
  include_category: Joi.boolean()
    .default(false)
    .optional()
});

export const bulkTransactionSchema = Joi.object({
  action: Joi.string()
    .valid('create', 'update', 'delete')
    .required(),
  
  transactions: Joi.array()
    .items(
      Joi.when('...action', {
        is: 'create',
        then: createTransactionSchema,
        otherwise: Joi.when('...action', {
          is: 'update',
          then: updateTransactionSchema.keys({
            id: Joi.string().uuid().required()
          }),
          otherwise: Joi.object({
            id: Joi.string().uuid().required()
          })
        })
      })
    )
    .min(1)
    .max(50)
    .required()
    .messages({
      'array.min': 'At least one transaction is required',
      'array.max': 'Cannot process more than 50 transactions at once'
    })
});

// Budget validation schemas
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

// Analytics validation schemas
export const analyticsQuerySchema = Joi.object({
  period: Joi.string()
    .valid('week', 'month', 'quarter', 'year', 'custom')
    .optional(),
  
  start_date: Joi.date()
    .iso()
    .optional()
    .when('period', {
      is: 'custom',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
  
  end_date: Joi.date()
    .iso()
    .min(Joi.ref('start_date'))
    .optional()
    .when('period', {
      is: 'custom',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
  
  granularity: Joi.string()
    .valid('daily', 'weekly', 'monthly')
    .default('daily')
    .optional(),
  
  category_ids: Joi.array()
    .items(Joi.string().uuid())
    .optional(),
  
  include_predictions: Joi.boolean()
    .default(false)
    .optional(),
  
  compare_previous_period: Joi.boolean()
    .default(false)
    .optional()
});
