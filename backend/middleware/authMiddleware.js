import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || "mi_clave_secreta_super_segura";

/**
 * Middleware para verificar el JWT en rutas protegidas.
 * Espera el header: Authorization: Bearer <token>
 */
export const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Acceso denegado. No se proporcionó un token." });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.usuario = decoded; // disponible en las rutas protegidas
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expirado. Por favor, inicia sesión de nuevo." });
        }
        return res.status(403).json({ message: "Token inválido." });
    }
};