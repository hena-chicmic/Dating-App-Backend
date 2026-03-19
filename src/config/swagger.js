const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Dating App API',
      version: '1.0.0',
      description: 'API Documentation for the Dating App Backend',
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Local Development Server',
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication operations' },
      { name: 'Users', description: 'User profile and media operations' },
      { name: 'Discovery', description: 'Profile discovery and recommendations' },
      { name: 'Interactions', description: 'User swipe and matching operations' },
      { name: 'Matches', description: 'User match operations' },
      { name: 'Notifications', description: 'User notification operations' },
      { name: 'Messages', description: 'User messaging operations' },
      { name: 'Reports', description: 'User reporting operations' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },

  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
