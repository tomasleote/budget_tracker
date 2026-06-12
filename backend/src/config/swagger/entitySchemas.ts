export const entitySchemas = {
  Category: {
    type: 'object',
    required: ['name', 'type', 'color', 'icon'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier'
      },
      name: {
        type: 'string',
        maxLength: 50,
        description: 'Category name'
      },
      type: {
        type: 'string',
        enum: ['income', 'expense'],
        description: 'Category type'
      },
      color: {
        type: 'string',
        pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
        description: 'Hex color code'
      },
      icon: {
        type: 'string',
        description: 'FontAwesome icon class'
      },
      description: {
        type: 'string',
        description: 'Category description'
      },
      is_default: {
        type: 'boolean',
        description: 'Whether this is a default category'
      },
      is_active: {
        type: 'boolean',
        description: 'Whether this category is active'
      },
      parent_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Parent category ID for hierarchy'
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: 'Last update timestamp'
      }
    }
  },
  Transaction: {
    type: 'object',
    required: ['type', 'amount', 'description', 'category_id', 'date'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        description: 'Unique identifier'
      },
      type: {
        type: 'string',
        enum: ['income', 'expense'],
        description: 'Transaction type'
      },
      amount: {
        type: 'number',
        minimum: 0.01,
        maximum: 999999999.99,
        description: 'Transaction amount'
      },
      description: {
        type: 'string',
        maxLength: 200,
        description: 'Transaction description'
      },
      category_id: {
        type: 'string',
        format: 'uuid',
        description: 'Category ID'
      },
      date: {
        type: 'string',
        format: 'date',
        description: 'Transaction date'
      },
      created_at: {
        type: 'string',
        format: 'date-time',
        description: 'Creation timestamp'
      },
      updated_at: {
        type: 'string',
        format: 'date-time',
        description: 'Last update timestamp'
      }
    }
  },
  CreateCategoryRequest: {
    type: 'object',
    required: ['name', 'type', 'color', 'icon'],
    properties: {
      name: {
        type: 'string',
        maxLength: 50,
        description: 'Category name'
      },
      type: {
        type: 'string',
        enum: ['income', 'expense'],
        description: 'Category type'
      },
      color: {
        type: 'string',
        pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
        description: 'Hex color code'
      },
      icon: {
        type: 'string',
        description: 'FontAwesome icon class'
      },
      description: {
        type: 'string',
        description: 'Category description'
      },
      parent_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Parent category ID for hierarchy'
      }
    }
  },
  CreateTransactionRequest: {
    type: 'object',
    required: ['type', 'amount', 'description', 'category_id', 'date'],
    properties: {
      type: {
        type: 'string',
        enum: ['income', 'expense'],
        description: 'Transaction type'
      },
      amount: {
        type: 'number',
        minimum: 0.01,
        maximum: 999999999.99,
        description: 'Transaction amount'
      },
      description: {
        type: 'string',
        maxLength: 200,
        description: 'Transaction description'
      },
      category_id: {
        type: 'string',
        format: 'uuid',
        description: 'Category ID'
      },
      date: {
        type: 'string',
        format: 'date',
        description: 'Transaction date (YYYY-MM-DD)'
      }
    }
  },
  UpdateCategoryRequest: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        maxLength: 50,
        description: 'Category name'
      },
      type: {
        type: 'string',
        enum: ['income', 'expense'],
        description: 'Category type'
      },
      color: {
        type: 'string',
        pattern: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
        description: 'Hex color code'
      },
      icon: {
        type: 'string',
        description: 'FontAwesome icon class'
      },
      description: {
        type: 'string',
        description: 'Category description'
      },
      is_active: {
        type: 'boolean',
        description: 'Whether this category is active'
      },
      parent_id: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description: 'Parent category ID for hierarchy'
      }
    }
  },
  UpdateTransactionRequest: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['income', 'expense'],
        description: 'Transaction type'
      },
      amount: {
        type: 'number',
        minimum: 0.01,
        maximum: 999999999.99,
        description: 'Transaction amount'
      },
      description: {
        type: 'string',
        maxLength: 200,
        description: 'Transaction description'
      },
      category_id: {
        type: 'string',
        format: 'uuid',
        description: 'Category ID'
      },
      date: {
        type: 'string',
        format: 'date',
        description: 'Transaction date (YYYY-MM-DD)'
      }
    }
  }
};
