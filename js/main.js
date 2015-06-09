// =========================================================
// showLoading - shows or hides a loading animation
// =========================================================
function showLoading(msg) {
	msg = msg || null;
	
	if (msg == null) {
		// hide loading message
		$('#form_button').html('Scan For Data Feed &raquo;');
		$('#form_button').removeAttr('disabled');
	}else{
		// show loading message
		$('#form_button').attr('disabled','disabled');
		$('#form_button').html('<img src="img/spinner-mini-white.gif" /> ' + msg);
	}
}

// =========================================================
// Show error - shows or hides errors
// =========================================================
function showError(msg) {

	msg = msg || null;

	if (msg == null) {
		// hide error
		$('#error').fadeOut;
		$('#error').html('');
	}else{
		// show error
		$('#error').html('<hr class="noprint" /><div class="alert alert-danger alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><strong>Error!</strong> '+ msg +'</div>');
		$('#error').fadeIn();
	}
}

// =========================================================
// Document Ready
// =========================================================

// NEED A BETTER WAY TO ASYNCHRONOSLY HANDLE GETTING PLAYER POSITION AND FILENAME, thus updated thumb etc.
$(function() {
	// every 5 seconds update the playing video status and thumbnail
	setInterval(function() {
		// get updated player properties
		send_message("Player.GetProperties", {
			"playerid": 1,   // <-- could be a problem, manually set!
			"properties": ["time", "percentage", "playlistid"]
		});
	}, 5000);
});

// =========================================================
// update the thumbnail for a controlled Pi
// =========================================================
function updateThumbnails(path, offset) {
	$("#thumb_BNE-PI-01").attr('src','tools/get_thumb.php?path='+path+'&offset='+offset);
}

// =========================================================
// Connect to the Pi's using the browser's websocket 
// implementation and listen to each event for new data.
// =========================================================
var connection = new WebSocket('ws://10.0.6.116:9090/jsonrpc');
//var connection = new WebSocket('ws://192.168.1.10:9090/jsonrpc');

connection.onopen = function (event) {
	send_message("Player.GetActivePlayers");
}

connection.onmessage = function (event) {
	var j = JSON.parse(event.data);

	if (j.id) { 

		// response
		switch(j.id) {

			// message containing active players
			case "Player.GetActivePlayers":
				var r = j.result[0];
				if (r.type == 'video') {
					// get video properties
					send_message("Player.GetItem", { 
						"playerid": r.playerid,
						"properties": ["file", "streamdetails"]
					});
					// get player properties
					send_message("Player.GetProperties", {
						"playerid": r.playerid,
						"properties": ["time", "percentage", "playlistid"]
					});
				}
				break;
	
			// message video properties
			case "Player.GetItem":
				// grab video details
				var r = j.result.item;
				var v = r.streamdetails.video[0];

				//console.log(r);

				// update the UI with the playing video details
				document.getElementById("name").innerHTML = r.label;
				document.getElementById("details_resolution").innerHTML = v.width + 'x' + v.height 
				document.getElementById("details_duration").innerHTML = v.duration + 's';
				
				// set the filename value
				$("#path_BNE-PI-01").val(r.file);

				// set the initial thumbnail
				//updateThumbnails(r.file, 5);

				break;
			
			// message containing player properties
			case "Player.GetProperties":

				// generate the time for current offset (hh:mm:ss)
				var player_offset = j.result.time.hours + ':' + j.result.time.minutes + ':' + j.result.time.seconds;

				// update the video thumbnail to current position
				updateThumbnails($("#path_BNE-PI-01").val(), player_offset);
				
				break;

			default:
				console(event.data);
		}

	} else {

		// notification
		switch(j.method) {
	    	case "Player.OnPlay":
	        	send_message("Player.GetActivePlayers");
	        	break;
	    	
	    	case "Player.OnStop":
	        	document.getElementById("name").innerHTML = "Player Stopped";
				document.getElementById("details_resolution").innerHTML = "";
				document.getElementById("details_duration").innerHTML = "";
	        	break;
	    	
	    	default:
	       	console(event.data);
	    }
	}
}

// Log websocket errors
connection.onerror = function (error) {
	showError('Pi connection error: ' + error);
	//console.log('WebSocket Error: ' + error);
};

// Connection closed
connection.onclose = function () {
  showError('Pi connection closed.');
  //console.log('WebSocket Closed.');
};

// send_message function to format messages for Kodi
function send_message(method, params) {
	var msg = {
		"jsonrpc": "2.0", 
		"method": method, 
		"id": method
	};
	
	if (params) {
		msg.params = params;
	}
	
	connection.send(JSON.stringify(msg));
}