import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
import { entitySchemas } from './swagger/entitySchemas';
import { responseSchemas, commonResponses } from './swagger/responseSchemas';

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
        ...entitySchemas,
        ...responseSchemas
      },
      responses: commonResponses
    }
  },
  apis: ['./src/routes/*.ts', './src/routes/**/*.ts', './src/controllers/*.ts']
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
