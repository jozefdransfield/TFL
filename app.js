var express= require("express");
var http = require("http");
var url = require("url");
var TFLBusService = require("./tfl");

var bus = new TFLBusService();

var app = express.createServer();

app.get('/stop/:busstop', function(req, res) {
	bus.findByBusStop(req.params.busstop, function(data) {
		res.send(data);
	});
});


function fetchAndParseBusTimes() {
	console.log("Updating Bus times");
	var req = http.get(url.parse("http://countdown.api.tfl.gov.uk/interfaces/ura/instant_V1"), function (res) {
        	res.setEncoding('utf8');
		bus.parse(res, function() {
			console.log("Finished updating Bus times");		
		});          
	});
	setTimeout(fetchAndParseBusTimes, 30000);
}

fetchAndParseBusTimes();

app.listen(3000);
