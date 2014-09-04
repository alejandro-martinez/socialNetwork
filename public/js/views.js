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
			'mouseover .speak': 'speak',
			'mouseout .speak': 'shutUp'
		},
		speak: function(ev){
			speak(ev.currentTarget.attributes['data-voice'].nodeValue);
		},
		shutUp: function(){
			shutUp();
		},
		dropProfilePhoto: function(event) {				//Drag&drop foto de perfil
			var This = this;
			$('#user-photo').addClass('loading');
			var reader = new FileReader();
			reader.readAsDataURL(event.originalEvent.dataTransfer.files[0]);	//Lee la foto arrastrada al perfil
			reader.onloadend = function () {
				This.api.uploadPhoto(reader.result, true, function(response){	//Sube la foto a FB
					$('#image-preview img').attr('src',reader.result);
					$('#image-preview').attr('class','show');
					$('#image-preview a').attr('href',"https://www.facebook.com/photo.php?fbid="+response.id+"&makeprofile=1");
					$('#selectFbProfile').trigger("click");					
					$('#user-photo').removeClass('loading');
				});
			};
			
			return false;
		},
		initialize: function(){
			this.api = this.options.api;
			var This = this;
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
		el: "#body",
		events: {
			'click #publicarStatus': 'publishPost'
		},
		initialize: function(){
			this.api = this.options.api;
			this.render();
		},
		render: function(){
			var This = this;
			utils.loadTemplate("newPost",function(html){
				$("#body").prepend(_.template(html));  
			});
		},
		publishPost: function(event){
			var This = this;
			if($('#post-text').val()) {
				this.api.newPost($('#destinoPost').val(),$('#post-text').val(), function(response){
					if (response.id){
						var ws = new AppRouter({ac: This.api})
						window.location.reload();
					}
				});
			}
			$('#post-text').val('');				//Reset input
		}
	}),
	NewsFeed: Backbone.View.extend({
		el: $("#content"),
		events: {
			'click a.newsFeed.nextPage' : 'nextPage',
			'click a.newsFeed.prevPage'	: 'prevPage'
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
		nextPage: function(){
			var This = this;
			$.getJSON(this.model.paging.next + '&callback=?', function(response){
				This.model = response;
				This.render();
			});
    	},
    	prevPage: function(){
    		var This = this;
			$.getJSON(this.model.paging.previous + '&callback=?', function(response){
				This.model = response;
				This.render();
			});
    	}
	}),
	Groups: Backbone.View.extend({
		el: $("#content"),
		events: {
			'click a.groups.nextPage' : 'nextPage',
			'click a.groups.prevPage'	: 'prevPage'
		},
		initialize: function(){
			this.render();
		},
		render: function(){
			var This = this;
			utils.loadTemplate("groups",function(html){
				template = _.template(html);
				$("#body").html(template({groups:This.model.data}));
			});
		},
		nextPage: function(){
			var This = this;
			$.getJSON(this.model.paging.next + '&callback=?', function(response){
				This.model = response;
				This.render();
			});
    	},
    	prevPage: function(){
    		var This = this;
			$.getJSON(this.model.paging.previous + '&callback=?', function(response){
				This.model = response;
				This.render();
			});
    	}
	}),
	GroupFeed: Backbone.View.extend({
		el: $("#content"),
		events: {
			'click a.group.nextPage' : 'nextPage',
			'click a.group.prevPage'	: 'prevPage'
		},
		initialize: function(){
			this.render();
		},
		render: function(){
			var This = this;
			console.log(This.options);
			utils.loadTemplate("groupFeed",function(html){
				template = _.template(html);
				$("#body").html(template({updates:This.model.data, destinoPost: This.options.group_id}));
			});
		},
		nextPage: function(){
			var This = this;
			$.getJSON(this.model.paging.next + '&callback=?', function(response){
				This.model = response;
				This.render();
			});
    	},
    	prevPage: function(){
    		var This = this;
			$.getJSON(this.model.paging.previous + '&callback=?', function(response){
				This.model = response;
				This.render();
			});
    	}
	}),
	Wall: Backbone.View.extend({
		el: $("body"),
		events: {
			'click a.wall.nextPage' : 'nextPage',
			'click a.wall.prevPage'	: 'prevPage'
		},
		initialize: function(){
			this.render();
		},
		render: function(){
			var This = this;
			var WallUpdates = Backbone.Model.extend({});
			var updatesCollection = Backbone.Collection.extend({model: WallUpdates});
			var updates = new updatesCollection(this.model.data);
			utils.loadTemplate("wall",function(html){
				var template = _.template(html);
				$("#body").html(template({updates: updates.models}));
			});
		},
		nextPage: function(){
			var This = this;
			$.getJSON(this.model.paging.next + '&callback=?', function(response){
				This.model = response;
				This.render();
			});
    	},
    	
    	prevPage: function(){
    		var This = this;
			$.getJSON(this.model.paging.previous + '&callback=?', function(response){
				This.model = response;
				This.render();
			});
    	}
	}),
	//La barra superior con Nombre y boton Conectar
	Header: Backbone.View.extend({
		el: $("body"),
		events: {
			'click h1.icon-notificaciones'	: 'showNotifications',
			'click a.notifications.nextPage' : 'nextPage',
			'click a.notifications.prevPage'	: 'prevPage'
		},
		initialize: function(){
			this.api = this.options.api;
	        this.render();
		},
		showNotifications: function(){
			var This = this;
			This.api.getNotifications(function(response){
				This.model = response;
				This.loadNotifications(response);
			});
		},
    	loadNotifications: function(model){
			utils.loadTemplate("notifications",function(html){
				template = _.template(html);
				$.colorbox({title:'Notificaciones',width:'70%',height:'85%',html: template({notifications: model.data})});
			});
    	},
		nextPage: function(){
			var This = this;
			$.getJSON(this.model.paging.next + '&callback=?', function(response){
				This.model = response;
				This.loadNotifications(response);
			});
    	},
    	prevPage: function(){
    		var This = this;
			$.getJSON(this.model.paging.previous + '&callback=?', function(response){
				This.model = response;
				This.loadNotifications(response);
			});
    	},
		render: function(){
			var This = this;
			utils.loadTemplate("header",function(html){
				template = _.template(html);
				$("#header").html(template(This.model));
	    	});
		}
	}),
	Search: Backbone.View.extend({
		el: $("#header"),
		initialize: function(){
			this.render();
		},
		render: function(){
			var This = this;
			utils.loadTemplate("search",function(html){
				template = _.template(html);
				$("#header").append(template);

							 $( ".typeahead" ).autocomplete({
			 	create: function() {
			        $(this).data('ui-autocomplete')._renderItem =	function( ul, item ) {
					    var image_url = "http://graph.facebook.com/" + item.value +"/picture";
					    return $( "<li>" ).append($("<img style=''>").attr('src',image_url))
					    .append( $( '<a href="/#friend/'+item.value+'">' ).text( item.label ) )
					    .appendTo( ul );
					 }
			    },
		        source: function( request, response ) {
			        $.ajax({
			          url: "https://graph.facebook.com/search?q="+request.term+"&type=user&limit=12&access_token="+FB.getAuthResponse()['accessToken']+"&callback=?",
			          dataType: "jsonp",
			          data: {
			            featureClass: "P",
			            style: "full",
			            maxRows: 12,
			          },
			           beforeSend: function(){
						  $('.typeahead').addClass('searching');     
					   },
			          success: function( data ) {
			          	$('.typeahead').removeClass('searching');
			            res = $.map( data.data, function( item ) {
			              if (item.name.toLowerCase().indexOf(request.term.toLowerCase()) >= 0){
			                return {
			                  label: item.name,
			                  value: item.id
			                }
			              }
			            });
			            response(res);
			          }
			        });
		      },
		      minLength: 3,
		      open: function() {
		        $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
		      },
		      close: function() {
		        $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
		      }
		    });
			});
		},
	}),
	//Fotos del usuario
	Photos: Backbone.View.extend({
		el: $("body"),
		events: {
			'click h2'	: 'showLikesAndComments',
			'click a.comments.nextPage' : 'nextPage',
			'click a.comments.prevPage'	: 'prevPage'
		},
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
				$("#body").html(template({photos: photos.models}));
			});
		},
		showLikesAndComments: function(ev){
			var id = ev.currentTarget.attributes['href'].nodeValue;
			$.colorbox({
				title:'Comentarios y likes',
				width:'70%',
				height:'85%',
				html: $(id).html()
			});
    	}
	}),
	//Fotos de amigos
	friendPhotos: Backbone.View.extend({
		el: $("body"),
		events: {
			'click h2'	: 'showLikesAndComments'
		},
		initialize: function(){
			this.render();
		},
		showLikesAndComments: function(ev){
			var id = ev.currentTarget.attributes['href'].nodeValue;
			$.colorbox({
				title:'Comentarios y likes',
				width:'70%',
				height:'85%',
				html: $(id).html()
			});
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
		el: $("body"),
		events: {
			'click a.albums.nextPage' : 'nextPage',
			'click a.albums.prevPage'	: 'prevPage'
		},
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
				$("#body").html(template({
					albums: albums.models,
					access_token: This.access_token
				}));
			});
		},
		nextPage: function(){
			var This = this;
			$.getJSON(this.model.paging.next + '&callback=?', function(response){
				This.model = response;
				This.render();
			});
    	},
    	prevPage: function(){
    		var This = this;
			$.getJSON(this.model.paging.previous + '&callback=?', function(response){
				This.model = response;
				This.render();
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
				$("#body").html(template({photos: photos.models}));
			});
		}
	}),
	Friends: Backbone.View.extend({
		el: $("body"),
		events: {
			'click a.friends.nextPage' : 'nextPage',
			'click a.friends.prevPage'	: 'prevPage'
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
				$("#body").html(template({friends: friends.models}));
			});
		},
		nextPage: function(){
			var This = this;
			$.getJSON(this.model.paging.next + '&callback=?', function(response){
				This.model = response;
				This.render();
			});
    	},
    	prevPage: function(){
    		var This = this;
			$.getJSON(this.model.paging.previous + '&callback=?', function(response){
				This.model = response;
				This.render();
			});
    	}
	}),
	friendProfile: Backbone.View.extend({
		el: $("body"),
		events: {
			'click a.friendWall.nextPage' : 'nextPage',
			'click a.friendWall.prevPage'	: 'prevPage'
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
				$("#body").html(template({
					friend: This.options.friendInfo,
					wall: wallUpdates.models,
					amigo: This.options.esAmigo
				}));
			});
		},
		nextPage: function(){
			var This = this;
			$.getJSON(this.options.wall.paging.next + '&callback=?', function(response){
				This.options.wall = response;
				This.render();
			});
    	},
    	prevPage: function(){
    		var This = this;
			$.getJSON(this.options.wall.paging.previous + '&callback=?', function(response){
				This.options.wall = response;
				This.render();
			});
    	}
	})

}
