import Joi from 'joi';

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
