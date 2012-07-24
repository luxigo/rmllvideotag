#!/usr/local/bin/node
// extract player from http://mediaserver.unige.ch video url
// eg https://mediaserver.unige.ch/play/75638

var fs=require('fs');
var child_process=require('child_process');
var jsdom=require('jsdom');

main();

function main() {
	var options={};
	var i=2;
	while (process.argv[i]) {
		param=process.argv[i].split('=');
		options[param[0]]=param[1];
		++i;
	}

	if (Object.keys(options).length) {
		extractVideo(options);
	} else {
		buildHTML();
	}
}

function extractVideo(options) {
	
	var wget=child_process.exec(
		'wget -O - --no-check-certificate https://mediaserver.unige.ch/play/'+options.vid,
		function(err,stdout,stderr) {
			buildHTML(options,err,stdout,stderr);
		}
	);
}

function buildHTML(options,err,stdout,stderr){
	if (err) {
		console.log(stderr);
		throw(err);
	}

	var uni_head='<meta http-equiv="Content-Type" content="text/html; charset=utf-8">';
//	uni_head+='<title> </title>';
	uni_head+='<link rel="stylesheet" type="text/css" href="https://mediaserver.unige.ch/css/mediaserver.css">';
//	uni_head+='<link rel="stylesheet" type="text/css" href="https://mediaserver.unige.ch/css/agenda.css">';
//	uni_head+='<link rel="stylesheet" type="text/css" href="https://mediaserver.unige.ch/css/datePicker.css">';
//	uni_head+='<link rel="stylesheet" type="text/css" href="https://mediaserver.unige.ch/css/jquery-ui.css">';
//	uni_head+='<link rel="stylesheet" type="text/css" href="https://mediaserver.unige.ch/css/jquery.tooltip.css">';
//	uni_head+='<link rel="stylesheet" type="text/css" href="https://mediaserver.unige.ch/css/jquery.autocomplete.css">';
	uni_head+='<script type="text/javascript" src="https://mediaserver.unige.ch/js/jquery.js"></script>';
//	uni_head+='<script type="text/javascript" src="https://mediaserver.unige.ch/js/jquery.bgiframe.js"></script>';
//	uni_head+='<script type="text/javascript" src="https://mediaserver.unige.ch/js/jquery-ui.min.js"></script>';
//	uni_head+='<script type="text/javascript" src="https://mediaserver.unige.ch/js/jquery.form.js"></script>';
//	uni_head+='<script type="text/javascript" src="https://mediaserver.unige.ch/js/jquery.tooltip.pack.js"></script>';
//	uni_head+='<script type="text/javascript" src="https://mediaserver.unige.ch/js/mediaserver.js"></script>';
//	uni_head+='<script type="text/javascript" src="https://mediaserver.unige.ch/js/jquery.tools.min.js"></script>';
//	uni_head+='<script type="text/javascript" src="https://mediaserver.unige.ch/js/date.js"></script>';
//	uni_head+='<script type="text/javascript" src="https://mediaserver.unige.ch/js/jquery.datePicker.js"></script>';
//	uni_head+='<script type="text/javascript" src="https://mediaserver.unige.ch/js/cake.datePicker.js"></script>';
	uni_head+='<script type="text/javascript" src="https://mediaserver.unige.ch/js/swfobject.js"></script>';
//	uni_head+='<link rel="stylesheet" type="text/css" href="https://mediaserver.unige.ch/uploader/css/ubr.css">';
//	uni_head+='<script type="text/javascript" src="https://mediaserver.unige.ch/uploader/js/jquery.blockUI.js"> </script>';
//	uni_head+='<script type="text/javascript" src="https://mediaserver.unige.ch/uploader/js/ubr_file_upload.js"></script>';
	uni_head+='</script> <script type="text/javascript" src="https://mediaserver.unige.ch/js/jwplayer.js"></script>';
	uni_head+='<script src="http://lp.longtailvideo.com/5/timeslidertooltipplugin/timeslidertooltipplugin.js"></script>';
	var uni_vidzleft='';
	var uni_vidzright='';
	var message='';

	function putItTogether() {
		var html='<html><head>';
		html+='<link rel="stylesheet" type="text/css" href="rmllvideotag.css" />';
		html+=uni_head;
		html+='<script type="text/javascript" src="rmllvideotag.js"></script>';
		html+='</head><body><div id="_content">';
		html+='<iframe id="vidz"></iframe>';
		html+='<div id="vid">';
		html+=message;
		html+=uni_vidzleft;
		html+=uni_vidzright;
		html+='</div><!-- vid -->';
		html+='</div><!-- content -->';
		html+='<iframe id="prog"></iframe>';
		html+='</body></html>';
		console.log(html);
	}

	if (stdout) {
		stdout=stdout.replace(/src=\"\//g,'src="https://mediaserver.unige.ch/');
		stdout=stdout.replace(/href=\"\//g,'href="https://mediaserver.unige.ch/');
		stdout=stdout.replace(/: \'\//g,': \'https://mediaserver.unige.ch/');
		jsdom.env(stdout,['http://code.jquery.com/jquery-1.5.min.js'],function(errors,window){
			uni_head=window.$('head').html();
			uni_vidzleft=window.$("div#vidzLeft")[0].outerHTML.replace(/player.swf\",/,'player.swf\", \'controlbar.idlehide\': false,');
			window.$('div.vidzMoreCollectionTitle').next('ul').remove();
			window.$('div.vidzMoreCollectionTitle').remove();
			var div='<div id="punch">';
			div+='<table><tr><td>num</td><td>part</td><td>de</td><td>à</td><td></td></tr>';
			div+='<tr><td><input class="conf_id" type="number" min="1"'+((options.num!=undefined)?' value="'+options.num+'"':'')+'></td><td><input class="conf_chunk" type="number" min="1"></td><td><input class="conf_from" type="text"></td><td><input class="conf_to" type="text"></td><td><input class="chunk_save" type="button" value="+"></td></tr>';
			div+='</table></div>';
			div+='<div class="chunks"><table></table></div>';
			div+='<input type="button" id="save" value="Save">';
			uni_vidzright=window.$("div#vidzRight").append(div)[0].outerHTML;

			var html='';
			html+=uni_vidzleft;
			html+=uni_vidzright;
			console.log(html);
		});
	
	} else {	
		message=fs.readFileSync('message.html');
		putItTogether();
	}
}

