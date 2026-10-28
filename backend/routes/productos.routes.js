const router = require('express').Router();
const ctrl   = require('../controllers/productos.controller');
const { verificarToken, requerirPermiso } = require('../middlewares/auth.middleware');
const { validarCrearProducto, validarActualizarProducto } = require('../validators/productos.validator');

router.use(verificarToken);

router.get('/',     requerirPermiso('productos.ver'),      ctrl.listar);
router.get('/:id',  requerirPermiso('productos.ver'),      ctrl.obtener);
router.post('/',    requerirPermiso('productos.crear'),    validarCrearProducto,    ctrl.crear);
router.put('/:id',  requerirPermiso('productos.editar'),   validarActualizarProducto, ctrl.actualizar);
router.delete('/:id', requerirPermiso('productos.eliminar'), ctrl.eliminar);

module.exports = router;
