const router = require('express').Router();
const ctrl   = require('../controllers/compras.controller');
const { verificarToken, requerirPermiso } = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/',              requerirPermiso('compras.ver'),    ctrl.listar);
router.get('/:id',           requerirPermiso('compras.ver'),    ctrl.obtener);
router.post('/',             requerirPermiso('compras.crear'),  ctrl.crear);
router.patch('/:id/estado',  requerirPermiso('compras.editar'), ctrl.actualizarEstado);

module.exports = router;
