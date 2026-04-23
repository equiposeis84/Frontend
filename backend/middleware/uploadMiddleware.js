/**
 * @file uploadMiddleware.js
 * @description Middleware para la gestión de subida de archivos (imágenes) a Cloudinary.
 * Configura el almacenamiento en la nube y las validaciones de archivos.
 */
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// ── Configurar Cloudinary con las credenciales del .env ──────
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Definir dónde y cómo se guardan las imágenes ────────────
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder:         'rematespaisa/productos',   // Carpeta en tu cuenta Cloudinary
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Extensiones permitidas
        transformation: [
            { width: 800, height: 800, crop: 'limit' }, // Máximo 800x800px (ahorra espacio)
            { quality: 'auto' }                          // Calidad automática optimizada
        ],
    },
});

// ── Filtro de seguridad: solo imágenes ──────────────────────
const fileFilter = (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (tiposPermitidos.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (JPG, PNG, WEBP)'), false);
    }
};

// ── Instancia de Multer lista para usar en las rutas ────────
export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // Máximo 5MB por imagen
});
