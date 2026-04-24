import express from 'express';
const router = express.Router();
import usuarioController from '../controllers/usuarioController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

// ─── Rutas PÚBLICAS (no requieren token) ─────────────────────────────────────
router.post('/login', usuarioController.login);
router.post('/logout', usuarioController.logout);   // Limpia la httpOnly cookie
router.get('/roles', usuarioController.getRoles);

router.get('/me', verificarToken, usuarioController.getMe);

// ─── Rutas PROTEGIDAS (requieren JWT válido) ──────────────────────────────────
router.get('/', verificarToken, usuarioController.getAll);
router.get('/:id', verificarToken, usuarioController.getOne);
router.post('/', verificarToken, usuarioController.store);
router.put('/:id', verificarToken, usuarioController.update);
router.delete('/:id', verificarToken, usuarioController.destroy);

export default router;