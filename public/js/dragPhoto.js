	$(document).ready(function() {
		$('html, body, *').mousewheel(function(e, delta) {
			this.scrollLeft -= (delta * 40);
            $('html').css("overflow-y","hidden");
			e.preventDefault();
		});

		$(".inline").colorbox({inline:true, width:"50%",height:"80%",
	    onComplete: function() {
	        closeEvent = function() {
	            updateFotoPerfil();
	        }
	    },
	    onClosed: function() { closeEvent() }
		});

		var windowSizeArray = [ "width=800,height=700","width=800,height=700,scrollbars=no" ];

		$('.newWindow').click(function (event){
 
            var url = $(this).attr("href");            
            var windowSize = windowSizeArray[$(this).attr("rel")];
            window.open(url, 'popup', windowSize);
            event.preventDefault();

        });
 

		if(window.FileReader) { 
		 var drop; 
		 addEventHandler(window, 'load', function() {
		    var status = document.getElementById('status');
		    drop   = document.getElementById('userProfilePicture');
		    var list   = document.getElementById('list');
		  	
		    function cancel(e) {
		      if (e.preventDefault) { e.preventDefault(); }
		      return false;
		    }
		  
		    // Tells the browser that we *can* drop on this target
		    addEventHandler(drop, 'dragover', cancel);
		    addEventHandler(drop, 'dragenter', cancel);

		addEventHandler(drop, 'drop', function (e) {
		  e = e || window.event; // get window.event if e argument missing (in IE)   
		  if (e.preventDefault) { e.preventDefault(); } // stops the browser from redirecting off to the image.

		  var dt    = e.dataTransfer;
		  //Guardo la foto
		  var imagen = dt.files[0];
	   	  var reader = new FileReader();
		  //attach event handlers here...
		   
		  reader.readAsDataURL(imagen);
			addEventHandler(reader, 'loadend', function(e, file) {
			  	var bin = this.result; 			    
			    uploadPhoto(bin, true);
			}.bindToEventHandler(imagen));
		  
		  return false;
		});
		Function.prototype.bindToEventHandler = function bindToEventHandler() {
		  var handler = this;
		  var boundParameters = Array.prototype.slice.call(arguments);
		  //create closure
		  return function(e) {
		      e = e || window.event; // get window.event if e argument missing (in IE)   
		      boundParameters.unshift(e);
		      handler.apply(this, boundParameters);
		  }
		};
		  });
		} else { 
		  document.getElementById('status').innerHTML = 'Your browser does not support the HTML5 FileReader.';
		}
		function addEventHandler(obj, evt, handler) {
		    if(obj.addEventListener) {
		        // W3C method
		        obj.addEventListener(evt, handler, false);
		    } else if(obj.attachEvent) {
		        // IE method.
		        obj.attachEvent('on'+evt, handler);
		    } else {
		        // Old school method.
		        obj['on'+evt] = handler;
		    }
		}

	});