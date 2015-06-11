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

// CLEAN THESE! INJECTION!
$path = escapeshellarg($_GET['path']);
$offset = escapeshellarg($_GET['offset']);
//$path = '/home/mike/www/picontrol/tools/video-samples/Star-Wars-VII-Trailer.mp4';
//$offset = '00:00:50';
$size = '640x360';

// tmp
$path = str_replace('localslides', 'slides/brisbane/videos', $path);

// check video path and offset supplied or 501?

// check video path exists else 404 or 501?



// ===================================================
// Set HTTP header and return image (PNG)
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