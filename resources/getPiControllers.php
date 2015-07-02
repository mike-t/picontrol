<?php
// =================================================================
// Returns PiControllers from DB as JSON
// =================================================================

// load DB connector
require __DIR__.'/../db.php';

// execute PiControllers mysql query
if(!$result = $mysqli->query("SELECT * FROM controllers ORDER BY controller_id")) die("Failed getting PiControllers: " . $mysqli->error);

// return the json encoded PiControllers
header('Content-Type: application/json');
echo(json_encode($result->fetch_all(MYSQLI_ASSOC)));

// free up mysqli resources
$result->free();
$mysqli->close();
?>