meSpeak.loadConfig("lib/mespeak_config.json");
meSpeak.loadVoice("lib/voices/es-la.json");

function loadVoice(id) {
	var fname="voices/"+id+".json";
	meSpeak.loadVoice(fname, voiceLoaded);
}

function voiceLoaded(success, message) {
	if (success) {
		alert("Voice loaded: "+message+".");
	}
	else {
		alert("Failed to load a voice: "+message);
	}
}

function removeAccents(strAccents) {
	var strAccents = strAccents.split('');
	var strAccentsOut = new Array();
	var strAccentsLen = strAccents.length;
	var accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž';
	var accentsOut = "AAAAAAaaaaaaOOOOOOOooooooEEEEeeeeeCcDIIIIiiiiUUUUuuuuNnSsYyyZz";
	for (var y = 0; y < strAccentsLen; y++) {
		if (accents.indexOf(strAccents[y]) != -1) {
			strAccentsOut[y] = accentsOut.substr(accents.indexOf(strAccents[y]), 1);
		} else
			strAccentsOut[y] = strAccents[y];
	}
	strAccentsOut = strAccentsOut.join('');
	return strAccentsOut;
}