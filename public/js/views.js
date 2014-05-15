var Views = {
	
	NotLoggedInView: Backbone.View.extend({				//Muestra + Logo central
		el: $("#content"),
		initialize: function(){
			this.render();
		},
		render: function(){
			var This = this;
			 utils.loadTemplate("inicio",function(html){
            	This.$el.append(_.template(html));  
			});
		}
	}),
	Main: Backbone.View.extend({						//Muestra el menu lateral
		el: $("#content"),
		events: {
        	'drop #user-photo' : 'dropProfilePhoto',
			'hover .speak': 'speak',
			'mouseout .speak': 'shutUp'
	    },

	    dropProfilePhoto: function(event) {				//Drag&drop foto de perfil
	    	var This = this;
	        var reader = new FileReader();
	        reader.readAsDataURL(event.originalEvent.dataTransfer.files[0]);	//Lee la foto arrastrada al perfil
	        reader.onloadend = function () {
	        	This.api.uploadPhoto(reader.result, true, function(response){	//Sube la foto a FB
	        		$('#image-preview img').attr('src',reader.result);
	        		$('#image-preview').attr('class','show');
	        		$('#image-preview a').attr('href',"https://www.facebook.com/photo.php?fbid="+response.id+"&makeprofile=1");
	        		$('#selectFbProfile').trigger("click");	        		
	        	});
	        };
	        
			return false;
	    },
		initialize: function(){
			this.api = this.options.api;
			var This = this;
			$(".inline").colorbox({inline:true,width:"50%",height:"80%",
		    onComplete: function() {
		        closeEvent = function() {
		            $('#image-preview').attr('class','hidden'); 				 //esconde vista previa
		            This.api.updateProfilePhoto(function(response){			     //Recargar foto de perfil
		            	$('#user-photo').attr('style',"background-image:url('http://graph.facebook.com/"+response+"/picture?type=normal')");	
		            })
		        }
		    },
		    onClosed: function() { closeEvent() }
			});
			this.render();
		},
		render: function(){
			var This = this;
			utils.loadTemplate("main",function(html){
				template = _.template(html);
            	This.$el.html(template(This.model));  
			});
		},
		speak: function(ev){
			speak(ev.target.attributes['data-voice'].nodeValue);
		},
		shutUp: function(){
			shutUp();
		}
	}),
	NewPost: Backbone.View.extend({						//Nuevo Post 
		el: $("body"),
		events: {
			'click button#publicarStatus': 'publishPost',
			'hover .speak': 'speak',
			'mouseout .speak': 'shutUp'
		},
		initialize: function(){
			this.api = this.options.api;
			this.render();
		},
		render: function(){
			utils.loadTemplate("newPost",function(html){
            	$("#body").prepend(_.template(html));  
			});
		},
		speak: function(ev){
			speak(ev.target.attributes['data-voice'].nodeValue);
		},
		shutUp: function(){
			shutUp();
		},
		publishPost: function(event){
			var This = this;
			if( $('#post-text').val() ) {
				this.api.newPost($('#post-text').val(), function(response){
					if (response.id){
						var ws = new AppRouter({ac: This.api})
						ws.navigate('/#fbid/me',true);
					}
				});
			}
		}
	}),
	Posts: Backbone.View.extend({
		el: $("body"),
		events: {
			'hover .speak': 'speak',
			'mouseout .speak': 'shutUp'
		},
		initialize: function(){
			this.render();
		},
		render: function(){
			var This = this;
			utils.loadTemplate("posts",function(html){
				template = _.template(html);
            	$("#body").html(template({updates:This.model.data}));  
			});
		},
		speak: function(ev){
			speak(ev.target.attributes['data-voice'].nodeValue);
		},
		shutUp: function(){
			shutUp();
		}
	}),
	NewsFeed: Backbone.View.extend({
		el: $("#wall"),
		events: {
			'hover .speak': 'speak',
			'mouseout .speak': 'shutUp'
		},
		initialize: function(){
			this.render();
		},
		render: function(){
			var This = this;
			utils.loadTemplate("newsFeed",function(html){
				template = _.template(html);
            	$("#body").html(template({news:This.model.data}));  
			});
		},
		speak: function(ev){
			speak(ev.target.attributes['data-voice'].nodeValue);
		},
		shutUp: function(){
			shutUp();
		}
	}),
	Wall: Backbone.View.extend({
		el: $("body"),
		events: {
			'hover .speak': 'speak',
			'mouseout .speak': 'shutUp'
		},
		initialize: function(){
			this.render();
		},
		render: function(){
		    var WallUpdates = Backbone.Model.extend({});
			var updatesCollection = Backbone.Collection.extend({
			    model: WallUpdates
			});
			var updates = new updatesCollection(this.model.data);
		    var This = this;
			utils.loadTemplate("wall",function(html){
				var template = _.template(html);
            	$("#body").html(template({
			        updates: updates.models
			    }));
			});
		},
		speak: function(ev){
			speak(ev.target.attributes[0].nodeValue);
		},
		shutUp: function(){
			shutUp();
		}
	}),
	//La barra superior con Nombre y boton Conectar
	Header: Backbone.View.extend({
		el: $("#header"),
		initialize: function(){
			this.render();
		},
		render: function(){
			var This = this;
			utils.loadTemplate("header",function(html){
				template = _.template(html);
            	This.$el.html(template(This.model));  
			});
		}
	}),
	//Fotos del usuario
	Photos: Backbone.View.extend({
		el: $("#body"),
		initialize: function(){
			this.render();
		},
		render: function(){
			var This = this;
			var Photos = Backbone.Model.extend({});
			var photosCollection = Backbone.Collection.extend({model: Photos});		
			var photos = new photosCollection(This.model.data);
			utils.loadTemplate("photos",function(html){
				template = _.template(html);
            	$("#body").html(template({
			        photos: photos.models
			    }));
			});
		}
	}),
		//Fotos del usuario
	friendPhotos: Backbone.View.extend({
		el: $("#body"),
		initialize: function(){
			this.render();
		},
		render: function(){
			var This = this;
			var Photos = Backbone.Model.extend({});
			var photosCollection = Backbone.Collection.extend({model: Photos});		
			var photos = new photosCollection(This.model.data);
			utils.loadTemplate("photos",function(html){
				template = _.template(html);
            	$("#body").html(template({
			        photos: photos.models
			    }));
			});
		}
	}),
	//Albums del usuario
	Albums: Backbone.View.extend({
		el: $("#albums"),
		initialize: function(){
			this.render();
			this.access_token = FB.getAuthResponse()['accessToken'];
		},
		render: function(){
			var This = this;
			var Album = Backbone.Model.extend({});
			var albumsCollection = Backbone.Collection.extend({model: Album});		
			var albums = new albumsCollection(This.model.data);
			utils.loadTemplate("albums",function(html){
				template = _.template(html);
            	$("#body").html('');
            	$("#body").html(template({
			        albums: albums.models,
			        access_token: This.access_token
			    }));
			});
		}
	}),
	//Fotos de albums
	albumPhotos: Backbone.View.extend({
		el: $("#body"),
		initialize: function(){
			this.render();
		},
		render: function(){
			var This = this;
			var Photos = Backbone.Model.extend({});
			var photosCollection = Backbone.Collection.extend({model: Photos});		
			var photos = new photosCollection(This.model.data);
			utils.loadTemplate("photos",function(html){
				template = _.template(html);
            	$("#body").html(template({
			        photos: photos.models
			    }));
			});
		}
	}),
	Friends: Backbone.View.extend({
		el: $("#friends"),
		events: {
			'hover .speak': 'speak',
			'mouseout .speak': 'shutUp',
	    },
		initialize: function(){
			this.render();
		},
		render: function(){
			var Friends = Backbone.Model.extend({});
			var friendsCollection = Backbone.Collection.extend({model: Friends});
			var friends = new friendsCollection(this.model.data);

			utils.loadTemplate("friends",function(html){
				var template = _.template(html);
            	$("#body").html(template({
			        friends: friends.models
			    }));
			});
		},
		speak: function(ev){
			speak(ev.target.attributes['data-voice'].nodeValue);
		},
		shutUp: function(){
			shutUp();
		}
	}),
	friendProfile: Backbone.View.extend({
		el: $("body"),
		events: {
			'hover .speak': 'speak',
			'mouseout .speak': 'shutUp'
		},
		initialize: function(){
			this.render();
		},
		render: function(){
			var This = this;
			var FriendWall = Backbone.Model.extend({});
			var friendUpdatesCollection = Backbone.Collection.extend({model: FriendWall});		
			var wallUpdates = new friendUpdatesCollection(This.options.wall.data);
			
			utils.loadTemplate("friendWall",function(html){
				var template = _.template(html);
				$("#body").html('');
            	$("#body").html(template({
			        friend: This.options.friendInfo,
			        wall: wallUpdates.models
			    }));
			    console.log(This.options.friendInfo)
			    console.log(wallUpdates.models)
			});
		},
		speak: function(ev){
			speak(ev.target.attributes['data-voice'].nodeValue);
		},
		shutUp: function(){
			shutUp();
		}
	}),
}
