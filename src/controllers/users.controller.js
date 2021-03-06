const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const fs = require('fs-extra');
const cloudinary = require('../config/cloudinary');
const Usuario = require('../models/User');
const { obtenerNotificaciones } = require('./notifications.controller');
const { obtenerPedidoPorUsuario } = require('./orders.controller');

exports.mostrarInicio = (req, res) => {
	res.render('users/index', {
		titulo: 'Recibe tus compras en la puerta de tu casa | FastShopping',
	});
};

exports.crearUsuario = async (req, res) => {
	const { nombre, apellido, email, password, telefono } = req.body;
	try {
		const resultado = await Usuario.findOne({
			where: {
				[Op.or]: { email, telefono },
			},
		});
		if (resultado) {
			req.flash(
				'feedbackError',
				'Ya hay una cuenta asociada con ese email y teléfono'
			);
			return res.redirect('/registro');
		}
		const hash = await bcrypt.hash(password, 10);
		await Usuario.create({
			nombre,
			apellido,
			email,
			password: hash,
			telefono,
		});
		res.redirect('/login');
	} catch (err) {
		console.log(err);
		req.flash(
			'feedbackError',
			'Ocurrió un error al crear la cuenta, por favor intente de nuevo'
		);
		res.redirect('registro');
	}
};
exports.obtenerUsuarioPorEmail = async (req, res) => {
	const idUsuarioEmisor = req.get('idUsuarioEmisor');
	const { email } = req.params;
	try {
		const usuario = await Usuario.findOne({
			where: { email },
			attributes: { exclude: ['password'] },
		});
		if (!usuario) {
			return res.status(404).json({
				ok: false,
				mensaje: 'La cuenta no existe',
			});
		}
		if (usuario.idUsuario == idUsuarioEmisor) {
			return res.status(400).json({
				ok: false,
				mensaje: 'No puedes elegirte como receptor',
			});
		}
		if (!usuario.configuracionCompleta) {
			return res.status(400).json({
				ok: false,
				mensaje:
					'El usuario aún no puede realizar, ni recibir pedidos porque no ha completado su configuración',
			});
		}
		res.json({
			ok: true,
			usuario,
		});
	} catch (err) {
		console.log(err);
		res.json({
			ok: false,
			mensaje:
				'Ocurrió un error al realizar la búsqueda por favor intente de nuevo',
		});
	}
};

exports.actualizarUsuario = async (req, res) => {
	const {
		idUsuario,
		nombre,
		apellido,
		telefono,
		codigoPostal,
		colonia,
		calle,
		numExt,
		numInt,
		referencias,
	} = req.body;
	try {
		const usuario = await Usuario.findByPk(idUsuario);
		if (!usuario) {
			req.flash(
				'feedbackError',
				'No se pudo encontrar su informacicón. Por favor recargue la página y trate de nuevo'
			);
			return res.redirect('/usuarios/configuracion');
		}
		usuario.nombre = nombre;
		usuario.apellido = apellido;
		usuario.telefono = telefono;
		usuario.codigoPostal = codigoPostal;
		usuario.colonia = colonia;
		usuario.calle = calle;
		usuario.numExt = numExt;
		usuario.numInt = numInt;
		usuario.referencias = referencias;
		usuario.configuracionCompleta = true;
		await usuario.save();
		req.flash('feedbackExito', 'Se ha actualizado el perfil');
		res.redirect('/usuarios/configuracion');
	} catch (err) {
		console.log(err);
		req.flash(
			'feedbackError',
			'Ocurrió un error. Por favor intente más tarde'
		);
		res.redirect('/usuarios/configuracion');
	}
};

exports.actualizarAvatar = async (req, res) => {
	const { idUsuario } = req.body;
	try {
		const imagenSubida = await cloudinary.v2.uploader.upload(req.file.path);
		const usuario = await Usuario.findByPk(idUsuario);
		usuario.urlAvatar = imagenSubida.secure_url;
		await usuario.save();
		await fs.unlink(req.file.path);
		res.json({
			ok: true,
			mensaje: 'Se ha actualizado la imagen de perfil',
			urlImagen: imagenSubida.secure_url,
		});
	} catch (err) {
		console.log(err);
		res.json({
			ok: false,
			error: err,
		});
	}
};

exports.mostrarNotificaciones = async (req, res) => {
	try {
		const notificaciones = await obtenerNotificaciones(req.user.idUsuario);
		res.render('users/notifications', {
			titulo: 'Notificaciones',
			notificaciones,
		});
	} catch (err) {
		console.log(err);
		res.render('users/notifications', {
			title: 'Notificaciones',
			notificacionError:
				'Hubo un Problema al obtener sus notificaciones por favor recargue la página',
		});
	}
};

exports.mostrarHistorial = async (req, res) => {
	try {
		const pedidos = await obtenerPedidoPorUsuario(req.user.idUsuario);
		return res.render('users/history', {
			titulo: 'Historial de pedidos',
			pedidos,
		});
	} catch (err) {
		return res.render('users/history', {
			titulo: 'Historial de pedidos',
			errorHistorial:
				'No pudimos obtener su historial. Por favor intente más tarde',
		});
	}
};

exports.mostrarConfiguracion = (req, res) => {
	res.render('users/settings', {
		titulo: 'Perfil: Usuarios de Fastshopping',
	});
};
