import mysql from 'mysql2';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',      // Tu usuario de MySQL
    password: '1234',      // Tu contraseña
    database: 'sistema_comercial',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Exportamos el pool con soporte para promesas (async/await)
export default pool.promise();