const router = require('express').Router();
const ctrl   = require('../controllers/reportes.controller');
const { verificarToken, requerirPermiso } = require('../middlewares/auth.middleware');

router.use(verificarToken);
router.use(requerirPermiso('reportes.ver'));

router.get('/productos',    ctrl.reporteProductos);
router.get('/existencias',  ctrl.reporteExistencias);
router.get('/movimientos',  ctrl.reporteMovimientos);
router.get('/compras',      ctrl.reporteCompras);

module.exports = router;
