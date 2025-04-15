// config/swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Port Germain',
      version: '1.0.0',
      description: 'Documentation de l’API des réservations de catways',
    },
    servers: [
      {
        url: serverUrl,
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;

