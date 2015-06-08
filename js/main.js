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
/*
$(function() {
});
*/
/*
// connect manually to BNEPI-08-01 using xmbc-ws library
var kodi = require('xbmc-ws');
kodi('10.0.6.116', 9090).then(function(connection) {

    // listen for playlist changes
    connection.Player.OnPause(function() {

 		// get playlist item
		//{"jsonrpc": "2.0", "method": "Playlist.GetItems", "params": { "properties": [ "runtime", "showtitle", "season", "title", "artist" ], "playlistid": 1}, "id": 1}

		var nowplaying = connection.Playlist.GetItems({
		    properties: ['title', 'runtime', 'year'],
		    playlistid: 1
		});

	    	// update output
		console.log('Playing: ' + nowplaying);
	});

    // blah
	connection.Application.SetMute(true);

}); // end connection ?
*/

// connect manually to BNEPI-08-01 using socket.io library
//var socket = io.connect("ws://10.0.6.116:9090/jsonrpc");

// user browser's websocket implementation
//var connection = new WebSocket('ws://10.0.6.116:9090/jsonrpc');
var connection = new WebSocket('ws://192.168.1.10:9090/jsonrpc');

connection.onopen = function (event) {
	send_message("Player.GetActivePlayers");
}

connection.onmessage = function (event) {
	var j = JSON.parse(event.data);

	console.log(j);

	if (j.id) { 

		// response
		switch(j.id) {
			case "Player.GetActivePlayers":
				var r = j.result[0];
				if (r.type == 'video') {
					send_message("Player.GetItem", { 
					"properties": ["file", "streamdetails"], 
					"playerid": r.playerid,
					});
				}
				break;
			
			case "Player.GetItem":
				//alert(event.data);
				var r = j.result.item;
				document.getElementById("name").innerHTML = r.label;
				document.getElementById("file").innerHTML = r.file;
				var v = r.streamdetails.video[0];
				document.getElementById("details").innerHTML = v.width + 'x' + v.height + ', ' + v.duration + 's';
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
	        	document.getElementById("file").innerHTML = "";
	        	document.getElementById("details").innerHTML = "";
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