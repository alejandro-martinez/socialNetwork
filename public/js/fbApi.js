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
	
	FB.Event.subscribe('auth.login', function(response) {
		startApp();
	});

	startApp();
});

FB.login(function(response){return null;},{ scope: 'publish_actions, user_photos, read_stream' });

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

	this.id = null;
	this.currentUser = null;
	this.loggedUser = false;											//Boolean para saber si el usuario esta logueado
	var This = this;

	this.dataDefault = {
		id: null,
		username: 'No ha iniciado sesión',
		logButtonText: 'Conectarme',
		logButtonEvent: 'FB.login()',
		photo: 'img/def-user.jpg',
	};

	this.getUser = function(callback){
		if(This.currentUser){
			callback(This.currentUser);
		}
		else {
			fbUser('/me', function(model){
			    This.currentUser = model;
			    callback(model);
			});	
		}
	},
	this.getAlbums = function(callback){
		fbUser('/me/albums', function(model){
			callback(model);
		});	
	},
	this.getPhotos = function(callback){
		fbUser('/me/photos', function(model){
			callback(model);
		});	
	},
	this.getFriends = function(callback){
		fbUser('/me/friends', function(model){
			callback(model);
		});	
	},
	this.newPost = function(mensaje, callback){
		FB.api('/me/feed', 'post', { message: mensaje }, function(response) {
		  if (!response || response.error) {
		  		callback(response.error);
		  } else {
		    	callback(response)
		  }
		});
	},
	this.uploadPhoto = function (foto, esPerfil, callback){
		var access_token = FB.getAuthResponse()['accessToken'];
		var extension = foto.substring(1,11);
		
		try{
	        blob = utils.dataURItoBlob(foto.replace("data:image/jpeg;base64,",""),"image/" + extension);
		}
		catch(e){console.log(e);}

		var form = utils.newForm({'accessToken':access_token,'source':blob,'message':''});

		$.ajax({
	        url:"https://graph.facebook.com/me/photos?access_token="+access_token,
	        type:"POST",
	        data:form,
	        processData:false,
	        contentType:false,
	        cache:false,
	        success:function(data){
	        	callback(data);
	        },
	        error:function(shr,status,data){
	            callback(data);
	        }
	    });
	},

	this.updateProfilePhoto = function (callback){
		FB.api("/me",
	    function (response) {
	      if (response && !response.error) {
			callback(response.id);
		  }
	    });
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
    		ac.dataDefault.logButtonText = "Desconectarme";
    		ac.dataDefault.id = response.id;
    		ac.dataDefault.photo = "http://graph.facebook.com/" + ac.currentUser.id + "/picture?type=normal";
    	}
		
		var ws = new AppRouter({ac: ac});
		Backbone.history.stop();													
		Backbone.history.start();

		ws.navigate('/fbid/me', true );												
	});
	
}

function fbUser(fbid, callback){
	FB.api(fbid, function(response){
			callback(response);
	});
}