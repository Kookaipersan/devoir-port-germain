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
    //serveur de connexion
    servers: [
      {
        url: 'http://localhost:3000', 
      },
    ],
  },
  apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
