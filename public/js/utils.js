window.utils = {    

    // Asynchronously load templates located in separate .html files
    /*loadTemplate: function(views, callback) {

        var deferreds = [];

        $.each(views, function(index, view) {
            if (window[view]) {
                deferreds.push($.get('tpl/' + view + '.html', function(data) {
                    window[view].prototype.template = _.template(data);
                }));
            } else {
                alert(view + " no encontrado");
            }
        });

        $.when.apply(null, deferreds).done(callback);
    },*/
    launchPopup: function(title,width,height,content, superObj){

        $.colorbox({
          title: title,
          width:width,
          height:height,
          html: content
        },
        {onComplete:function(){
          $('a.speak').on('click', $.colorbox.close());
        }});
        $('#colorbox .speak').on('mouseover', superObj.speak);
        $('#colorbox .speak').on('mouseout', superObj.shutUp);
        
    },
    loadTemplate: function(view, callback){
        $.get('tpl/' + view + '.html', function(data) {
                callback(data);
        });
    },
    displayValidationErrors: function (messages) {
        for (var key in messages) {
            if (messages.hasOwnProperty(key)) {
                this.addValidationError(key, messages[key]);
            }
        }
        this.showAlert('Warning!', 'Complete los campos obligatorios e  intente nuevamente', 'alert-warning');
    },

    addValidationError: function (field, message) {
        var controlGroup = $('#' + field).parent().parent();
        controlGroup.addClass('error');
        $('.help-inline', controlGroup).html(message);
    },

    removeValidationError: function (field) {
        var controlGroup = $('#' + field).parent().parent();
        controlGroup.removeClass('error');
        $('.help-inline', controlGroup).html('');
    },

    showAlert: function(title, text, klass) {
        $('.alert').removeClass("alert-error alert-warning alert-success alert-info");
        $('.alert').addClass(klass);
        $('.alert').html('<strong>' + title + '</strong> ' + text);
        $('.alert').show();
    },

    hideAlert: function() {
        $('.alert').hide();
    },
    //convierte una imagen en base64 a formato blob
    dataURItoBlob: function(dataURI,mime) {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs

        var byteString = window.atob(dataURI);
        // write the bytes of the string to an ArrayBuffer
        //var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        // write the ArrayBuffer to a blob, and you're done
        var blob = new Blob([ia], { type: mime });

        return blob;
    },

    newForm: function(data){
        var form = new FormData();
        $.each(data, function(key, value) {
            form.append(key,value);
        });
        return form;
    },

    utf8_encode: function(argString) {
      //  discuss at: http://phpjs.org/functions/utf8_encode/
      // original by: Webtoolkit.info (http://www.webtoolkit.info/)
      // improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
      // improved by: sowberry
      // improved by: Jack
      // improved by: Yves Sucaet
      // improved by: kirilloid
      // bugfixed by: Onno Marsman
      // bugfixed by: Onno Marsman
      // bugfixed by: Ulrich
      // bugfixed by: Rafal Kukawski
      // bugfixed by: kirilloid
      //   example 1: utf8_encode('Kevin van Zonneveld');
      //   returns 1: 'Kevin van Zonneveld'

      if (argString === null || typeof argString === 'undefined') {
        return '';
      }

      var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      var utftext = '',
        start, end, stringl = 0;

      start = end = 0;
      stringl = string.length;
      for (var n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;

        if (c1 < 128) {
          end++;
        } else if (c1 > 127 && c1 < 2048) {
          enc = String.fromCharCode(
            (c1 >> 6) | 192, (c1 & 63) | 128
          );
        } else if ((c1 & 0xF800) != 0xD800) {
          enc = String.fromCharCode(
            (c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
          );
        } else { // surrogate pairs
          if ((c1 & 0xFC00) != 0xD800) {
            throw new RangeError('Unmatched trail surrogate at ' + n);
          }
          var c2 = string.charCodeAt(++n);
          if ((c2 & 0xFC00) != 0xDC00) {
            throw new RangeError('Unmatched lead surrogate at ' + (n - 1));
          }
          c1 = ((c1 & 0x3FF) << 10) + (c2 & 0x3FF) + 0x10000;
          enc = String.fromCharCode(
            (c1 >> 18) | 240, ((c1 >> 12) & 63) | 128, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128
          );
        }
        if (enc !== null) {
          if (end > start) {
            utftext += string.slice(start, end);
          }
          utftext += enc;
          start = end = n + 1;
        }
      }

      if (end > start) {
        utftext += string.slice(start, stringl);
      }

      return utftext;
    }
    
	
};
