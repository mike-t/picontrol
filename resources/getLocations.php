<?php
// =================================================================
// Returns PiControl locations from DB as JSON
// =================================================================

// load DB connector
require __DIR__.'/../db.php';

// execute PiControl locations mysql query
if(!$result = $mysqli->query("SELECT * FROM locations ORDER BY location_id")) die("Failed getting PiController locations: " . $mysqli->error);

// return the json encoded locations
header('Content-Type: application/json');
echo(json_encode($result->fetch_all(MYSQLI_ASSOC)));

// free up mysqli resources
$result->free();
$mysqli->close();
?>