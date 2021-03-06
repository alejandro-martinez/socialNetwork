//Facebook Api + App Controller
///////////////////////////////

FB.init({
    appId  : '527193310624003',
    status : true, // check login status
    cookie : true, // enable cookies to allow the server to access the session
    oauth  : true, // enable OAuth 2.0
	xfbml  : true
  });

FB.getLoginStatus(function(response) {
	
	FB.Event.subscribe('auth.statusChange', function(response) {
		startApp();
	});

	startApp();
});

function fbLogout(){
	if(typeof FB.logout == 'function'){
		if (FB.getAuthResponse()) {
			FB.logout(function(response) {
				window.location.href = '/'; 
			}); 
		}  
	};
}

function AppController(){
	this.locale = 'es_ES';
	this.id = null;
	this.currentUser = null;
	this.loggedUser = false;											//Boolean para saber si el usuario esta logueado
	var This = this;

	this.dataDefault = {
		id: null,
		username: 'No ha iniciado sesión',
		logButtonText: 'Conectarme',
		logButtonEvent: "FB.login(function(response){},{ scope: 'user_groups,publish_actions,manage_notifications, user_photos,friends_photos,friends_birthday,friends_hometown,friends_location read_stream' });",
		photo: 'img/def-user.jpg',
	};

	this.getUser = function(callback){
		if(This.currentUser){
			callback(This.currentUser);
		}
		else {
			fbUser('/me?locale='+This.locale, function(model){
			    This.currentUser = model;
			    callback(model);
			});	
		}
	},
	this.getNotifications = function(callback){
		FB.api(
		    "/me/notifications?include_read=1&limit=5&locale="+This.locale,
		    function (response) {
		      if (response && !response.error) {
		        callback(response);
		      }
		    }
		);
	},
	this.searchFriend = function(text, callback){
		fqlQuery("select uid, name from user where uid in (SELECT uid2 FROM friend WHERE uid1 = me())and (strpos(lower(name),'"+text+"')>=0 OR strpos(name,'"+text+"')>=0)",function(response){
			callback(response);
		});		
	},
	this.getFriend = function(id, callback){
		fbUser('/' + id + '?locale='+This.locale, function(model){
		    callback(model);
		});	
	},
	this.getFriendsWall = function(id, callback){

		fbUser('/' + id + '/tagged?locale='+This.locale, function(tagged){
			fbUser('/' + id + '/links?locale='+This.locale, function(links){
				fbUser('/' + id + '/statuses?locale='+This.locale, function(statuses){
					fbUser('/' + id + '/posts?locale='+This.locale, function(posts){
		    			callback({'tagged':tagged,'links':links,'statuses':statuses,'posts':posts});
					});	
				});	    
			});	    
		});	
	},
	this.getAlbums = function(id,callback){
		fbUser('/'+id+'/albums?limit=8&locale='+This.locale, function(model){
			callback(model);
		});	
	},
	this.getAlbumPhotos = function(id,limit,callback){
		fbUser('/'+id+'/photos?locale='+This.locale+'&limit='+limit, function(model){
			callback(model);
		});	
	},
	this.getPhotos = function(callback){
		fbUser('/me/photos?locale='+This.locale, function(model){
			callback(model);
		});	
	},
	this.getUserGroups = function(callback){
		fbUser('/me/groups/?locale='+This.locale+'&limit=6', function(model){
			callback(model);
		});	
	},
	this.getGroupFeed = function(id,callback){
		fbUser('/'+id+'/feed/?locale='+This.locale+'&limit=1', function(model){
			callback(model);
		});	
	},
	this.getFriendPhotos = function(id,callback){
		fbUser('/'+id+'/photos/uploaded?locale='+This.locale, function(model){
			callback(model);
		});	
	},
	this.getFriends = function(limite,callback){
		fbUser('/me/friends?fields=id,name,birthday,gender,hometown,location&limit='+limite+'&locale='+This.locale, function(model){
			callback(model);
		});	
	},
	this.newPost = function(id,mensaje, callback){

		FB.api('/'+id+'/feed', 'post', {message: mensaje}, function(response) {
		  if (!response || response.error) {
		  		callback(response.error);
		  } else {
		    	callback(response)
		  }
		});
	},
	this.like = function(id,callback){
		FB.api("/"+id+"/likes",
		    "POST",
		    function (response) {
		      if (response && !response.error) {
		        callback(response);
		      }
		    }
		);
	},
	this.unlike = function(id,callback){
		FB.api("/"+id+"/likes",
		    "DELETE",
		    function (response) {
		      if (response && !response.error) {
		        callback(response);
		      }
		    }
		);
	},
	this.comment = function(id,mensaje,callback){
		FB.api("/"+id+"/comments",
		    "POST",
		    {
		        "message": mensaje
		    },
		    function (response) {
		      if (response && !response.error) {
		        callback(response)
		      }
		    }
		);
	},
	this.createAlbum = function(nombre,descripcion,callback){
		FB.api(
		    "/me/albums",
		    "POST",
		    {
		        "name": nombre,
		        "message": descripcion,
		        //"privacy": privacidad
		    },
		    function (response) {
		      if (response && !response.error) {
		        callback(response);
		      }
		    }
		);
	},
	this.deletePhoto = function(id,callback){
		FB.api(
		    "/"+id,
		    "DELETE",
		    function (response) {
		      if (response && !response.error) {
		      	callback(response);
		      }
		    }
		);
	},
	this.uploadPhotos = function (foto,albumId, mensaje, callback){
		var access_token = FB.getAuthResponse()['accessToken'];
		var extension = foto.substring(1,11);
		
		try{
	        blob = utils.dataURItoBlob(foto.replace("data:image/jpeg;base64,",""),"image/" + extension);
		}
		catch(e){console.log(e);}

		var form = utils.newForm({'accessToken':access_token,'source':blob,'message':mensaje});

		$.ajax({
	        url:"https://graph.facebook.com/"+albumId+"/photos?access_token="+access_token,
	        type:"POST",
	        data:form,
	        processData:false,
	        contentType:false,
	        cache:false,
	        success:function(data){
	        	console.log(data);
	        	callback(data);
	        },
	        error:function(shr,status,data){
	            callback(data);
	        }
	    });
	},
	this.addFriend = function (id){
		FB.ui({ method: 'friends.add', id: id });
	},
	this.isFriend = function(id, callback){
		FB.api("/me/friends/" + id,
	    function (response) {
			callback(response);
	    });
	}
	
	this.updateProfilePhoto = function (callback){
		FB.api("/me",
	    function (response) {
	      if (response && !response.error) {
			callback(response.id);
		  }
	    });
	},
	this.updateWall = function (callback){
		fbUser('me/tagged?locale='+This.locale, function(tagged){
			fbUser('/me/links?locale='+This.locale, function(links){
				fbUser('/me/statuses?locale='+This.locale, function(statuses){
					fbUser('/me/posts?locale='+This.locale, function(posts){
		    			callback({'tagged':tagged,'links':links,'statuses':statuses,'posts':posts});
					});	
				});	    
			});	    
		});	
	},
	this.newsFeed = function (callback){
		FB.api("/me/home?locale="+This.locale,
		    function (response) {
		      if (response && !response.error) {
		       	  callback(response);
		      }
		    }
		);
	},
	this.get = { /* preparando para backbone collections */
		home: function (callback){
			FB.api("/me/home?locale="+This.locale,
				function (response) {
					if (response && !response.error) {
						callback(response);
					}
				}
			);
		},
		feed: function (callback){
			FB.api("/me/feed?limit=1&locale="+This.locale,
				function (response) {
					if (response && !response.error) {
						callback(response);
					}
				}
			);
		},
		notifications: function(callback){
			FB.api(
				"/me/notifications?include_read=1&limit=5&locale="+This.locale,
				function (response) {
					if (response && !response.error) {
						callback(response);
					}
				}
			);
		},
		photos: function(callback){
			fbUser('/me/photos?locale='+This.locale, function(model){
				callback(model);
			});
		},
		groups: function(callback){
			fbUser('/me/groups/?locale='+This.locale, function(model){
				callback(model);
			});
		},
		groupFeed: function(id,callback){
			fbUser('/'+id+'/feed/?locale='+This.locale, function(model){
				callback(model);
			});
		},
		friends: function(callback){
			fbUser('/me/friends?fields=id,name,birthday,gender,hometown,location&locale='+This.locale, function(model){
				callback(model);
			});
		},
		friend: function(id, callback){
			fbUser('/'+id+'?locale='+This.locale, function(model){
				callback(model);
			});
		},
		friendPosts: function(id, callback){
			fbUser('/'+id+'/posts?locale='+This.locale, function(model){
				callback(model);
			});
		},
		friendAlbum: function(id, callback){
			fbUser('/'+id+'/albums?locale='+This.locale, function(model){
				callback(model);
			});
		},
		albumPhotos: function(id, callback){
			fbUser('/'+id+'/photos?locale='+This.locale, function(model){
				callback(model);
			});	
		},
	}
}

