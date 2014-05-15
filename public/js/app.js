/* Router App ---------------------------- */
var AppRouter = Backbone.Router.extend({
    routes: {
		"fbid/:fbid"			 : "index",
		"albums/:fbid"			 : "albums",
		"albums/:albumid/photos" : "albumPhotos",
		"photos/:fbid"			 : "photos",
        "photos/upload"          : "uploadPhoto",
        "friendPhotos/:id"       : "friendPhotos",
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
        var This = this;
    	if (this.loggedUser) {
            if (!this.newPostView){
    			this.mainView = new Views.Main({api: this.api, model: this.data});					//Menu lateral
                this.api.newsFeed(function(response){
			    	if(window.location.hash.split('/')[0] == "#fbid") {
	                    this.newsFeed = new Views.NewsFeed({model: response});
	                    this.newPostView = new Views.NewPost({api: This.api});                                             //Que estas pensando
			    	}
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
    albumPhotos: function(id){
        this.api.getAlbumPhotos(id,function(response){
           this.albumsPhotoView = new Views.albumPhotos({model: response});
        });   
    },
    friends: function(){
        var This = this;
        this.api.getFriends(function(response){
            this.friendsView = new Views.Friends({api: This.api,model: response}); 
        });
    },
    friendProfile: function(id){
        var This = this;
        this.api.getFriend(id,function(friendInfo){
            This.api.getFriendsWall(friendInfo.id,function(friendWall){
                This.friendView = new Views.friendProfile({wall: friendWall, friendInfo: friendInfo}); 
            });
        });
    },
    posts: function(){
        var This = this;
        this.api.updateWall(function(response){
            this.wallView = new Views.Wall({model: response});    
            this.newPostView = new Views.NewPost({api: This.api});                                             //Que estas pensando
        });
    },
    photos: function(){
        this.api.getPhotos(function(response){
            this.photos = new Views.Photos({model: response});
        });
    },
    friendPhotos: function(){
        this.api.getFriendPhotos(function(response){
            this.friendPhotos = new Views.friendPhotos({model: response});
        });
    },
});