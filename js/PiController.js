// ===================================================
// PiController Object Constructor & Prototype
// ===================================================
// Author: Michael Walton 2015
// Updated:	25/06/2015
// Copyright: VIKING IT
// Desc: 
// ===================================================
var PiController = function(hostname, location, container) {
	// public attributes
	this.hostname = hostname;
	this.hostname_clean = hostname.replace(/\W/g, '');
	this.location = location || 'Location Unknown';

	this.connectionAttempts = 1;
	this.wsConnection;

	// display the controller on the dashboard
	this.showInterface(container);
}

PiController.prototype = {
	Constructor: PiController,

	// =============================================
	// open the WebSocket connection for this PiController
	// =============================================
	connect:function() {
		var self = this;
		this.wsConnection = new WebSocket('ws://' + this.hostname + ':9090/jsonrpc');

		// set connection state icon in the interface
		self.setStateIcon();

		// =============================================
		// WebSocket onclose event
		// =============================================
		this.wsConnection.onclose = function (event) {
			//console.log('[' + self.hostname + '] Listener triggered: onclose');

			// set connection state icon in the interface
			self.setStateIcon();

			// set thumbnail back to placeholder, name and details clear
			$('#thumb_' + self.hostname_clean).attr('src','img/pi_screen.png');
			$('#name_' + self.hostname_clean).html('');
			$('#details_' + self.hostname_clean).html('');

			// disable buttons
			$('#btn_refresh_' + self.hostname_clean).attr("disabled", "disabled");
			$('#btn_notify_' + self.hostname_clean).attr("disabled", "disabled");
			$('#btn_skip_' + self.hostname_clean).attr("disabled", "disabled");

			// attempt to reconnect using interval with generated back off
			var time = self.generateConnectionInterval(self.connectionAttempts);
			setTimeout(function () {
			    // We've tried to reconnect so increment the attempts by 1
			    self.connectionAttempts++;
			    
			    // attempt the reconnection overriding existing connection
			    self.connect();
			}, time);
		}

		// =============================================
		// WebSocket onopen event
		// =============================================
		this.wsConnection.onopen = function (event) {
			//console.log('[' + self.hostname + '] Listener triggered: onopen');

			// check if we have any active players
			self.sendMessage("Player.GetActivePlayers");

			// enable interface buttons
			$('#btn_refresh_' + self.hostname_clean).removeAttr("disabled");
			$('#btn_notify_' + self.hostname_clean).removeAttr("disabled");
			$('#btn_skip_' + self.hostname_clean).removeAttr("disabled");

			// set connection state icon in the interface
			self.setStateIcon();

			// reset connection attempts back to 1
	    	self.connectionAttempts = 1;
		}

		// =============================================
		// WebSocket onerror event
		// =============================================
		this.wsConnection.onerror = function (event) {
			//console.log('[' + self.hostname + '] Listener triggered: onerror');

			// set connection state icon in the interface
			self.setStateIcon();
		}

		// =============================================
		// WebSocket onmessage event
		// =============================================
		this.wsConnection.onmessage = function (event) {
			//console.log('[' + self.hostname + '] Listener triggered: onmessage');

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
									self.sendMessage("Player.GetItem", { 
										"playerid": j.result[0].playerid,
										"properties": ["file", "streamdetails"]
									});

									// get player properties
									self.sendMessage("Player.GetProperties", {
										"playerid": j.result[0].playerid,
										"properties": ["time", "percentage", "playlistid"]
									});
									break;

								// audio playing
								case 'audio':
									$('#name_' + self.hostname_clean).html("Audio content playing.");
									break;

								// pictures playing
								case 'picture':

									// get picture properties
									self.sendMessage("Player.GetItem", { 
										"playerid": j.result[0].playerid,
										"properties": ["file"]
									});

									// get playlist
									//self.sendMessage("Playlist.GetItems");
									
									break;

								// unknown content playing
								default:
									contenttype = 'unknown';
									$('#name_' + self.hostname_clean).html("Unknown media type playing.");
							}
						}else{
							// No active players
							$('#name_' + self.hostname_clean).html("Player stopped.");
						}

						break;
			
					// message containing item properties
					case "Player.GetItem":
						// grab item details
						var r = j.result.item;

						//console.log(r);

						// update the UI with item label
						$('#name_' + self.hostname_clean).html('Now Playing: ' + r.label);

						// update the UI with the playing item details based on content type
						switch(r.type) {
							
							// video playing
							case 'video':
								// video resolution
								$('#details_' + self.hostname_clean).html(
									'Resolution: ' + r.streamdetails.video[0].width + 'x' + r.streamdetails.video[0].height + "\n\r" +
			                		'<br />Duration: ' + r.streamdetails.video[0].duration + 's');
								break;

							// audio playing
							case 'audio':
								// no details at this time
								break;

							// picture playing
							case 'picture':
								// show thumbnail of image
								self.updateThumbnail(r.file, 0);
								break;

							// tv playing
							case 'channel':
								// no details at this time
								break;

							// unknown item
							default:
								console.log(r);
						}
						
						// set the filename value
						$('#path_' + self.hostname_clean).val(r.file);

						// set the initial thumbnail
						//self.updateThumbnail(r.file, 5);

						break;
					
					// message containing player properties
					case "Player.GetProperties":

						// generate the time for current offset (hh:mm:ss)
						var player_offset = j.result.time.hours + ':' + j.result.time.minutes + ':' + j.result.time.seconds;

						// update video thumbnail to current position
						if (j.result.type == 'video') self.updateThumbnail($('#path_' + self.hostname_clean).val(), player_offset);
						
						break;

					// message containing player GoTo result (ignore it)
					case "Player.GoTo":		
					break;

					// unknown response message
					default:
						console.log(j);
				}

			} else {

				// notification of an action on the Pi
				switch(j.method) {
					// player playing
			    	case "Player.OnPlay":
			        	self.sendMessage("Player.GetActivePlayers");
			        	break;
			    	
			    	// player stopped
			    	case "Player.OnStop":
			        	$('#name_' + self.hostname_clean).html("Player stopped.");
						$('#details_' + self.hostname_clean).html("");
			        	break;
					
					// system reboot
					case "System.OnRestart":
						//showError('Pi Rebooting...', 'warning');
						break;

			    	default:
			    		//showError('Unknown action performed on HOSTNAME-HERE', 'info');
			       		console.log(j);
			    }
			}
		}
	},

	// get connection state
	getState:function() {
		switch(this.wsConnection.readyState) {
			case 0:
				return 'Connecting';
				break;
			case 1:
				return 'Connected';
				break;
			case 2:
				return 'Disconnecting';
				break;
			case 3:
				return 'Disconnected';
				break;
			default:
				return 'Unknown';
		}
	},

	// ===================================================
	// !! functions/methods below here SHOULD become private
	// ===================================================

	// ===================================================
	// showInterface - add the controller to the interface
	// ===================================================
	// Parameter: element(string) - the html element ID to 
	// add the controller to
	// ===================================================
	showInterface:function(element) {
		//var dashboard = document.getElementById(element);

		// CANNOT USE INNERHTML IT DESTROYS ALL ELEMENTS AND EVENT LISTENERS THEN RECREATES ELEMENTS ONLY!!!! use appendchild or something else

		// add the container div using append child, the rest can be innerhtml! ;)

		// add the html for the controller interface
        $('#' + element).append('<div class="col-sm-6 col-md-4 pi-control" id="controller_' + this.hostname_clean + '">\n'
							+  '  <div class="thumbnail">\n'
							+  '    <img id="thumb_' + this.hostname_clean + '" src="img/pi_screen.png" alt="' + this.hostname + '">\n'
							+  '    <div class="caption">\n'
							+  '      <h4>' + this.hostname + ' <small id="status_' + this.hostname_clean + '"><span class="glyphicon glyphicon-refresh text-warning" aria-hidden="true"></span></small></h4>\n'
							+  '      <h3 style="margin-top: 0px">' + this.location + '</h3>\n'
							+  '      <!-- now playing -->\n'
							+  '      <h4 style="padding-top: 15px;" id="name_' + this.hostname_clean + '">&nbsp;</h4>\n'     
							+  '      <p id="details_' + this.hostname_clean + '">\n'
							+  '      </p>\n\n'
							+  '      <!-- playing video path -->\n'
							+  '      <input name="path_' + this.hostname_clean + '" id="path_' + this.hostname_clean + '" type="hidden" value="" />\n\n'
							+  '      <!-- controls -->\n'
							+  '      <p style="padding-top: 15px;">\n'
							+  '        <button disabled id="btn_refresh_' + this.hostname_clean + '" type="button" class="btn btn-warning">Refresh</button>\n'
							+  '        <button disabled id="btn_notify_' + this.hostname_clean + '" type="button" class="btn btn-success">Notify</button>\n'
							+  '        <button disabled id="btn_skip_' + this.hostname_clean + '" type="button" class="btn btn-danger">Skip</button>\n'
							+  '      </p>\n'
							+  '    </div>\n'
							+  '  </div>\n'
							+  '</div>\n\n');

		// add event listeners for interface buttons
		document.getElementById('btn_refresh_' + this.hostname_clean).addEventListener('click', this.refresh.bind(this), false);
		document.getElementById('btn_notify_' + this.hostname_clean).addEventListener('click', this.notify.bind(this), false);
		document.getElementById('btn_skip_' + this.hostname_clean).addEventListener('click', this.skip.bind(this), false);
	},

	// ===================================================
	// set the connection state icon in interface
	// ===================================================
	setStateIcon:function() {

		var icon = document.getElementById('status_' + this.hostname_clean);

		switch(this.wsConnection.readyState) {
			case 0:
				// Connecting
				icon.innerHTML = '<span class="glyphicon glyphicon-refresh text-warning" aria-hidden="true"></span>';
				break;
			case 1:
				// Connected
				icon.innerHTML = '<span class="glyphicon glyphicon-ok-circle text-success" aria-hidden="true"></span>';
				break;
			case 2:
				// Disconnecting
				icon.innerHTML = '<span class="glyphicon glyphicon-refresh text-warning" aria-hidden="true"></span>';
				break;
			case 3:
				// Disconnected
				icon.innerHTML = '<span class="glyphicon glyphicon-remove-circle text-danger" aria-hidden="true"></span>';
				break;
			default:
				// Unknown
		}
	},

	// =========================================================
	// generate reconnection interval based on how many
	// connection attempts have been made
	// =========================================================
	generateConnectionInterval:function(k) {
		var maxInterval = (Math.pow(2, k) - 1) * 1000;

		// If the generated interval is more than 30 seconds, truncate it down to 30 seconds.
		if (maxInterval > 30*1000) maxInterval = 30*1000;

		// generate the interval to a random number between 0 and the maxInterval determined from above
		return Math.random() * maxInterval;
	},

	// =========================================================
	// Format messages for Kodi WebSockets API
	// =========================================================
	sendMessage:function(method, params) {
		var msg = {
			"jsonrpc": "2.0", 
			"method": method, 
			"id": method
		};
		
		if (params) {
			msg.params = params;
		}
		
		this.wsConnection.send(JSON.stringify(msg));
	},

	// =========================================================
	// update the thumbnail for a controlled Pi
	// =========================================================
	updateThumbnail:function(path, offset) {
		$('#thumb_' + this.hostname_clean).attr('src','tools/get_thumb.php?path='+path+'&offset='+offset);
	},

	// =========================================================
	// refresh the Pi content (reboot method)
	// =========================================================
	refresh:function() {
		// refresh the player using the slideshow directory method
		/*send_message("Player.Open",
			"item":["directory":"/storage/slides/brisbane/pictures"],
			"properties": ["shuffled":true, "repeat":"all", "playlistid"]);
		*/
		self = this;

		// prompt for confirmation
		bootbox.dialog({
			title: 'Reboot Pi?', 
			message: 'This will reboot ' + this.hostname + ' and refresh the content. Do you wish to continue?', 
			buttons: {
			    success: {
			      label: 'No!',
			      className: 'btn-default',
			    },
			    danger: {
			      label: 'Yes, reboot!',
			      className: 'btn-danger',
			      callback: function() {
			        self.sendMessage("System.Reboot");
			      }
				}
			}
		});
	},

	// =========================================================
	// skip to the next item
	// =========================================================
	skip:function() {
		this.sendMessage("Player.GoTo", {
			"playerid": 2,
			"to": "next"
		});
	},

	// =========================================================
	// send a notification
	// =========================================================
	notify:function() {
		
		self = this;
		
		// prompt user for a notice
		bootbox.prompt({
			title: 'Notify Pi', 
			message: 'Enter the notice to display on screen:', 
			buttons: {
			    confirm: {
			      label: 'Display Notice!',
			      className: 'btn-danger'
				}
			},
		    callback: function(result) {
				// send the notice to the Pi
				self.sendMessage("GUI.ShowNotification", {
					"title": "PiControl Notice",
					"message": result
				});
	      	}
		});
	}
}