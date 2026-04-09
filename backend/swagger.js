const swaggerAutogen = require('swagger-autogen');

const outputFile = './swagger.json'; // archivo de salida
const endpointsFiles = ['./app.js']; // archivos de entrada

const doc = {
    info: {
        title: 'API de ejemplo',
        description: 'Esta es una API de ejemplo para demostrar Swagger'
    },
    host: 'localhost:3000',
    schemes: ['http']
};

// En CommonJS, swaggerAutogen suele exportar la función directamente
// o dentro de una propiedad. Generalmente se invoca así:
swaggerAutogen()(outputFile, endpointsFiles, doc);