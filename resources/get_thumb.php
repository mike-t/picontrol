<?php
// ===================================================
// get_thumb - PHP Video Thumbnail Generator (ffmpeg)
// ===================================================
// Author: Michael Walton
// Updated:	09/06/2015
// Copyright: VIKING IT
// Desc: Generates a thumbnail from provided video
//		 file path and offset (in seconds).
// TODO: * use 500 instead of die?
//		 * proper replace string to suit all campuses
//		 * if failure return the pi_thumb.png
// ===================================================

// ===================================================
// check required parameters have been supplied
// ===================================================
if (!isset($_GET['path']) || !isset($_GET['offset'])) die('No valid path or offset provided.');
if ($_GET['path'] == '' || $_GET['offset'] == '') die('No valid path or offset provided.');

// esacpe the user input
$path = escapeshellarg($_GET['path']);
$offset = escapeshellarg($_GET['offset']);

// ===================================================
// SET DEFAULTS
// ===================================================
//$offset = '00:00:50';
$size = '640x360';

// replace the Pi's locally cached path dir with real dir
$path = str_replace('localslides', 'slides', $path);

// check media path exists,log error and return the placeholder thumb if not
/*if (!file_exists($path)) {
	// log the error
	error_log('Media path does not exist or is not readable: '.$path.'.');
	// set path to the placeholder image
	$path = __DIR__ . '/../img/pi_screen.png';
}*/

// check ffmpeg exists
if (empty(shell_exec("which ffmpeg"))) {
	// log the error
	error_log('ffmpeg binary not available, check if it is installed.');
	// set path to the placeholder image
	$path = __DIR__ . '../img/pi_screen.png';
}

// ===================================================
// Set HTTP header and return image (JPEG)
// ===================================================
header('Content-Type: image/jpeg');
header("Pragma: no-cache");
header("Expires: 0");

// generate the thumbnail
//passthru("ffmpeg -ss 00:00:10 -i /storage/localslides/brisgroundppt.mp4 -s 640x480 -frames:v 1 -f mjpeg pipe:1");
passthru("ffmpeg -ss $offset -i $path -s $size -frames:v 1 -f mjpeg pipe:1");

// cleanly exit
exit();
?>