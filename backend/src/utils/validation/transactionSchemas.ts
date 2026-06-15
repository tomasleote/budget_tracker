import Joi from 'joi';

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
    .min(1)
    .required(),

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
    .min(1)
    .optional(),

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
    .min(1)
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
