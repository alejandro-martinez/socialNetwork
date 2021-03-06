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
			'mouseout .speak': 'shutUp',
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
			'click .selectedImage': 'deleteSelectedPhoto',
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
		deleteSelectedPhoto: function(){
			This.attachment = null;
			$('#adjuntarFoto img.selectedImage').remove();
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
				    	$('<img class=selectedImage />').appendTo("#adjuntarFoto");
				    	preview = $('#adjuntarFoto .selectedImage');
						preview.attr('src', reader.result);
						preview.attr('class', "selectedImage speak");
						preview.attr('data-voice', "Click para eliminar imagen");
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
	            	$('#post-text').val('');	
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
				$("#body #wall").html("");
				$("#body").append(template({news:This.model.data, miID: This.miID}));
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
			utils.launchPopup("Comentarios","55%","70%",$("#" + ev.currentTarget.attributes['name'].value).html(),this);
			$('#div-comment #publicarComentario').on('click',this.api,this.publishComment);	
			$('#cboxLoadedContent #comentario').bind('input propertychange', function() {
			    $('#div-comment img').addClass('hidden');
			});				
    	},
		showLikes: function(ev){
			utils.launchPopup("Likes","40%","60%",$("#" + ev.currentTarget.attributes['name'].value).html(),this);
    	},
	}),
	Groups: Backbone.View.extend({
		el: $("#content"),
		events: {
			'click a.groups.nextPage'	: 'nextPage',
			'click a.groups.prevPage'	: 'prevPage',
			'mouseover .speak': 'speak',
			'mouseout .speak': 'shutUp'
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
		speak: function(ev){
			Speech.speak(ev.currentTarget.attributes['data-voice'].value);
		},
		shutUp: function(){
			Speech.shutUp();
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
				$("#body").html("");
				$("#body").append(template({updates:This.model.data, destinoPost: This.options.group_id, miID: This.miID}));
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
			utils.launchPopup("Comentarios y likes","40%","60%",$("#" + ev.currentTarget.attributes['name'].value).html(),this);
    	},
    	showComments: function(ev){
    		utils.launchPopup("Comentarios","55%","70%",$("#" + ev.currentTarget.attributes['name'].value).html(),this);
			$('#div-comment #publicarComentario').on('click',this.api,this.publishComment);	
			$('#cboxLoadedContent #comentario').bind('input propertychange', function() {
			    $('#div-comment img').addClass('hidden');
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
			var wallLinks = new updatesCollection(This.options.wall.links.data);
			var wallPosts = new updatesCollection(This.options.wall.posts.data);
			var wallTagged = new updatesCollection(This.options.wall.tagged.data);
			var wallStatuses = new updatesCollection(This.options.wall.statuses.data);

			var wall= $.merge([], [wallLinks.models,wallPosts.models,wallTagged.models,wallStatuses.models]);

			utils.loadTemplate("wall",function(html){
				var template = _.template(html);
				$("#body").html("");
				$("#body").append(template({feed: wall,miID: This.miID}));
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
			utils.launchPopup("Comentarios y likes","40%","60%",$("#" + ev.currentTarget.attributes['name'].value).html(),this);
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
			utils.launchPopup("Comentarios","55%","70%",$("#" + ev.currentTarget.attributes['name'].value).html(),this);
			$('#div-comment #publicarComentario').on('click',This.api,This.publishComment);	
			$('#cboxLoadedContent #comentario').bind('input propertychange', function() {
			    $('#div-comment img').addClass('hidden');
			});				
    	},
	}),
	//La barra superior con Nombre y boton Conectar
	Header: Backbone.View.extend({
		el: $("body"),
		events: {
			'click #SpeechConf': 'mute',
			'click #verNotificaciones'	: 'showNotifications',
			'click a.notifications.nextPage' : 'nextPage',
			'click a.notifications.prevPage'	: 'prevPage',
			'mouseover .speak': 'speak',
			'mouseout .speak': 'shutUp'
		},
		initialize: function(){
			this.api = this.options.api;
	        this.render();
		},
		speak: function(ev){
			Speech.speak(ev.currentTarget.attributes['data-voice'].value);
		},
		shutUp: function(){
			Speech.shutUp();
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
				utils.launchPopup("Notificaciones","70%","85%",template({notifications: model.data}),this);
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
		},
		mute: function(){
			if(Speech.config.mute){
				$('#SpeechConf>img').attr('src','img/icons/sonido-on.png');
				Speech.config.mute = false;
			} else {
				$('#SpeechConf>img').attr('src','img/icons/sonido-off.png');
				Speech.config.mute = true;
			}
		}
	}),
	Search: Backbone.View.extend({
		el: $("#nav-content"),
		events: {
			"keyup .ui-corner-all" : "navigateResultItem",
			'mouseover .speak': 'speak',
			'mouseout .speak': 'shutUp'
		},
		initialize: function(){
			var This = this;
			This.api = this.options.api;
			this.render();
		},
		sortByProperty: function(property) {
		    'use strict';
		    return function (a, b) {
		        var sortStatus = 0;
		        if (a[property] < b[property]) {
		            sortStatus = 1;
		        } else if (a[property] > b[property]) {
		            sortStatus = -1;
		        }
		 
		        return sortStatus;
		    };
		},
		navigateResultItem: function(event){
		    if(event.keyCode == 13){
		        window.location.href ='/#friend/'+$('.typeahead').val();
		    }
		},
		speak: function(ev){
			Speech.speak(ev.currentTarget.attributes['data-voice'].value);
		},
		shutUp: function(){
			Speech.shutUp();
		},
		render: function(){
			var This = this;
			utils.loadTemplate("search",function(html){
				template = _.template(html);
				$("#nav-content").append(template);

				$( ".typeahead" ).autocomplete({
			 	create: function() {
			        $(this).data('ui-autocomplete')._renderItem =	function( ul, item ) {	        	
			        		
			        	if (item.commonCount == 99) {
			        		leyenda = 'Es tu amigo';
			        		image_url = "http://graph.facebook.com/" + item.value +"/picture";
			        	}
			        	else {
			        		if (item.commonCount > 0) {
				        		leyenda = item.commonCount + ' amigos en común';
				        		image_url = "http://graph.facebook.com/1022554477/picture";		
							}
							else {
								leyenda = item.commonCount + ' amigos en común';
			        			image_url = "http://graph.facebook.com/1022554477/picture";		
							}
						}
					    return $( "<li>" ).append($("<img style=''>").attr('src',image_url))
					    .append( $( '<a class="speak" data-voice="'+item.label+'" href="/#friend/'+item.value+'">' ).text( item.label ) )
					    .append( $( '<a class="speak commonFriends" data-voice="'+leyenda+'">' ).text(leyenda ) )
					    .appendTo( ul );
					 }
			    },
		        source: function( request, response ) {
		        	
			        $.ajax({
					  url: "https://graph.facebook.com/fql?q=SELECT uid,name,mutual_friend_count FROM user WHERE contains('"+request.term.toLowerCase()+"') LIMIT 5000&access_token="+FB.getAuthResponse()['accessToken'],			          
			          dataType: "jsonp",
			          data: {
			            featureClass: "P",
			            style: "full",
			            maxRows: 100,
			          },
			           beforeSend: function(){
						  $('.typeahead').addClass('searching');     
					   },
			          success: function( data, callback ) {
						data.data.sort(This.sortByProperty("mutual_friend_count"));
						friends=[];
						This.api.getFriends(4000,function(resp){
							friends = [];
							for(i=0;i<resp.data.length;i++){
								resp.data[i].mutual_friend_count = '99';
								resp.data[i].name = resp.data[i].name;
								resp.data[i].uid = resp.data[i].id;
								friends.push(resp.data[i]);
							}
							for(i=0;i<data.data.length;i++){
								friends.push(data.data[i]);
							}

			            res = $.map(friends, function( item ) {
								if (item.name.toLowerCase().indexOf(request.term.toLowerCase()) >= 0){	
									    return {
									      label: item.name,
									      value: item.uid,
									      commonCount: item.mutual_friend_count
									    }
				          		}
				        });
			            response(res);
			            $('.typeahead').removeClass('searching');
			   			$('.ui-autocomplete a.speak').on('mouseover', This.speak);	
						$('.ui-autocomplete a.speak').on('mouseout', This.shutUp);	

						});
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
		}
	}),
	//Fotos del usuario
	Photos: Backbone.View.extend({
		el: $("body"),
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
			utils.launchPopup("Comentarios","55%","70%",$("#" + ev.currentTarget.attributes['name'].value).html(),this);
			$('#div-comment #publicarComentario').on('click',This.api,This.publishComment);	
			$('#cboxLoadedContent #comentario').bind('input propertychange', function() {
			    $('#div-comment img').addClass('hidden');
			});				
    	},
		showLikes: function(ev){
			utils.launchPopup("Comentarios","40%","60%",$("#" + ev.currentTarget.attributes['name'].value).html(),this);
    	},
	}),
	//Fotos de amigos
	friendPhotos: Backbone.View.extend({
		el: $("body"),
		events: {
			'click h2'	: 'showLikesAndComments',
			'click .post a.like'	: 'like',
			'click .post a.unlike'	: 'unlike',
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
		showLikesAndComments: function(ev){
			utils.launchPopup("Comentarios y likes","70%","85%",$(ev.currentTarget.attributes['href'].value).html(),this);
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
			'click a.deletePhoto' : 'deletePhotos',
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
	            $('.selectedImage').remove();
	        });
    	},
		refreshAlbumPhotos: function(id){
			var This = this;
			This.api.getAlbumPhotos(id,15,function(response){
           		this.UpdateAlbumView = new Views.UpdateAlbum({model: response,albumId: id, api: This.api});
				this.UpdateAlbumView.initialize();
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
    	listenUploadEvent: function(){
    		var This = this;
			$("#upload").on('change',function (e) {
			    var F = this.files;
			    if(F && F[0]) {
			    	var reader = new FileReader();
				    reader.readAsDataURL(F[0]);  
				    $('#body').addClass('loading-big');
				    reader.onloadend = function () {
						This.api.uploadPhotos(reader.result,This.albumId,'',function(response){
			            	$('#body').removeClass('loading-big');
							This.refreshAlbumPhotos(This.albumId);
			            });
				    }			
				}            
				this.files= null;
			});
    	},
		render: function(){
			var This = this;
			var Photos = Backbone.Model.extend({});
			var photosCollection = Backbone.Collection.extend({model: Photos});
			var photos = new photosCollection(This.model.data);
			utils.loadTemplate("updateAlbum",function(html){
				template = _.template(html);
				$("#body").html(template({photos: photos.models}));
				This.listenUploadEvent();
				var wrapper = $('<div/>').css({height:0,width:0,'overflow':'hidden'});
				var fileInput = $(':file').wrap(wrapper);

				$('#file').click(function(){
				    fileInput.click();
				}).show();
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
			'click #create-album'		: 'createAlbum',
			'mouseover .speak': 'speak',
			'mouseout .speak': 'shutUp'
		},
		speak: function(ev){
			Speech.speak(ev.currentTarget.attributes['data-voice'].value);
		},
		shutUp: function(){
			Speech.shutUp();
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
    		nombre = $('#cboxLoadedContent #nombre').val();
    		descripcion = $('#cboxLoadedContent #descripcion').val();
    		this.api.createAlbum(nombre, descripcion, function(response){
    			window.location.href ='/#updateAlbum/'+response.id;
    		});
    	},
    	createAlbum: function(){
			utils.launchPopup("Crear Album","45%","45%",$('#uploadAlbumForm').html(),this);
			$('#cboxLoadedContent #saveAlbum').on('click',this.api,this.saveAlbum);	
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
			var wallLinks = new friendUpdatesCollection(This.options.wall.links.data);
			var wallPosts = new friendUpdatesCollection(This.options.wall.posts.data);
			var wallTagged = new friendUpdatesCollection(This.options.wall.tagged.data);
			var wallStatuses = new friendUpdatesCollection(This.options.wall.statuses.data);

			var feed = $.merge([], [wallLinks.models,wallPosts.models,wallTagged.models,wallStatuses.models]);
			
			utils.loadTemplate("friendWall",function(html){
				var template = _.template(html);
				$("#body").html(template({
					friend: This.options.friendInfo,
					feed: feed,
					amigo: This.options.amigo,
					miID: This.miID
				}));
			});
			$.colorbox.close();
		},
		nextPage: function(){
			var This = this;
			$.getJSON(this.options.wall.paging.next + '&callback=?', function(response){
				This.options.wall = response;
				console.log(response)
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
			utils.launchPopup("Comentarios y likes","40%","60%",$("#" + ev.currentTarget.attributes['name'].value).html(),this);
    	},
    	showComments: function(ev){
    		utils.launchPopup("Comentarios","55%","70%",$("#" + ev.currentTarget.attributes['name'].value).html(),this);
			$('#div-comment #publicarComentario').on('click',This.api,This.publishComment);	
			$('#cboxLoadedContent #comentario').bind('input propertychange', function() {
			    $('#div-comment img').addClass('hidden');
			});				
    	},
	})
}
