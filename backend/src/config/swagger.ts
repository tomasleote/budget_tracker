import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Budget Tracker API',
      version: '1.0.0',
      description: 'Personal Budget Tracker API with Supabase integration',
      contact: {
        name: 'Budget Tracker API Support',
        email: 'support@budgettracker.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
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
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the request was successful'
            },
            data: {
              description: 'Response data'
            },
            message: {
              type: 'string',
              description: 'Optional response message'
            },
            meta: {
              type: 'object',
              properties: {
                timestamp: {
                  type: 'string',
                  format: 'date-time'
                },
                pagination: {
                  type: 'object',
                  properties: {
                    page: { type: 'integer' },
                    limit: { type: 'integer' },
                    total: { type: 'integer' },
                    pages: { type: 'integer' }
                  }
                }
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'Error code'
                },
                message: {
                  type: 'string',
                  description: 'Error message'
                },
                details: {
                  description: 'Additional error details'
                }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            path: {
              type: 'string',
              description: 'Request path'
            },
            method: {
              type: 'string',
              description: 'HTTP method'
            }
          }
        }
      },
      responses: {
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        InternalError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Application): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Budget Tracker API Documentation'
  }));
};

export default specs;