function startApp(){
	
	var ac = new AppController();

	ac.getUser(function(response){													//Trae datos del usuario logueado
		
		((response.error) ? ac.loggedUser = false : ac.loggedUser = true);			//El usuario esta logueado

		if (ac.loggedUser == true){
			var sexo;
    		((ac.currentUser.gender.toUpperCase()=="FEMALE") ? sexo = "a" : sexo = "o");
    		ac.dataDefault.username = "Bienvenid" + sexo + " " + response.first_name;	
    		ac.dataDefault.logButtonEvent = "fbLogout();";					
    		ac.dataDefault.logButtonText = "Salir";
    		ac.dataDefault.id = response.id;
    		ac.dataDefault.photo = "http://graph.facebook.com/" + ac.currentUser.id + "/picture?type=normal";
    	}
		var loc = window.location.hash.split("#")[1]
		var ws = new AppRouter({ac: ac});
		Backbone.history.stop();													
		Backbone.history.start();

		ws.navigate('/fbid/me', true);
		if(loc){
			ws.navigate('/'+loc, true );
		}
	});
	
}

function fbUser(fbid, callback){
	FB.api(fbid, function(response){
			callback(response);
	});
}

function fqlQuery(query,callback){
	FB.api(
	  {
	    method: 'fql.query',
	    query: query
	  },
  		function(response) {
    		callback(response)
  		}
	);
}
