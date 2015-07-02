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
// Event Listener - filter form button click
// =========================================================
function applyFilter() {
	switch ($('#filter-campus').val()) {
		case 'all':
			$('#controller-dashboard-bne').fadeIn();
			$('#controller-dashboard-mlb').fadeIn();
			break;

		case 'bne':
			$('#controller-dashboard-bne').fadeIn();
			$('#controller-dashboard-mlb').fadeOut();
			break;

		case 'mlb':
			$('#controller-dashboard-bne').fadeOut();
			$('#controller-dashboard-mlb').fadeIn();
			break;
	}
}

// =========================================================
// Document Ready
// =========================================================
$(function() {
    // Usage PiController(address/hostname, html element id to add controller to)
    //pi0 = new PiController('192.168.1.10', 'Mike\'s Home', 'controller-dashboard');
    pi1 = new PiController('10.60.34.223', 'Brisbane Level 8 IT', 'controller-dashboard-bne');
    pi2 = new PiController('10.60.129.147', 'Melbourne Level G Bookstore', 'controller-dashboard-mlb');
    pi3 = new PiController('10.0.6.53', 'Brisbane Level G Bookstore', 'controller-dashboard-bne');
    pi4 = new PiController('10.60.128.227', 'Melbourne Level 1 Clinic', 'controller-dashboard-mlb');
	pi5 = new PiController('10.10.6.29', 'Perth Ground Floor Library', 'controller-dashboard-pth');
	//pi6 = new PiController('x.x.x.x', 'x', 'controller-dashboard-adl');
	//pi7 = new PiController('x.x.x.x', 'x', 'controller-dashboard-syd');

    // open the connections
    //pi0.connect();
    pi1.connect();
    pi2.connect();
    pi3.connect();
    pi4.connect();
	pi5.connect();
	//pi6.connect();
	//pi7.connect();
});