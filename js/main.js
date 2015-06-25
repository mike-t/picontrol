// =========================================================
// showLoading - shows or hides a loading animation
// =========================================================
function showLoading(msg) {
	msg = msg || null;
	
	if (msg == null) {
		// hide loading message
		$('#form_button').html('Filter &raquo;');
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
$(function() {
	// Usage PiController(address/hostname, html element id to add controller to)
	pi1 = new PiController('10.60.34.223', 'controller-dashboard');
	pi2 = new PiController('10.60.129.147', 'controller-dashboard');
	pi3 = new PiController('BNEPI-LG-01', 'controller-dashboard');
	
	// open the connections
	pi1.connect();
	pi2.connect();
	pi3.connect();

	// update the connection status on the device
	/*setInterval(function() {
		console.log('State (' + test.hostname() + '): ' + test.getState());
	}, 3000);
	*/
});