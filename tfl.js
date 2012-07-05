var fs = require("fs");
var http = require("http");
var b_ = require("boneidle");
var url = require("url");

var raw = b_.stream(fs.ReadStream("instant_V1", {encoding:"utf8"})).flatMap(asLine).filter(isMyBusStop);
raw.map(asObject).realise(function(data) {
       	var sorted = data.sort(timeOrder);
	for ( i in sorted ) {
		console.log(sorted[i].bus +" in "+ printTime(sorted[i].time));
	}
});


function asObject(data) {
	//[1,"Ealing Town Hall","E8",1341496662000]
	var o = eval(data);
	var now = new Date();
	return {
		bus: o[2],
		time: diffInMins(now, new Date(o[3]))
	}	
}

function diffInMins(now, date) {
	var millis = date.getTime() - now.getTime();
	return millis / 1000 / 60; 
}


function asLine(data) {
	return b_(data.split("\n"));
}

function isMyBusStop(data) {
	return data.indexOf("Ealing Town Hall") != -1;
}

function timeOrder(a, b) {
	return a.time - b.time;
}

function printTime(time) {
	if (time < 0) {
		return "due";
	} else {
		return Math.round(time);
	}
}
