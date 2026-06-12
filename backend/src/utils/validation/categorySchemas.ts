import Joi from 'joi';

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
