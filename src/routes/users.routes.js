const { Router } = require('express');
const { estaAutenticado } = require('../helpers/auth');
const validacion = require('../validation/users');
const {
	crearUsuario,
	obtenerUsuarioPorEmail,
} = require('../controllers/users.controller');

const router = Router();

router.post('/', validacion.validarUsuario, crearUsuario);
router.get('/', estaAutenticado, (req, res) => {
	res.render('users/index', {
		titulo: 'Bienvenido ' + res.locals.usuario.nombre,
	});
});
// router.get('/', (req, res) => {
// 	res.render('users/index', {
// 		titulo: 'Bienvenido',
// 	});
// });
router.get('/perfil', (req, res) => {
	res.render('users/perfil', {
		titulo: 'Perfil de fhfhf',
	});
});
router.get(
	'/:email',
	estaAutenticado,
	validacion.validarEmail,
	obtenerUsuarioPorEmail
);

module.exports = router;
