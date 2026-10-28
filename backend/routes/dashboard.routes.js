const router = require('express').Router();
const ctrl   = require('../controllers/dashboard.controller');
const { verificarToken, requerirPermiso } = require('../middlewares/auth.middleware');

router.get('/stats', verificarToken, requerirPermiso('dashboard.ver'), ctrl.obtenerStats);

module.exports = router;
