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
function showError(msg, level) {

	msg = msg || null;
	level = level || 'danger';

	if (msg == null) {
		// hide error
		$('#error').fadeOut;
		$('#error').html('');
	}else{
		// show error
		$('#error').html('<hr class="noprint" /><div class="alert alert-'+level+' alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'+ msg +'</div>');
		$('#error').fadeIn();
	}
}

// =========================================================
// Document Ready
// =========================================================

// NEED A BETTER WAY TO ASYNCHRONOSLY HANDLE GETTING PLAYER POSITION AND FILENAME, thus updated thumb etc.
/*$(function() {
	// every 5 seconds update the playing video status and thumbnail
	setInterval(function() {
		// get updated player properties
		send_message("Player.GetProperties", {
			"playerid": 1,   // <-- could be a problem, manually set!
			"properties": ["time", "percentage", "playlistid"]
		});
	}, 5000);
});*/

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
	// check if we have any active players
	send_message("Player.GetActivePlayers");
}

connection.onmessage = function (event) {
	var j = JSON.parse(event.data);

	if (j.id) { 

		// determine which kind of message we have recieved
		switch(j.id) {

			// message containing active players
			case 'Player.GetActivePlayers':

				// check if we have an active player
				if (j.result[0]) {

					// determine which type of media is playing
					switch(j.result[0].type) {

						// video playing
						case 'video':

							// get video properties
							send_message("Player.GetItem", { 
								"playerid": j.result[0].playerid,
								"properties": ["file", "thumbnail"]
							});

							// get player properties
							send_message("Player.GetProperties", {
								"playerid": j.result[0].playerid,
								"properties": ["time", "percentage", "playlistid"]
							});
							break;

						// audio playing
						case 'audio':
							$("#name_BNE-PI-01").html("Audio content playing.");
							break;

						// pictures playing
						case 'picture':

							// get picture properties
							send_message("Player.GetItem", { 
								"playerid": j.result[0].playerid,
								"properties": ["file", "streamdetails"]
							});
							
							break;

						// unknown content playing
						default:
							contenttype = 'unknown';
							$("#name_BNE-PI-01").html("Unknown media type playing.");
					}
				}else{
					// No active players
					$("#name_BNE-PI-01").html("Player Stopped.");
				}

				break;
	
			// message containing item properties
			case "Player.GetItem":
				// grab item details
				var r = j.result.item;

				//console.log(r);

				// update the UI with item label
				$("#name_BNE-PI-01").html(r.label);

				// update the UI with the playing item details based on content type
				switch(r.type) {
					
					// video playing
					case 'video':
						$("#details_BNE-PI-01").html(
							'Resolution: ' + r.streamdetails.video[0].width + 'x' + r.streamdetails.video[0].height + "\n\r" +
	                		'<br />Duration: ' + r.streamdetails.video[0].duration + 's');
						break;

					// audio playing
					case 'audio':
						// no details at this time
						break;

					// picture playing
					case 'picture':
						// no details at this time
						break;
				}
				
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

			// unknown response message
			default:
				showError('Unknown response message recieved from HOSTNAME-HERE', 'info');
				console(event.data);
		}

	} else {

		// notification of an action on the Pi
		switch(j.method) {
	    	case "Player.OnPlay":
	        	send_message("Player.GetActivePlayers");
	        	break;
	    	
	    	case "Player.OnStop":
	        	$("#name_BNE-PI-01").html("Player Stopped.");
				$("#details_BNE-PI-01").html("");
	        	break;
	    	
	    	default:
	    		showError('Unknown action performed on HOSTNAME-HERE', 'info');
	       		console(event.data);
	    }
	}
}

// Log websocket errors
connection.onerror = function (error) {
	showError('<strong>Error!</strong> Pi connection error: ' + error);
	//console.log('WebSocket Error: ' + error);
};

// Connection closed
connection.onclose = function () {
  showError('<strong>Error!</strong> Pi connection lost.');
  // TRY TO RECONNECT HERE AFTER 10 seconds...
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