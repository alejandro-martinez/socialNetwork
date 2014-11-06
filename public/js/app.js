/* Router App ---------------------------- */
var AppRouter = Backbone.Router.extend({
    routes: {
        "fbid/:fbid"             : "index",
        "albums/:fbid"           : "albums",
        "albums/:albumid/photos" : "albumPhotos",
        "updateAlbum/:albumid"   : "updateAlbum",
        "photos/:fbid"           : "photos",
        "photos/upload"          : "uploadPhoto",
        "friendPhotos/:id"       : "friendPhotos",
        "posts/:fbid"            : "posts",
        "post/:postid"           : "post",
        "friends/:fbid"          : "friends",
        "friend/:id"             : "friendProfile",
        "friendAdd/:id"          : "friendAdd",
        "groupsList"             : "groupsList",
        "groupFeed/:id"          : "groupFeed",
    },
    initialize: function (appC) {
        this.api = appC.ac;                                     //Objeto AppController 
        this.data = appC.ac.dataDefault;                        //Info de usuario logueado
        this.loggedUser = appC.ac.loggedUser;
        This = this;

        // instancio y actualizo por primera vez las colecciones criticas
        actualizarListas = function(){ 
            This.api.get.home(function(response){           // voy a actualizar
                Colls.home.add(response.data);              // constantemente
            });                                             // solo el home
            This.api.get.notifications(function(response){  // y las notificaciones
                Colls.notifications.add(response.data);     // que es la unica
            });                                             // informacion critica
        }
        // intervalo de actualizacion de modelos
        /*
        setInterval(actualizarListas(), 300000); // 300000 ms = 5 minutos
        */
    },
    index: function(){
        var This = this;
        if (this.loggedUser) {
                this.mainView = new Views.Main({api: this.api, model: this.data});                  //Menu lateral
                this.api.newsFeed(function(response){
                    if(window.location.hash.split('/')[0] == "#fbid") {
                        this.newsFeed = new Views.NewsFeed({model: response, api: This.api});
                        this.newPostView = new Views.NewPost({api: This.api});                  //Que estas pensando
                        this.searchView = new Views.Search();                                       //Buscador
                    }
                });
        }
        else {
            new Views.NotLoggedInView();                        //Muestra logo de Facebook +
        }
        new Views.Header({model: this.data,api: this.api});                 //Barra superior con los datos del usuario
        selectMenu('nav-user')
    },
    albumPhotos: function(id){
        var This = this;
        this.api.getAlbumPhotos(id,9,function(response){
           this.albumsPhotoView = new Views.albumPhotos({model: response, api: This.api});
        });   
        selectMenu('nav-albums')
    },
    albums: function(id){
        var This = this;
        this.api.getAlbums(id,function(response){
           this.albumsView = new Views.Albums({model: response, api: This.api, friendId: id});
        });   
        selectMenu('nav-albums')
    },
    updateAlbum: function(id){
        var This = this;
        this.api.getAlbumPhotos(id,9,function(response){
           this.UpdateAlbumView = new Views.UpdateAlbum({model: response,albumId: id, api: This.api});
        });   
        selectMenu('nav-albums')
    },
    friends: function(){
        var This = this;
        this.api.getFriends(function(response){
            this.friendsView = new Views.Friends({api: This.api,model: response}); 
        });
        selectMenu('nav-friends')
    },
    friendProfile: function(id){
        var This = this;
        this.api.getFriend(id,function(friendInfo){
            This.api.isFriend(id, function(response){
                (response.data.length > 0) ? This.esAmigo = true : This.esAmigo = false;
            });
            This.api.getFriendsWall(friendInfo.id,function(friendWall){
                This.friendView = new Views.friendProfile({wall: friendWall, friendInfo: friendInfo, amigo: This.esAmigo, api: This.api}); 
            });
        });
        selectMenu('nav-friends')
    },
    friendAdd: function(id){
        this.api.addFriend(id);
    },
    posts: function(){
        var This = this;
        this.api.updateWall(function(response){
            This.wallView = new Views.Wall({model: response, api: This.api});    
            This.newPostView = new Views.NewPost({api: This.api});                                             //Que estas pensando
        });
        selectMenu('nav-posts')
    },
    photos: function(){
        var This = this;
        this.api.getPhotos(function(response){
            this.photos = new Views.Photos({model: response,api: This.api});
        });
        selectMenu('nav-photos')
    },
    friendPhotos: function(id){
        var This = this;
        this.api.getFriendPhotos(id,function(response){
            this.friendPhotos = new Views.friendPhotos({model: response,api: This.api});
        });
        selectMenu('nav-photos')
    },
    groupsList: function(){
        this.api.getUserGroups(function(response){
            this.groupsView = new Views.Groups({model: response});
        });
        selectMenu('nav-groups')
    },
    groupFeed: function(id){
        var This = this;
        this.api.getGroupFeed(id,function(response){
            This.groupFeedView = new Views.GroupFeed({model: response, group_id:id, api: This.api});
            This.newGroupPostView = new Views.NewPost({api: This.api});
        });
        selectMenu('nav-groups')
    },
});

var selectMenu = function(op){
    $('.nav-button').removeClass("active");
    $('#' + op).addClass("active");
}