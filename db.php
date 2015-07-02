<?php
// ====================================
// MySQL DB connector
// ====================================
// Author: Michael Walton
// Updated: 06/06/2015
// ====================================

// load the credentials file
require __DIR__.'/credentials.php';

// connect to the DB
$mysqli = new mysqli($db_hostname, $db_username, $db_password, $db);
if ($mysqli->connect_errno) {
    die(json_encode(array('Error'=>"Failed to connect to database: (" . $mysqli->connect_errno . ") " . $mysqli->connect_error)));
}
?>
