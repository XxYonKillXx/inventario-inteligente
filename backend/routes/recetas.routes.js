const router = require('express').Router();
const ctrl = require('../controllers/recetas.controller');
const { verificarToken, requerirPermiso } = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/', requerirPermiso('recetas.ver'), ctrl.listar);
router.get('/:id', requerirPermiso('recetas.ver'), ctrl.obtener);
router.post('/', requerirPermiso('recetas.crear'), ctrl.crear);
router.put('/:id', requerirPermiso('recetas.editar'), ctrl.actualizar);
router.patch('/:id/estado', requerirPermiso('recetas.editar'), ctrl.cambiarEstado);

module.exports = router;
