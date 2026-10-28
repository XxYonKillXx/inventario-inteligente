const router = require('express').Router();
const ctrl   = require('../controllers/alertas.controller');
const { verificarToken, requerirPermiso } = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/',        requerirPermiso('alertas.ver'),      ctrl.listarAlertas);
router.get('/resumen', requerirPermiso('alertas.ver'),      ctrl.resumen);
router.patch('/:id/atender', requerirPermiso('alertas.gestionar'), ctrl.atenderAlerta);

module.exports = router;
