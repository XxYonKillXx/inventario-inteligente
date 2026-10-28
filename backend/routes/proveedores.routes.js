const router = require('express').Router();
const ctrl   = require('../controllers/proveedores.controller');
const { verificarToken, requerirPermiso } = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/',      requerirPermiso('proveedores.ver'),      ctrl.listar);
router.get('/:id',   requerirPermiso('proveedores.ver'),      ctrl.obtener);
router.post('/',     requerirPermiso('proveedores.crear'),    ctrl.crear);
router.put('/:id',   requerirPermiso('proveedores.editar'),   ctrl.actualizar);
router.delete('/:id',requerirPermiso('proveedores.eliminar'), ctrl.eliminar);

module.exports = router;
