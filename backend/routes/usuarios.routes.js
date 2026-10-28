const router = require('express').Router();
const ctrl   = require('../controllers/usuarios.controller');
const { verificarToken, requerirPermiso } = require('../middlewares/auth.middleware');

router.use(verificarToken);

router.get('/',                requerirPermiso('usuarios.ver'),        ctrl.listar);
router.get('/:id',             requerirPermiso('usuarios.ver'),        ctrl.obtener);
router.post('/',               requerirPermiso('usuarios.crear'),      ctrl.crear);
router.put('/:id',             requerirPermiso('usuarios.editar'),     ctrl.actualizar);
router.patch('/:id/password',  requerirPermiso('usuarios.editar'),     ctrl.cambiarPassword);

module.exports = router;
