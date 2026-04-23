/**
 * @file server.js
 * @description Punto de entrada del servidor backend.
 * Inicia el servicio Express en el puerto configurado.
 */
import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});