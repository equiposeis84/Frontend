import { defineConfig } from 'prisma/config';
import { PrismaMysql } from '@prisma/adapter-mysql';
import mysql from 'mysql2/promise';

// Crear pool de conexiones MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sistema_comercial',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const adapter = new PrismaMysql(pool);

export default defineConfig({
    earlyAccessFeatures: true,
    datasource: {
        adapter
    }
});
