/* Router App ---------------------------- */
var AppRouter = Backbone.Router.extend({
    routes: {
		""						 : "index",
		"fbid/:fbid"			 : "index",
		"albums/:fbid"			 : "albums",
		"albums/:albumid/photos" : "albumPhotos",
		"photos/:fbid"			 : "photos",
        "photos/upload"          : "uploadPhoto",
		"posts/:fbid"			 : "posts",
		"post/:postid"			 : "post",
		"friends/:fbid"			 : "friends"
		
    },
    initialize: function (appC) {
    	this.api = appC.ac;    									//Objeto AppController 
    	this.data = appC.ac.dataDefault;						//Info de usuario logueado
    	this.loggedUser = appC.ac.loggedUser;					
    },
    index: function(){
    	if (this.loggedUser) {
            if (!this.newPostView){
    			this.mainView = new Views.Main({api: this.api, model: this.data});					//Menu lateral
    			this.newPostView = new Views.NewPost();								                //Nuevo post
            }
		}
		else {
			new Views.NotLoggedInView();						//Muestra logo de Facebook +
		}   
		new Views.Header({model: this.data});					//Barra superior con los datos del usuario
    },
    albums: function(){
        this.api.getAlbums(function(response){
    	   this.albumsView = new Views.Albums({model: response});
        });   
    },
    friends: function(){
        this.api.getFriends(function(response){
            this.friendsView = new Views.Friends({model: response}); 
        });
    },
    photos: function(){
        this.api.getPhotos(function(response){
            this.photos = new Views.Photos({model: response});
        });
    },
});