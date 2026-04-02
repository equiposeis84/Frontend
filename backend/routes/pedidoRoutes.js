const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

router.get('/', pedidoController.getAll);
router.get('/:id', pedidoController.getOne);
router.post('/checkout', pedidoController.checkout); // [NEW] Procesa carrito y genera pedido
router.post('/', pedidoController.store); // Crea pedido de forma manual
router.put('/:id', pedidoController.update);
router.delete('/:id', pedidoController.destroy);

module.exports = router;
