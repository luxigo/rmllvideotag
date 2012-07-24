var sys = require('util'),
    fs = require('fs'),
    xml2js = require('xml2js');

var result=[];

var en={};


var parser = new xml2js.Parser();
parser.addListener('end',function(xml, error) {
    if (!error) {
//      console.log(JSON.stringify(xml));
 //     process.exit(0);
        conferences_getCurrent(xml);
    }
    else {
        console.error(error);
    }
//    console.log('Done.');
});

fs.readFile( 'prog.xml', function(err, data) {
    if (!parser.parseString(data)) {
    //  console.log('xml2js: successfully parsed file.');
  //  }
  //  else {
      console.error('xml2js: parse error: "%s"', parser.getError());
    }
});

var _date;
var date;
var now;
var hours;
var minutes;
var thisday;

function twoDigits(a) {
  return (parseInt(a,10)>9)?a:'0'+a;
}

function upDate() {
	_date=new Date;
	date=_date.getFullYear()+'-'+twoDigits(_date.getMonth()+1)+'-'+twoDigits(_date.getDate());
	hours=_date.getHours();
	minutes=_date.getMinutes();

////	date="2012-07-10";
	now=_date.getDate()*1440*hours*60+minutes;
//// now=10*60;
//// hours=11;
//// minutes=0;
}

function conferences_getCurrent(prog) {
//        console.log(sys.inspect(prog,false,100001));

  upDate();

	function event_process(event) {
    event.date=thisday;
    var day=parseInt(thisday.split('-')[2],10);
		var start=event.start.split(':');
		event.start_time=parseInt(start[0],10)*60+parseInt(start[1],10);
		
		var duration=event.duration.split(':');
		var duration_time=parseInt(duration[0],10)*60+parseInt(duration[1],10);
    event.end_time=event.start_time+duration_time;

		var end_hours=Math.floor((event.start_time+duration_time)/60).toString();
		var end_minutes=(event.start_time+duration_time-end_hours*60).toString();
		event.end=twoDigits(end_hours)+':'+twoDigits(end_minutes);

    event.start_time+=day*1440;
    event.end_time+=day*1440;
/*
		if (now>=event.start_time && now<=event.end_time) {
			result.push(event);
		} else if (event.start_time-now < 120) {
			result.push(event);
		}
   */
   result.push(event);
	}

	function room_process(room) {
		var room_name=room['@'].name;
		if (Array.isArray(room.event)) {
			room.event.forEach(function(event) {
				event_process(event);
			});
		} else {
			event_process(room.event);
		}
	}

	prog.day.forEach(function(day) {
      thisday=day['@'].date;
//		if(thisday==date) {
			if (Array.isArray(day.room)) {
				day.room.forEach(function(room) {
					room_process(room);
				}); 
			} else {
				room_process(day.room);
			}
//		}
	});

  result.sort(function(a,b){
    var delta=a.start_time-b.start_time;
    if (!delta) {
      return a.end_time-b.end_time;
    } else  {
      return delta;
    }
  });

  var html=''; //<!DOCTYPE html>';
  html+='<html>';
  html+=HEAD();
  html+='<body>';
  html+=index(result);
  html+=pages(result);
  html+='</body>';
  html+='</html>';

  console.log(html);
//  console.log(JSON.stringify(result));

}


function HEAD() {
  var html='<head>';
  html+='<meta charset="utf-8">';
  html+='<meta name="viewport" content="width=device-width, initial-scale=1">';
  html+='<title>RMLL Now !</title>';
  html+='<link rel="shortcut icon" href="favicon.ico" />';
  html+='<link rel="stylesheet" href="themes/rmll.css" />'

  html+='<link rel="stylesheet" href="jquery.mobile.css" />';
  html+='<link rel="stylesheet" href="rmllnow.css" />';
  html+='<script src="jquery.js"></script>';
  html+='<script src="_rmllnow.js"></script>';
  html+='<script src="jquery.mobile.js"></script>';
  html+='</head>';
  return html;
}

