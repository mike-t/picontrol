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
// update the thumbnail for a controlled Pi
// =========================================================
function updateThumbnail(path, offset) {
	$("#thumb_BNE-PI-01").attr('src','tools/get_thumb.php?path='+path+'&offset='+offset);
}

// =========================================================
// refresh the Pi content (reboot method)
// =========================================================
function refresh() {
	// refresh the player using the slideshow directory method
	/*send_message("Player.Open",
		"item":["directory":"/storage/slides/brisbane/pictures"],
		"properties": ["shuffled":true, "repeat":"all", "playlistid"]);
	*/

	// prompt for confirmation
	bootbox.dialog({
		message: 'This will reboot the Pi and refresh the content. Do you wish to continue?', 
		buttons: {
		    success: {
		      label: 'No!',
		      className: 'btn-default',
		    },
		    danger: {
		      label: 'Yes, reboot!',
		      className: 'btn-danger',
		      callback: function() {
		        if (result) send_message("System.Reboot");
		      }
			}
		}
	});
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
// Attempt to connect to the Pi's using the browser's websocket 
// implementation and listen to each event for new data.
// =========================================================
var connector;
var connection;
var server = 'ws://10.0.6.116:9090/jsonrpc';
var server = 'ws://10.0.6.118:9090/jsonrpc';

// attempt a new connection to the pi
connection = new WebSocket(server);

// =========================================================
// Connection Open
// =========================================================
connection.onopen = function (event) {
	// check if we have any active players
	send_message("Player.GetActivePlayers");

	// stop the connector from attempting reconnect
	clearTimeout(connector);

	// clear any errors
	showError();

	// set connection status light on the UI
	// TODO
}

// =========================================================
// Connection Close
// =========================================================
connection.onclose = function (event) {
	showError('<strong>Error!</strong> Pi connection lost.');

	// set thumbnail back to placeholder, name and details clear
	$("#thumb_BNE-PI-01").attr('src','img/pi_screen.png');
	$("#name_BNE-PI-01").html('');
	$("#details_BNE-PI-01").html('');

	// attempt a new connection every 10 seconds
	/* connector = setTimeout(function(){ 
		connection = new WebSocket(server);
	}, 10000); */

	// attempt a new connection to the pi
	connection = new WebSocket(server);
	alert('attempting connection');
	console.log(event);
};

// =========================================================
// Connection Error
// =========================================================
connection.onerror = function (error) {
	showError('<strong>Error!</strong> Pi connection error: ' + error);
	//console.log('WebSocket Error: ' + error);
};

// =========================================================
// Connection Message
// =========================================================
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
								"properties": ["file", "streamdetails"]
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
								"properties": ["file"]
							});

							// get playlist
							//send_message("Playlist.GetItems");
							
							break;

						// unknown content playing
						default:
							contenttype = 'unknown';
							$("#name_BNE-PI-01").html("Unknown media type playing.");
					}
				}else{
					// No active players
					$("#name_BNE-PI-01").html("Player stopped.");
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
						updateThumbnail(r.file, 0);
						break;
				}
				
				// set the filename value
				$("#path_BNE-PI-01").val(r.file);

				// set the initial thumbnail
				//updateThumbnail(r.file, 5);

				break;
			
			// message containing player properties
			case "Player.GetProperties":

				// generate the time for current offset (hh:mm:ss)
				var player_offset = j.result.time.hours + ':' + j.result.time.minutes + ':' + j.result.time.seconds;

				// update the video thumbnail to current position
				updateThumbnail($("#path_BNE-PI-01").val(), player_offset);
				
				break;

			// unknown response message
			default:
				showError('Unknown response message recieved from HOSTNAME-HERE', 'info');
				console.log(j);
		}

	} else {

		// notification of an action on the Pi
		switch(j.method) {
			// player playing
	    	case "Player.OnPlay":
	        	send_message("Player.GetActivePlayers");
	        	break;
	    	
	    	// player stopped
	    	case "Player.OnStop":
	        	$("#name_BNE-PI-01").html("Player stopped.");
				$("#details_BNE-PI-01").html("");
	        	break;
			
			// system reboot
			case "System.OnRestart":
				showError('Pi Rebooting...', 'warning');

	    	default:
	    		//showError('Unknown action performed on HOSTNAME-HERE', 'info');
	       		console.log(j);
	    }
	}
}

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