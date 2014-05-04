var usuario = Backbone.Model.extend({
		deffaults: {
			id: null,
			nombre: 'No ha iniciado sesión',
			photo: 'img/def-user.jpg',
			logbutton: 'Conectarme'
		}
	});