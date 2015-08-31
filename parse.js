var http = require("http");
var mongoose = require("mongoose");
var short = require("short");

mongoose.connect("mongodb://localhost/short");

var app = http.createServer(function(request, response) {
    var hash = request.url.slice(1);
    if (request.url === "/") {
        response.writeHead(200, { "Content-Type" : "text/html" });
        response.write("URL not found!");
        response.end();
    } else {
        short.get(hash, function(error, shortURLObject) {
            if (error) {
                console.error(error);
            } else {
                if (shortURLObject) {
                    var URL = shortURLObject[0].URL;
                    response.writeHead(302, {
                        "Location" : URL
                    });
                    response.end();
                } else {
                    response.writeHead(200, { "Content-Type" : "text/html" });
                    response.write("URL not found!");
                    response.end();
                }
            };
        });
    }
});

app.listen(8080);
console.log("> Open http://localhost:8080/kQ4c");