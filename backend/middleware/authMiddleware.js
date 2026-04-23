/**
 * @file authMiddleware.js
 * @description Middleware para la validación de tokens JWT y protección de rutas.
 */
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'mi_clave_secreta_super_segura';

/**
 * Middleware para verificar el JWT en rutas protegidas.
 *
 * Estrategia de lectura del token (en orden de prioridad):
 *  1. httpOnly Cookie 'token'  → usado por el frontend React
 *  2. Header Authorization: Bearer <token>  → usado por Swagger UI / Postman / APIs externas
 */
export const verificarToken = (req, res, next) => {
    let token = null;

    // 1. Intentar leer desde la cookie httpOnly
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    // 2. Fallback: leer desde el header Authorization (Swagger / Postman)
    if (!token) {
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.usuario = decoded; // Disponible en las rutas protegidas
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado. Por favor, inicia sesión de nuevo.' });
        }
        return res.status(403).json({ message: 'Token inválido.' });
    }
};