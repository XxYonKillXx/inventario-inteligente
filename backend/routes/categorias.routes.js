const router = require('express').Router();
const ctrl   = require('../controllers/categorias.controller');
const { verificarToken, requerirPermiso } = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/',      requerirPermiso('categorias.ver'),      ctrl.listar);
router.get('/:id',   requerirPermiso('categorias.ver'),      ctrl.obtener);
router.post('/',     requerirPermiso('categorias.crear'),    ctrl.crear);
router.put('/:id',   requerirPermiso('categorias.editar'),   ctrl.actualizar);
router.delete('/:id',requerirPermiso('categorias.eliminar'), ctrl.eliminar);

module.exports = router;
