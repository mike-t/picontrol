// ===================================================
// PiController Object Constructor & Prototype
// ===================================================
// Author: Michael Walton 2015
// Updated:	09/06/2015
// Copyright: VIKING IT
// Desc: 
// ===================================================
var PiController = function(hostname) {
	this.hostname = hostname;
	this.connectionAttempts = 1;
	this.wsConnection;
}

PiController.prototype = {
	Constructor: PiController,

	// open the WebSocket connection for this PiController
	connect:function() {
		var parent = this;
		this.wsConnection = new WebSocket('ws://' + this.hostname + ':9090/jsonrpc');

		// listener for the webSocket onclose event
		this.wsConnection.onclose = function (event) {
			console.log('[' + parent.hostname + '] Listener triggered: onclose');
		}

		// listener for the webSocket onopen event
		this.wsConnection.onopen = function (event) {
			console.log('[' + parent.hostname + '] Listener triggered: onopen');
		}

		// listener for the webSocket onerror event
		this.wsConnection.onerror = function (event) {
			console.log('[' + parent.hostname + '] Listener triggered: onerror');
		}

		// listener for the webSocket onmessage event
		this.wsConnection.onmessage = function (event) {
			console.log('[' + parent.hostname + '] Listener triggered: onmessage');
		}
	},

	// hostname property
	hostname:function() {
		return this.hostname;
	},

	// connection state property
	getState:function() {
		switch(this.wsConnection.readyState) {
			case 0:
				return 'Connecting';
				break;
			case 1:
				return 'Open';
				break;
			case 2:
				return 'Closing';
				break;
			case 3:
				return 'Closed';
				break;
			default:
				return 'Unknown';
		}
	}
}

/*

// =========================================================
// Attempt to connect to the Pi's using the browser's websocket 
// implementation and listen to each event for new data.
// =========================================================
var attempts = 1;
var connection;
var server = 'ws://10.60.34.223:9090/jsonrpc';

// kick off first connection!
//showError('Connecting to ' + server, 'info');
createWebSocket(connection, server);
 
function createWebSocket(connection, server) {
	//var server = 'ws://10.40.1.40:9090/jsonrpc
	//var server = 'ws://10.0.6.118:9090/jsonrpc';

	// attempt a new connection to the pi
	connection = new WebSocket(server);

	// =========================================================
	// Connection Open
	// =========================================================
	connection.onopen = function () {
		// check if we have any active players
		send_message("Player.GetActivePlayers");

		// clear any errors
		showError();

		// enable buttons
		$("#btn_refresh_BNE-PI-LG01").removeAttr("disabled");
		$("#btn_notify_BNE-PI-LG01").removeAttr("disabled");
		$("#btn_skip_BNE-PI-LG01").removeAttr("disabled");

		// set connection status light on the UI
		// TODO

		// reset connection attempts back to 1
    	attempts = 1;
	}

	// =========================================================
	// Connection Close
	// =========================================================
	connection.onclose = function (event) {
		showError('<strong>Error!</strong> Pi connection lost. Attempting to reconnect..');

		// attempt to reconnect using staggered interval
		var time = generateInterval(attempts);
		setTimeout(function () {
		    // We've tried to reconnect so increment the attempts by 1
		    attempts++;
		    
		    // Connection has closed so try to reconnect every 10 seconds.
		    createWebSocket(); 
		}, time);

		// set thumbnail back to placeholder, name and details clear
		$("#thumb_BNE-PI-LG01").attr('src','img/pi_screen.png');
		$("#name_BNE-PI-LG01").html('');
		$("#details_BNE-PI-LG01").html('');

		// disable buttons
		$("#btn_refresh_BNE-PI-LG01").attr("disabled", "disabled");
		$("#btn_notify_BNE-PI-LG01").attr("disabled", "disabled");
		$("#btn_skip_BNE-PI-LG01").attr("disabled", "disabled");
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
								$("#name_BNE-PI-LG01").html("Audio content playing.");
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
								$("#name_BNE-PI-LG01").html("Unknown media type playing.");
						}
					}else{
						// No active players
						$("#name_BNE-PI-LG01").html("Player stopped.");
					}

					break;
		
				// message containing item properties
				case "Player.GetItem":
					// grab item details
					var r = j.result.item;

					//console.log(r);

					// update the UI with item label
					$("#name_BNE-PI-LG01").html(r.label);

					// update the UI with the playing item details based on content type
					switch(r.type) {
						
						// video playing
						case 'video':
							$("#details_BNE-PI-LG01").html(
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
					$("#path_BNE-PI-LG01").val(r.file);

					// set the initial thumbnail
					//updateThumbnail(r.file, 5);

					break;
				
				// message containing player properties
				case "Player.GetProperties":

					// generate the time for current offset (hh:mm:ss)
					var player_offset = j.result.time.hours + ':' + j.result.time.minutes + ':' + j.result.time.seconds;

					// update the video thumbnail to current position
					updateThumbnail($("#path_BNE-PI-LG01").val(), player_offset);
					
					break;

				// message containing player GoTo result (ignore it)
				case "Player.GoTo":				
				break;

				// unknown response message
				default:
					showError('Unknown response message recieved from Pi', 'info');
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
		        	$("#name_BNE-PI-LG01").html("Player stopped.");
					$("#details_BNE-PI-LG01").html("");
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

	// =========================================================
	// generate reconnection interval based on how many
	// connection attempts have been made
	// =========================================================
	function generateInterval(k) {
		var maxInterval = (Math.pow(2, k) - 1) * 1000;

		// If the generated interval is more than 30 seconds, truncate it down to 30 seconds.
		if (maxInterval > 30*1000) maxInterval = 30*1000;

		// generate the interval to a random number between 0 and the maxInterval determined from above
		return Math.random() * maxInterval;
	}

	// =========================================================
	// send_message function to format messages for Kodi
	// =========================================================
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
}
*/