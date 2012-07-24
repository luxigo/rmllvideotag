#!/usr/local/bin/node
// match videos from allVidz.json with events from prog.json (converted from rss/xml with xml2json)

var fs=require('fs');
var allVidz=JSON.parse(fs.readFileSync('allVidz.json'));
var prog=JSON.parse(fs.readFileSync('prog.json'));
var xml2js=require('xml2js');
var _eventList=[];

main();

function main() {
	getEventList();
	console.log(JSON.stringify(_eventList));
}

function getEventList() {
	prog.day.forEach(function(day) {
		thisday=day['@'].date;
		if (Array.isArray(day.room)) {
			day.room.forEach(function(room) {
				room_process(room);
			});
		} else {
			room_process(day.room);
		}
	});
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

var first=true;
function event_process(event) {
	if (!allVidz.channel.item.some(function(item,i) {
		if (item.description.indexOf(': '+event.title)>=0) {
			var _event={
				id: event['@'].id,
				url: item.link,
				title: event.title
			};
			_eventList.push(_event);
			return true;
		}
		
	})) {
		//console.log(event['@'].id+': none');
	};
}

