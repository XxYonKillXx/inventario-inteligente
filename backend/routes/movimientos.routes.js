const router = require('express').Router();
const ctrl   = require('../controllers/movimientos.controller');
const { verificarToken, requerirPermiso } = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/',  requerirPermiso('inventario.historial'), ctrl.listar);
router.post('/', requerirPermiso('inventario.salida'),    ctrl.registrar);

module.exports = router;
