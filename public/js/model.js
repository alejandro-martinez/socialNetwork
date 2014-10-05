var usuario = Backbone.Model.extend({
		deffaults: {
			id: null,
			nombre: 'No ha iniciado sesión',
			photo: 'img/def-user.jpg',
			logbutton: 'Conectarme'
		}
	});

Collections = {
	home: Backbone.Collection.extend({}),
	feed: Backbone.Collection.extend({}),
	notifications: Backbone.Collection.extend({}),
	photos: Backbone.Collection.extend({}),
	groups: Backbone.Collection.extend({}),
	groupFeed: Backbone.Collection.extend({}),
	friends: Backbone.Collection.extend({}),
	friend: Backbone.Collection.extend({}),
	friendPosts: Backbone.Collection.extend({}),
	friendAlbum: Backbone.Collection.extend({}),
	albumPhotos: Backbone.Collection.extend({})
}

var Colls = {
	home: new Collections.home(),
	feed: new Collections.feed(),
	notifications: new Collections.notifications(),
	photos: new Collections.photos(),
	groups: new Collections.groups(),
	groupFeed: new Collections.groupFeed(),
	friends: new Collections.friends(),
	friend: new Collections.friend(),
	friendPosts: new Collections.friendPosts(),
	friendAlbum: new Collections.friendAlbum(),
	albumPhotos: new Collections.albumPhotos()
}