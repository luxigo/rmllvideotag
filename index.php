<?php

$args=array();

if (!empty($_GET['vid'])) {
	$args[]='vid='.$_GET['vid'];
}

if (!empty($_GET['num'])) {
	$args[]='num='.$_GET['num'];
}

passthru("/usr/local/bin/node extractplayer.js".(sizeof($args)?' '.join(' ',$args):''));
//print("/usr/local/bin/node extractplayer.js".(sizeof($args)?' '.join(' ',$args):''));

?>
