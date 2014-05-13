/* Router App ---------------------------- */
var AppRouter = Backbone.Router.extend({
    routes: {
		"fbid/:fbid"			 : "index",
		"albums/:fbid"			 : "albums",
		"albums/:albumid/photos" : "albumPhotos",
		"photos/:fbid"			 : "photos",
        "photos/upload"          : "uploadPhoto",
		"posts/:fbid"			 : "posts",
		"post/:postid"			 : "post",
		"friends/:fbid"			 : "friends",
        "friend/:id"             : "friendProfile"
		
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
                this.api.newsFeed(function(response){
                    this.newsFeed = new Views.NewsFeed({model: response});
                    this.newPostView = new Views.NewPost();                                             //Que estas pensando
                });

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
    friendProfile: function(id){
        var This = this;
        this.api.getFriend(id,function(response){
            This.friendInfo = response;
        });
        this.api.getFriendsWall(id,function(response){
            this.friendView = new Views.friendProfile({wall: response, friendInfo: This.friendInfo}); 
        });
    },
    posts: function(){
        this.api.updateWall(function(response){
            this.wallView = new Views.Wall({model: response});    
            this.newPostView = new Views.NewPost();                                             //Que estas pensando
        });
    },
    photos: function(){
        this.api.getPhotos(function(response){
            this.photos = new Views.Photos({model: response});
        });
    },
});