$(document).ready(function() {
		$('.newWindow').click(function (event){
			event.preventDefault();
			var windowSizeArray = [ "width=800,height=700","width=800,height=700,scrollbars=no" ];
			var url = $(this).attr("href");
			var windowSize = windowSizeArray[$(this).attr("rel")];
			window.open(url, 'popup', windowSize);
		});
		$(document.body).bind("dragover", function(e) {
			e.preventDefault();
			return false;
		});

		$(document.body).bind("drop", function(e){
			e.preventDefault();
			return false;
		});
	});

	function speak(texto){    
		//Evita la pronunciacion de simbolos raros y url's
		texto = texto.replace(/(\b(https?|ftp|file):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z09+&@#\/%=~_|])/img, '');
		//texto = texto.replace(/[^A-Za-z ]/g,'');
		texto = texto.replace('ñ','ni');
		msg = new SpeechSynthesisUtterance();
		msg.volume = 1; // 0 to 1
		msg.rate = 1; // 0.1 to 10
		msg.pitch = 2; //0 to 2
		msg.text = texto;
		msg.lang = 'es-ES';
		speechSynthesis.speak(msg);
	}

	function shutUp(){
		speechSynthesis.cancel();
	}

	function readImage(file) {
	  
	    var reader = new FileReader();
	    var image  = new Image();
	  
	    reader.readAsDataURL(file);  
	    reader.onload = function(_file) {
	    	console.log(_file)
	        image.src    = _file.target.result;              // url.createObjectURL(file);
	        image.onload = function() {
	            var w = this.width,
	                h = this.height,
	                t = file.type,                           // ext only: // file.type.split('/')[1],
	                n = file.name,
	                s = ~~(file.size/1024) +'KB';
	            $('#uploadPreview').append('<img src="'+ this.src +'"> '+w+'x'+h+' '+s+' '+t+' '+n+'<br>');
	        };
	        image.onerror= function() {
	            alert('Invalid file type: '+ file.type);
	        };      
	    };
	    
	}