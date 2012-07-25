#!/usr/local/bin/node
var fs=require('fs');
var allVidz=JSON.parse(fs.readFileSync('rmllVidz.json'));

main();

function main() {
	
	var html='<html>';
	html+=HEAD();
	html+='<body>';
  	html+='<div data-role="page" id="rmllvidz">';
	html+='<div data-role="content">';

	html+='<div data-role="header" data-position="fixed">';
	html+='<h1>Vidéos</h1>';
	html+='</div>';

	html+='<ul data-role="listview" data-filter="true">';
	allVidz.forEach(function(event,i){
		var vid=event.url.split('/').pop();
		html+='<li data-id="'+event.id+'" data-vid="'+vid+'"><a>';
		html+='<table><tr><td class="vid">'+vid+'</td><td class="eventid">'+event.id+'</td><td class="etitle">'+event.title+'</td></tr></table>';
		html+='</a></li>';
	});
	html+='</ul>';
	html+='</div>';
	html+='</div>';
	html+='</body>';
	html+='</html>';
	console.log(html);
}

function HEAD() {
  var html='<head>';
  html+='<meta charset="utf-8">';
  html+='<meta name="viewport" content="width=device-width, initial-scale=1">';
  html+='<link rel="stylesheet" href="themes/rmll.css" />'
  html+='<link rel="stylesheet" href="jquery.mobile.css" />';
  html+='<link rel="stylesheet" href="rmllvidz.css" />';
  html+='<script src="jquery.js"></script>';
  html+='<script src="_rmllvidz.js"></script>';
  html+='<script src="jquery.mobile.js"></script>';
  html+='</head>';
  return html;
}

