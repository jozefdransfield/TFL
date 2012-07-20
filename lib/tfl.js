var fs = require("fs");
var http = require("http");
var b_ = require("boneidle");
var url = require("url");

module.exports = TFLBusService;

function TFLBusService() {
	var self = this;
	this.parse = function(stream, callback) {
		b_.stream(stream).flatMap(asLine).filter(emptyLine).map(asObject).realise(function(data) {
			self.data = data;
			callback();
		});
	}

	this.findByBusStop = function(busStop, callback) {
		b_(self.data).filter(matchesBusStop(busStop)).realise(function(data) {
			callback(data.sort(function(a, b) {
                return a.time - b.time;
            }));
		});
	}
}

function asObject(data) {
	try {
		var obj = eval(data);
		var now = new Date();
		return {
			stop: obj[1],
			bus: obj[2],
			time: diffInMins(now, new Date(obj[3]))
		};
	} catch (e) {
		return {
			bus: "poop",
			time: 0
		}
	}
}

function diffInMins(now, date) {
	var millis = date.getTime() - now.getTime();
	return millis / 1000 / 60; 
}


function asLine(data) {
	return b_(data.split("\n"));
}

function matchesBusStop(busStop) {
	return function(data) {
		return data.stop === busStop;
	}
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

function emptyLine(data) {
	return (data && data.length > 0);
}