function header(name,title) {
  var html='<!-- start of page: #'+name+' -->';
  html+='<div data-role="page" id="'+name+'">';
  html+='<div data-role="header" data-position="fixed">';
  if (name=='index') {
    html+='<a href onclick="setTimeout(moreless,0)" id="moreless" data-position="left" data-role="button" data-icon="plus" data-iconpos="notext"></a>';
  } else {
    html+='<a href onclick="document.location.assign(\'#\')" id="home" data-position="left" data-role="button" data-icon="home" data-iconpos="notext"></a>';
    html+='<a href id="next" onclick="next()" class="arrow_right" data-role="button" data-position="right" data-icon="arrow-r" data-iconpos="notext"></a>';
  }

  html+='<h1>'+title+'</h1>';
  html+='</div><!-- /header -->';
  html+='<div data-role="content">';
  return html;
}
 
function index(list) {
  
  var html=header('index','Programme RMLL 2012');

  html+="<div id=\"nothing\" data-role=\"popup\"><center>Aucun événement à afficher<center></div>";

  html+=confListView(list);

  html+=footer();
  return html;
}

function confListView(list) {
  var html='<ul data-role="listview" data-filter="true">';
	list.forEach(function(event){
    html+='<li data-d="'+event.date+'" data-s="'+event.start_time+'" data-e="'+event.end_time+'"><a href="#_'+event['@'].id+'">';
    html+=event['@'].id+' - '+event.title;
    html+='<span class="details">'+(event_type[lang][event.type]?' &nbsp;('+event_type[lang][event.type]+' &mdash; '+event.track+')':'('+event.track+')')+'</span>';
    var who=intervenants(event,true);
    html+=who.length?'<div class="who">'+who+'</div>':'';
    html+='<div class="sec">';
    html+=event.date+' &mdash; '+event.start+' - '+event.end+' &nbsp;';
    html+=event.room;
    html+='</div>';
    html+='</a></li>';
	});
  html+='</ul>';
  return html;
} 

var event_type={
  fr : {
    plen: 'Plénière',
    conf: 'Conférence',
    atl: 'Atelier',
    ligtal: 'Lightning talk',
    ag: 'Assemblée générale',
    tabler: 'Table ronde'
  },
  en: {
    plen: 'Plénière',
    conf: 'Conférence',
    atl: 'Atelier',
    ligtal: 'Lightning talk',
    ag: 'Assemblée générale',
    tabler: 'Table ronde'
  }
};

var lang='fr';

function t(txt) {
  if (lang=="fr") return txt;
  return en[txt]?en[txt]:txt;
}

function pages(list) {
  var html='';
	list.forEach(function(event){
    html+=header('_'+event['@'].id,event.date+' &mdash; '+event.start+' - '+event.end);
    html+='<h3 class="track">'+event.track+'</h3>';
    html+='<h2>'+event['@'].id+' - '+event.title+(event_type[lang][event.type]?' <span class="etype">('+event_type[lang][event.type]+')</span>':'')+'</h2>';
    html+=intervenants(event);
    html+=event.description.replace(/h3/g,'strong');
    //var ho='<strong>Horaire:</strong> '+event.start+' - '+event.end+' <strong>&mdash; Salle:</strong> '+event.room;
   // var ho='<strong>Horaire:</strong> '+event.start+' - '+event.end;
   // html+=ho;

    html+=footer(event.room);
	});
  return html;
}

function intervenants(event,notitle) {
   var html='';
   if (event.persons && event.persons.person) {
     if (!Array.isArray(event.persons.person)) {
       event.persons.person=[event.persons.person];
     }
     if (!notitle) html+='<p><span class="intervenants">Intervenant'+(event.persons.person.length>1?'s' :'')+' :</span> ';
     event.persons.person.forEach(function(person,idx){
       html+=(idx?', ':'')+person['#'];
     });
     html+='</p>';
   }
   return html;
}

function footer(title) {
  var html='';
  html+='</div><!-- /content -->';
  if (title) {
    html+='<div data-role="footer" data-position="fixed">';
    html+='<h1>'+(title?title:'')+'</h1>';
    html+='</div><!-- /footer -->';
  }
  html+='</div><!-- /page -->';
  return html;
}

