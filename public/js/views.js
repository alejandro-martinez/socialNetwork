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
			Speech.speak(ev.currentTarget.attributes['data-voice'].value);
		},
		shutUp: function(){
			Speech.shutUp();
		},
		dropProfilePhoto: function(event) {				//Drag&drop foto de perfil
			var This = this;
			$('#user-photo').addClass('loading');
			var reader = new FileReader();
			reader.readAsDataURL(event.originalEvent.dataTransfer.files[0]);	//Lee la foto arrastrada al perfil
			reader.onloadend = function () {
				This.api.uploadPhotos(reader.result, me, function(response){	//Sube la foto a FB
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
			'click #publicarStatus': 'publishPost',
			'click #adjuntarFoto': 'selectPhotos',
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
		selectPhotos: function(){
    		var This = this;
    		$("#examinar").on('change',function (e) {
			    var F = this.files;
			    if(F && F[0]) {
			    	var reader = new FileReader();
				    reader.readAsDataURL(F[0]);  
				    reader.onloadend = function () {
				    	This.attachment = reader.result;
				    }			
				}            
			});
			$("#examinar").trigger('click');
    	},
		publishPost: function(event){
			var This = this;
			($('#post-text').val()) ? mensaje = $('#post-text').val() : mensaje = "";
			if (This.attachment){
				$('#post-text').addClass('loading');
				This.api.uploadPhotos(This.attachment,'me',mensaje,function(response){
	            	$('#post-text').removeClass('loading');
					window.location.reload();
	            });
			}
			else {
				if($('#post-text').val()) {
					this.api.newPost($('#destinoPost').val(), $('#post-text').val(), function(response){
						if (response.id)
							window.location.reload();
					});
				}
			}
			$('#post-text').val('');	
		}
	}), 
	NewsFeed: Backbone.View.extend({
		el: $("#content"),
		events: {
			'click a.postInfo'			: 'showLikes',
			'click a.comments'			: 'showComments',
			'click a.newsFeed.nextPage' : 'nextPage',
			'click a.newsFeed.prevPage'	: 'prevPage',
			'click .post a.like'		: 'like',
			'click .post a.unlike'		: 'unlike'
		},
		initialize: function(){
			this.api = this.options.api;
			this.miID = this.api.currentUser.id;
			var This = this;
			this.render();
		},
		speak: function(ev){
			Speech.speak(ev.currentTarget.attributes['data-voice'].value);
		},
		shutUp: function(){
			Speech.shutUp();
		},
		refreshFeed: function(){
			var This = this;
			utils.loadTemplate("newsFeed",function(html){
				template = _.template(html);
				$("#body #wall").replaceWith(template({news:This.model.data, miID: This.miID}));
			});
		},
		render: function(){
			var This = this;
			utils.loadTemplate("newsFeed",function(html){
				template = _.template(html);
				$("#body").html(template({news:This.model.data, miID: This.miID}));
			});
		},
		nextPage: function(){
			var This = this;
			$.getJSON(this.model.paging.next + '&callback=?', function(response){
				This.model = response;
				This.refreshFeed();
			});
    	},
    	publishComment: function(ev){
    		this.api = ev.handleObj.data;
    		var id = ev.currentTarget.attributes['data-comment-id'].value;
    		var mensaje = $('#cboxLoadedContent textarea').val();
    		if (mensaje){
				utils.utf8_encode($('#mensaje').val(),function(encoded_message){
					mensaje = encoded_message;
				});
			
    		this.api.comment(id,mensaje,function(response){
    				if(response)
    					$('#div-comment .ok').removeClass('hidden');
    				else
    					$('#div-comment .error').removeClass('hidden');
    		});
    		}
    	},
    	prevPage: function(){
    		var This = this;
			$.getJSON(this.model.paging.previous + '&callback=?', function(response){
				This.model = response;
				This.refreshFeed();
			});
    	},
    	like: function(ev){
    		var This = this;
    		var id = ev.currentTarget.attributes['id'].value;
    		This.api.like(id,function(response){
    			if (response == true)
    				$(ev.currentTarget).text("Te gusta esto!");
    				$(ev.currentTarget).removeClass("like");
    				$(ev.currentTarget).addClass("unlike");
    		});
    	},
    	unlike: function(ev){
    		var This = this;
    		var id = ev.currentTarget.attributes['id'].value;
    		This.api.unlike(id,function(response){
    			if (response == true)
    				$(ev.currentTarget).text("Me gusta!");
    				$(ev.currentTarget).removeClass("unlike");
    				$(ev.currentTarget).addClass("like");
    		});
    	},
		showComments: function(ev){
			var This = this;
			var id = ev.currentTarget.attributes['name'].value;
			var popup = $("#" + id).html();
			$.colorbox({
				title:'Comentarios',
				width:'55%',
				height:'70%',
				html: popup
			});
			$('#div-comment #publicarComentario').on('click',This.api,This.publishComment);	
			$('#cboxLoadedContent #comentario').bind('input propertychange', function() {
			    $('#div-comment img').addClass('hidden');
			});				
			$('#colorbox .speak').on('mouseover', this.speak);	
			$('#colorbox .speak').on('mouseout', this.shutUp);	
    	},
		showLikes: function(ev){
			var This = this;
			var id = ev.currentTarget.attributes['name'].value;
			var popup = $("#" + id).html();
			$.colorbox({
				title:'Comentarios y likes',
				width:'40%',
				height:'60%',
				html: popup
			});
			$('#colorbox .speak').on('mouseover', this.speak);	
			$('#colorbox .speak').on('mouseout', this.shutUp);	
    	},
	}),
	Groups: Backbone.View.extend({
		el: $("#content"),
		events: {
			'click a.groups.nextPage'	: 'nextPage',
			'click a.groups.prevPage'	: 'prevPage',
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
			'click a.group.prevPage'	: 'prevPage',
			'click .post a.like'		: 'like',
			'click .post a.unlike'	: 'unlike',
			'click a.postInfo'		: 'showLikes',
			'click a.comments'		: 'showComments',
		},
		initialize: function(){
			this.api = this.options.api;
			this.miID = this.api.currentUser.id;
			var This = this;
			this.render();
		},
		speak: function(ev){
			Speech.speak(ev.currentTarget.attributes['data-voice'].value);
		},
		shutUp: function(){
			Speech.shutUp();
		},
		render: function(){
			var This = this;
			utils.loadTemplate("groupFeed",function(html){
				template = _.template(html);
				$("#body").html(template({updates:This.model.data, destinoPost: This.options.group_id, miID: This.miID}));
			});
		},
		refreshFeed: function(){
			var This = this;
			utils.loadTemplate("groupFeed",function(html){
				template = _.template(html);
				$("#body #wall").replaceWith(template({updates:This.model.data, miID: This.miID}));
			});
		},
		nextPage: function(){
			var This = this;
			$.getJSON(this.model.paging.next + '&callback=?', function(response){
				This.model = response;
				This.refreshFeed();
			});
    	},
    	prevPage: function(){
    		var This = this;
			$.getJSON(this.model.paging.previous + '&callback=?', function(response){
				This.model = response;
				This.refreshFeed();
			});
    	},
    	like: function(ev){
    		var This = this;
    		var id = ev.currentTarget.attributes['id'].value;
    		This.api.like(id,function(response){
    			if (response == true)
    				$(ev.currentTarget).text("Te gusta esto!");
    				$(ev.currentTarget).removeClass("like");
    				$(ev.currentTarget).addClass("unlike");
    		});
    	},
    	unlike: function(ev){
    		var This = this;
    		var id = ev.currentTarget.attributes['id'].value;
    		This.api.unlike(id,function(response){
    			if (response == true)
    				$(ev.currentTarget).text("Me gusta!");
    				$(ev.currentTarget).removeClass("unlike");
    				$(ev.currentTarget).addClass("like");
    		});
    	},
		showLikes: function(ev){
			var This = this;
			var id = ev.currentTarget.attributes['name'].value;
			var popup = $("#" + id).html();
			$.colorbox({
				title:'Comentarios y likes',
				width:'40%',
				height:'60%',
				html: popup
			});
			$('#colorbox .speak').on('mouseover', this.speak);	
			$('#colorbox .speak').on('mouseout', this.shutUp);	
    	},
    	showComments: function(ev){
			var This = this;
			var id = ev.currentTarget.attributes['name'].value;
			var popup = $("#" + id).html();
			$.colorbox({
				title:'Comentarios',
				width:'55%',
				height:'70%',
				html: popup
			});
			$('#div-comment #publicarComentario').on('click',This.api,This.publishComment);	
			$('#cboxLoadedContent #comentario').bind('input propertychange', function() {
			    $('#div-comment img').addClass('hidden');
			});
			$('#colorbox .speak').on('mouseover', this.speak);	
			$('#colorbox .speak').on('mouseout', this.shutUp);					
    	},
    	publishComment: function(ev){
    		this.api = ev.handleObj.data;
    		var id = ev.currentTarget.attributes['data-comment-id'].value;
    		var mensaje = $('#cboxLoadedContent textarea').val();
    		if (mensaje){
				utils.utf8_encode($('#mensaje').val(),function(encoded_message){
					mensaje = encoded_message;
				});
			

    		this.api.comment(id,mensaje,function(response){
    				if(response)
    					$('#div-comment .ok').removeClass('hidden');
    				else
    					$('#div-comment .error').removeClass('hidden');
    		});
    		}
    	},
	}),
	Wall: Backbone.View.extend({
		el: $("body"),
		events: {
			'click a.postInfo'		: 'showLikes',
			'click a.wall.nextPage' : 'nextPage',
			'click a.wall.prevPage'	: 'prevPage',
			'click .post a.like'	: 'like',
			'click .post a.unlike'	: 'unlike',
			'click a.comments'		: 'showComments',
		},
		initialize: function(){
			this.api = this.options.api;
			var This = this;
			This.miID = this.api.currentUser.id;
			this.render();
		},
		speak: function(ev){
			Speech.speak(ev.currentTarget.attributes['data-voice'].value);
		},
		shutUp: function(){
			Speech.shutUp();
		},
		render: function(){
			var This = this;
			var WallUpdates = Backbone.Model.extend({});
			var updatesCollection = Backbone.Collection.extend({model: WallUpdates});
			var updates = new updatesCollection(this.model.data);
			utils.loadTemplate("wall",function(html){
				var template = _.template(html);
				$("#body").html(template({updates: updates.models,miID: This.miID}));
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
    	},
    	like: function(ev){
    		var This = this;
    		var id = ev.currentTarget.attributes['id'].value;
    		This.api.like(id,function(response){
    			if (response == true)
    				$(ev.currentTarget).text("Te gusta esto!");
    				$(ev.currentTarget).removeClass("like");
    				$(ev.currentTarget).addClass("unlike");
    		});
    	},
    	unlike: function(ev){
    		var This = this;
    		var id = ev.currentTarget.attributes['id'].value;
    		This.api.unlike(id,function(response){
    			if (response == true)
    				$(ev.currentTarget).text("Me gusta!");
    				$(ev.currentTarget).removeClass("unlike");
    				$(ev.currentTarget).addClass("like");
    		});
    	},
		showLikes: function(ev){
			var This = this;
			var id = ev.currentTarget.attributes['name'].value;
			var popup = $("#" + id).html();
			$.colorbox({
				title:'Comentarios y likes',
				width:'40%',
				height:'60%',
				html: popup
			});
			$('#colorbox .speak').on('mouseover', this.speak);	
			$('#colorbox .speak').on('mouseout', this.shutUp);					
    	},
    	publishComment: function(ev){
    		this.api = ev.handleObj.data;
    		var id = ev.currentTarget.attributes['data-comment-id'].value;
    		var mensaje = $('#cboxLoadedContent textarea').val();
    		if (mensaje){
				utils.utf8_encode($('#mensaje').val(),function(encoded_message){
					mensaje = encoded_message;
				});
			
    		this.api.comment(id,mensaje,function(response){
    				if(response)
    					$('#div-comment .ok').removeClass('hidden');
    				else
    					$('#div-comment .error').removeClass('hidden');
    		});
    		}
    	},
		showComments: function(ev){
			var This = this;
			var id = ev.currentTarget.attributes['name'].value;
			var popup = $("#" + id).html();
			$.colorbox({
				title:'Comentarios',
				width:'55%',
				height:'70%',
				html: popup
			});
			$('#div-comment #publicarComentario').on('click',This.api,This.publishComment);	
			$('#cboxLoadedContent #comentario').bind('input propertychange', function() {
			    $('#div-comment img').addClass('hidden');
			});				
			$('#colorbox .speak').on('mouseover', this.speak);	
			$('#colorbox .speak').on('mouseout', this.shutUp);					
    	},
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
		events: {
			'click #SpeechConf': 'mute'
		},
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
		mute: function(){
			if(Speech.config.mute){
				$('#SpeechConf h1').removeClass('icon-volume-off');
				$('#SpeechConf h1').addClass('icon-volume-on');
				Speech.config.mute = false;
			} else {
				$('#SpeechConf h1').removeClass('icon-volume-on');
				$('#SpeechConf h1').addClass('icon-volume-off');
				Speech.config.mute = true;
			}
		}
	}),
	//Fotos del usuario
	Photos: Backbone.View.extend({
		el: $("body"),
		events: {
			'click h2'	: 'showLikesAndComments',
			'click a.comments.nextPage' : 'nextPage',
			'click a.comments.prevPage'	: 'prevPage',
		},
		initialize: function(){
			this.api = this.options.api;
			this.miID = this.api.currentUser.id;
			var This = this;
			this.render();
		},
		speak: function(ev){
			Speech.speak(ev.currentTarget.attributes['data-voice'].value);
		},
		shutUp: function(){
			Speech.shutUp();
		},
		render: function(){
			var This = this;
			var Photos = Backbone.Model.extend({});
			var photosCollection = Backbone.Collection.extend({model: Photos});
			var photos = new photosCollection(This.model.data);
			utils.loadTemplate("photos",function(html){
				template = _.template(html);
				$("#body").html(template({photos: photos.models,miID: This.miID}));
			});
		},
		showLikesAndComments: function(ev){
			var This = this;
			var id = ev.currentTarget.attributes['href'].value;
			$.colorbox({
				title:'Comentarios y likes',
				width:'70%',
				height:'85%',
				html: $(id).html()
			});
			$('#colorbox .like').on('click', This.api, this.like);	
			$('#colorbox .unlike').on('click', This.api, this.unlike);	
			$('#colorbox .postInfo').on('click',this.showAuthorsLikes);	
			$('#div-comment #publicarComentario').on('click',This.api,This.publishComment);	
			$('#cboxLoadedContent #comentario').bind('input propertychange', function() {
			    $('#div-comment img').addClass('hidden');
			});			
			$('#colorbox .speak').on('mouseover', this.speak);	
			$('#colorbox .speak').on('mouseout', this.shutUp);	
    	},
    	showAuthorsLikes: function(ev){
    		var This = this;
			var id = ev.currentTarget.attributes['name'].value;
			var popup = $("#" + id).html();
			$.colorbox({
				title:'Likes',
				width:'45%',
				height:'65%',
				html: popup
			});
			$('#colorbox .speak').on('mouseover', this.speak);	
			$('#colorbox .speak').on('mouseout', this.shutUp);	
    	},
    	publishComment: function(ev){
    		this.api = ev.handleObj.data;
    		var id = ev.currentTarget.attributes['data-comment-id'].value;
    		var mensaje = $('#cboxLoadedContent textarea').val();
    		if (mensaje){
				utils.utf8_encode($('#mensaje').val(),function(encoded_message){
					mensaje = encoded_message;
				});
			
    		this.api.comment(id,mensaje,function(response){
    				if(response)
    					$('#div-comment .ok').removeClass('hidden');
    				else
    					$('#div-comment .error').removeClass('hidden');
    		});
    		}
    	},
    	like: function(ev){
    		this.api = ev.handleObj.data;
    		var id = ev.currentTarget.attributes['id'].value;
    		this.api.like(id,function(response){
    			if (response == true)
    				$(ev.currentTarget).text("Ya no me gusta!");
    				$(ev.currentTarget).addClass("unlike");
    				$(ev.currentTarget).removeClass("like");
    		});
    	},
    	unlike: function(ev){
    		this.api = ev.handleObj.data;
    		var id = ev.currentTarget.attributes['id'].value;
    		this.api.unlike(id,function(response){
    			if (response == true)
    				$(ev.currentTarget).text("Me gusta!");
    				$(ev.currentTarget).removeClass("unlike");
    				$(ev.currentTarget).addClass("like");
    		});
    	}
	}),
	//Fotos de amigos
	friendPhotos: Backbone.View.extend({
		el: $("body"),
		events: {
			'click h2'	: 'showLikesAndComments',
			'click .post a.like'	: 'like',
			'click .post a.unlike'	: 'unlike'
		},
		initialize: function(){
			this.api = this.options.api;
			this.miID = this.api.currentUser.id;
			var This = this;
			this.render();
		},
		speak: function(ev){
			Speech.speak(ev.currentTarget.attributes['data-voice'].value);
		},
		shutUp: function(){
			Speech.shutUp();
		},
		showLikesAndComments: function(ev){
			var This = this;
			var id = ev.currentTarget.attributes['href'].value;
			$.colorbox({
				title:'Comentarios y likes',
				width:'70%',
				height:'85%',
				html: $(id).html()
			});
			$('#colorbox .like').on('click', This.api, this.like);	
			$('#colorbox .unlike').on('click', This.api, this.unlike);	
			$('#colorbox .postInfo').on('click',this.showAuthorsLikes);	
			$('#colorbox .speak').on('mouseover', this.speak);	
			$('#colorbox .speak').on('mouseout', this.shutUp);	
    	},
		render: function(){
			var This = this;
			var Photos = Backbone.Model.extend({});
			var photosCollection = Backbone.Collection.extend({model: Photos});
			var photos = new photosCollection(This.model.data);
			utils.loadTemplate("photos",function(html){
				template = _.template(html);
				$("#body").html(template({
					photos: photos.models,
					miID: This.miID
				}));
			});
		},

    	like: function(ev){
    		var This = this;
    		var id = ev.currentTarget.attributes['id'].value;
    		This.api.like(id,function(response){
    			if (response == true)
    				$(ev.currentTarget).text("Te gusta esto!");
    				$(ev.currentTarget).removeClass("like");
    				$(ev.currentTarget).addClass("unlike");
    		});
    	},
    	unlike: function(ev){
    		var This = this;
    		var id = ev.currentTarget.attributes['id'].value;
    		This.api.unlike(id,function(response){
    			if (response == true)
    				$(ev.currentTarget).text("Me gusta!");
    				$(ev.currentTarget).removeClass("unlike");
    				$(ev.currentTarget).addClass("like");
    		});
    	}
	}),
	//Update Album
	UpdateAlbum: Backbone.View.extend({
		el: $("body"),
		events: {
			'click a.deletePhoto'		: 'deletePhotos',
			'click button#selectPhotos'	: 'selectPhotos',
			'click a.albumPhotos.nextPage' : 'nextPage',
			'click a.albumPhotos.prevPage'	: 'prevPage',
		},
		initialize: function(){
			this.api = this.options.api;
			this.albumId = this.options.albumId;
			var This = this;
			this.render();
		},
		speak: function(ev){
			Speech.speak(ev.currentTarget.attributes['data-voice'].value);
		},
		shutUp: function(){
			Speech.shutUp();
		},
		deletePhotos: function(ev){
			var id = ev.currentTarget.attributes['data-photo-id'].value;
			this.api.deletePhoto(id,function(response){
	            	$(ev.currentTarget).parents('.flip-container').remove();
	        });
    	},
    	selectPhotos: function(event){
    		var This = this;
    		$.colorbox({
				title:'Subir fotos al album',
				width:'75%',
				height:'73%',
				html: $('#uploadForm').html()
			});
			$('#colorbox .speak').on('mouseover', this.speak);	
			$('#colorbox .speak').on('mouseout', this.shutUp);	
			$("#cboxLoadedContent #upload").on('click',This.uploadPhotos);
			$("#cboxLoadedContent #examinar").on('change',function (e) {
			    if(this.disabled) return alert('File upload not supported!');
			    var F = this.files;
			    if(F && F[0]) for(var i=0; i<F.length; i++) 
			    	This.readImage( F[i] );
			});
			$('#cboxLoadedContent #drop_zone').on('drop',function(e){
				$('#cboxLoadedContent h1.speak').addClass('loading');
		        if(e.originalEvent.dataTransfer){
		            if(e.originalEvent.dataTransfer.files.length) {
		                e.preventDefault();
		                e.stopPropagation();
		                var reader = new FileReader();
		                for (var i = 0, f; f = e.originalEvent.dataTransfer.files[i]; i++) {
						    reader.readAsDataURL(f);  
						    reader.onloadend = function () {
					            This.api.uploadPhotos(reader.result,This.albumId,null,function(response){
					            	$('#cboxLoadedContent #uploadPreview').append('<img src="'+ reader.result +'"/>');
					            	$('#cboxLoadedContent h1.speak').removeClass('loading');
					            });
						    };
		            }   
		        }
			    }
			});
        	
    	},
    	readImage: function(file, albumId){
    		$('#cboxLoadedContent h1.speak').addClass('loading');
    		var This = this;
    		var reader = new FileReader();
		    reader.readAsDataURL(file);  
		    reader.onloadend = function () {
	            This.api.uploadPhotos(reader.result,This.albumId,function(response){
	            	$('#cboxLoadedContent #uploadPreview').append('<img src="'+ reader.result +'"/>');
	            	$('#cboxLoadedContent h1.speak').removeClass('loading');
	            });
		    };
    	},
		render: function(){
			var This = this;
			var Photos = Backbone.Model.extend({});
			var photosCollection = Backbone.Collection.extend({model: Photos});
			var photos = new photosCollection(This.model.data);
			utils.loadTemplate("updateAlbum",function(html){
				template = _.template(html);
				$("#body").html(template({photos: photos.models}));
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
    	},
	}),
	//Albums del usuario
	Albums: Backbone.View.extend({
		el: $("body"),
		events: {
			'click a.albums.nextPage' : 'nextPage',
			'click a.albums.prevPage'	: 'prevPage',
			'click #create-album'		: 'createAlbum'
		},
		initialize: function(){
			this.api = this.options.api;
			this.friendId = this.options.friendId;
			var This = this;
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
					access_token: This.access_token,
					friendId: This.friendId
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
    	},
    	saveAlbum: function(ev){
    		this.api = ev.handleObj.data;
    		privacidad = $('#privacidad  option:selected').val();
    		nombre = $('#cboxLoadedContent #nombre').val();
    		descripcion = $('#cboxLoadedContent #descripcion').val();
    		this.api.createAlbum(nombre, descripcion, privacidad,function(response){
    			window.location.href ='/#updateAlbum/'+response.id;
    		});
    		
    	},
    	createAlbum: function(){
			var This = this;
			$.colorbox({
				title:'Crear Album',
				width:'45%',
				height:'45%',
				html: $('#uploadAlbumForm').html()
			});
			$('#cboxLoadedContent #saveAlbum').on('click',This.api,This.saveAlbum);	
    	},
	}),
	//Fotos de albums
	albumPhotos: Backbone.View.extend({
		el: $("#body"),
		initialize: function(){
			this.api = this.options.api;
			this.miID = this.api.currentUser.id;
			var This = this;
			this.render();
		},
		render: function(){
			var This = this;
			var Photos = Backbone.Model.extend({});
			var photosCollection = Backbone.Collection.extend({model: Photos});
			var photos = new photosCollection(This.model.data);
			utils.loadTemplate("photos",function(html){
				template = _.template(html);
				$("#body").html(template({photos: photos.models,miID: This.miID}));
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
    	},
	}),
	friendProfile: Backbone.View.extend({
		el: $("body"),
		events: {
			'click a.friendWall.nextPage' : 'nextPage',
			'click a.friendWall.prevPage' : 'prevPage',
			'click a.postInfo'			: 'showLikes',
			'click .post a.like'	: 'like',
			'click .post a.unlike'	: 'unlike',
			'click a.comments'		: 'showComments',
		},
		initialize: function(){
			this.api = this.options.api;
			this.miID = this.api.currentUser.id;
			var This = this;
			this.render();
		},
		speak: function(ev){
			Speech.speak(ev.currentTarget.attributes['data-voice'].value);
		},
		shutUp: function(){
			Speech.shutUp();
		},
		render: function(){
			var This = this;
			var FriendWall = Backbone.Model.extend({});
			var friendUpdatesCollection = Backbone.Collection.extend({model: FriendWall});
			var wallUpdates = new friendUpdatesCollection(This.options.wall.data);
			console.log(This.options.amigo);
			utils.loadTemplate("friendWall",function(html){
				var template = _.template(html);
				$("#body").html(template({
					friend: This.options.friendInfo,
					wall: wallUpdates.models,
					amigo: This.options.amigo,
					miID: This.miID
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
    	},

    	like: function(ev){
    		var This = this;
    		var id = ev.currentTarget.attributes['id'].value;
    		This.api.like(id,function(response){
    			if (response == true)
    				$(ev.currentTarget).text("Te gusta esto!");
    				$(ev.currentTarget).removeClass("like");
    				$(ev.currentTarget).addClass("unlike");
    		});
    	},
    	unlike: function(ev){
    		var This = this;
    		var id = ev.currentTarget.attributes['id'].value;
    		This.api.unlike(id,function(response){
    			if (response == true)
    				$(ev.currentTarget).text("Me gusta!");
    				$(ev.currentTarget).removeClass("unlike");
    				$(ev.currentTarget).addClass("like");
    		});
    	},
    	publishComment: function(ev){
    		this.api = ev.handleObj.data;
    		var id = ev.currentTarget.attributes['data-comment-id'].value;
    		var mensaje = $('#cboxLoadedContent textarea').val();
    		if (mensaje){
				utils.utf8_encode($('#mensaje').val(),function(encoded_message){
					mensaje = encoded_message;
				});
    		this.api.comment(id,mensaje,function(response){
    				if(response)
    					$('#div-comment .ok').removeClass('hidden');
    				else
    					$('#div-comment .error').removeClass('hidden');
    		});
    		}
    	},
		showLikes: function(ev){
			var This = this;
			var id = ev.currentTarget.attributes['name'].value;
			var popup = $("#" + id).html();
			$.colorbox({
				title:'Comentarios y likes',
				width:'40%',
				height:'60%',
				html: popup
			});
			$('#colorbox .speak').on('mouseover', this.speak);	
			$('#colorbox .speak').on('mouseout', this.shutUp);	
    	},
    	showComments: function(ev){
			var This = this;
			var id = ev.currentTarget.attributes['name'].value;
			var popup = $("#" + id).html();
			$.colorbox({
				title:'Comentarios',
				width:'55%',
				height:'70%',
				html: popup
			});
			$('#div-comment #publicarComentario').on('click',This.api,This.publishComment);	
			$('#cboxLoadedContent #comentario').bind('input propertychange', function() {
			    $('#div-comment img').addClass('hidden');
			});				
			$('#colorbox .speak').on('mouseover', this.speak);	
			$('#colorbox .speak').on('mouseout', this.shutUp);	
    	},
	})
}