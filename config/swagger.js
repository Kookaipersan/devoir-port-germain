// config/swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

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
        url: 'http://localhost:3000', // Change si ton app tourne ailleurs
      },
    ],
  },
  apis: ['./routes/*.js'], // <- On va documenter dans les routes
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
