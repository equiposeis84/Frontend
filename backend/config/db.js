/**
 * @file db.js
 * @description Configuración de la conexión directa a MySQL mediante el driver mysql2.
 */
import mysql from 'mysql2';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',      // Tu usuario de MySQL
    password: '',      // Tu contraseña
    database: 'sistema_comercial',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Exportamos el pool con soporte para promesas (async/await)
export default pool.promise();