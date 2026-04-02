const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');

router.get('/', carritoController.getCart);
router.post('/add', carritoController.add);
router.post('/clear', carritoController.clear);
router.post('/merge', carritoController.merge);
router.put('/update/:id_carrito', carritoController.update);
router.delete('/remove/:producto_id', carritoController.remove);

module.exports = router;
