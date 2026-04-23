import swaggerAutogen from 'swagger-autogen';

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

swaggerAutogen()(outputFile, endpointsFiles, doc).then(() => {
    console.log("¡Éxito! Documentación generada correctamente.");
    console.log("Puedes ver la documentación de la API en: http://localhost:3000/doc");
});