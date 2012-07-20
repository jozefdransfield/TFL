var express= require("express");
var http = require("http");
var url = require("url");
var TFLBusService = require("./lib/tfl");

var app = express.createServer();
app.set("views", __dirname + "/view");
app.set('partials'   , __dirname + '/views/partials');
app.set("view engine", "ejs");

app.configure(function () {
    app.use(express.logger('\x1b[33m:method\x1b[0m \x1b[32m:url\x1b[0m :response-time'));
    app.use(express.cookieParser());
    app.use(express.session({secret:'session-id'}));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions:true, showStack:true }));
});

var bus = new TFLBusService();



app.get('/busstop/:busstop', function(req, res) {
	bus.findByBusStop(req.params.busstop, function(data) {
		res.send(data);
	});
});

app.get("/", function(req, res){
   res.render("timer")
});

function fetchAndParseBusTimes() {
	console.log("Updating Bus times");
	var req = http.get(url.parse("http://countdown.api.tfl.gov.uk/interfaces/ura/instant_V1"), function (res) {
        	res.setEncoding('utf8');
		bus.parse(res, function() {
			console.log("Finished updating Bus times");
            setTimeout(fetchAndParseBusTimes, 30000);
		});          
	});
}

fetchAndParseBusTimes();

app.listen(3000);
