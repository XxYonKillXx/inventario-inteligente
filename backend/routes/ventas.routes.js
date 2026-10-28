const router = require('express').Router();
const ctrl = require('../controllers/ventas.controller');
const { verificarToken, requerirPermiso } = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/', requerirPermiso('ventas.ver'), ctrl.listar);
router.get('/:id', requerirPermiso('ventas.ver'), ctrl.obtener);
router.post('/', requerirPermiso('ventas.crear'), ctrl.crear);
router.patch('/:id/anular', requerirPermiso('ventas.anular'), ctrl.anular);

module.exports = router;
