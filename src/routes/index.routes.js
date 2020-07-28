const { Router } = require('express');
const { estaAutenticado } = require('../helpers/auth');
const { redirigirLogin } = require('../controllers/index.controller');

const router = Router();

router.get('/', redirigirLogin);
router.use(require('./auth.routes'));
router.use('/usuarios', require('./users.routes'));
router.use('/pedidos', estaAutenticado, require('./orders.routes'));
router.use('/admin', require('./admin.routes'));

module.exports = router;
