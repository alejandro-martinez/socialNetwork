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

		}
	}),
	NewPost: Backbone.View.extend({						//Nuevo Post 
		el: $("body"),
		events: {
			'click #publicarStatus': 'publishPost'
		},
		initialize: function(){
			this.api = this.options.api;
			this.render();
		},
		render: function(){
			utils.loadTemplate("newPost",function(html){
            	$("#body").html(_.template(html));  
			});
		},
		publishPost: function(event){
			this.api.newPost($('#post-text').val(), function(response){
				if (response){
					alert("post con id: " + response.id + " publicado")		//Actualizar muro con nuevo post
				}
			});

		}
	}),
	Posts: Backbone.View.extend({
		el: $("#body"),
		initialize: function(){
			this.render();
		},
		render: function(){
			var This = this;
			utils.loadTemplate("posts",function(html){
				template = _.template(html);
            	$("#body").html(template({updates:This.model.data}));  
			});
		}
	}),
	NewsFeed: Backbone.View.extend({
		el: $("#body"),
		initialize: function(){
			this.render();
		},
		render: function(){
			var This = this;
			utils.loadTemplate("newsFeed",function(html){
				template = _.template(html);
            	$("#body").append(template({news:This.model.data}));  
			});
		}
	}),
	Wall: Backbone.View.extend({
		el: $("#body"),
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
            	$("#body").append(template({
			        updates: updates.models
			    }));
			});
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
			utils.loadTemplate("photos",function(html){
				template = _.template(html);
            	$("#body").html(template(This.model.data));  
			});
		}
	}),
	//Albums del usuario
	Albums: Backbone.View.extend({
		el: $("#body"),
		initialize: function(){
			this.render();
		},
		render: function(){
			var This = this;
			var Album = Backbone.Model.extend({});
			var albumsCollection = Backbone.Collection.extend({model: Album});		
			var albums = new albumsCollection(This.options.model.data);
			utils.loadTemplate("albums",function(html){
				template = _.template(html);
            	$("#body").html('');
            	$("#body").html(template({
			        albums: albums.models
			    }));
			});
		}
	}),
	Friends: Backbone.View.extend({
		el: $("#body"),
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
		}
	}),
	friendProfile: Backbone.View.extend({
		el: $("#body"),
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
			});
		}
	}),
}
