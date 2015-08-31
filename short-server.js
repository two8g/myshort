// var http = require('http');
var express = require('express');
var app = express();
var short = require('../lib/short');

//常量
var urlReg = /[a-zA-z]+:\/\/[^\s]*/;
//服务器域名
var domain_url = "http://localhost";

// connect to mongodb
short.connect('mongodb://localhost/short');

short.connection.on('error', function(error) {
  throw new Error(error);
});

var requestHandler = function(req, res){
	var long_url = req.query.long_url;
	var short_url = '';
	if(long_url.match(urlReg)){
	// gets back the short url document, and then retrieves it
		var shortURLPromise = short.generate({
	  		URL : long_url
		});
		shortURLPromise.then(
			function(mongodbDoc) {
			console.log('>> created short URL:');
		  	console.log(mongodbDoc);
		  	short_url = short_url + mongodbDoc.hash;
		  	console.log('>> retrieving short URL: %s', mongodbDoc.hash);
		  	short.retrieve(mongodbDoc.hash).then(
		  		function(result) {
				console.log('>> retrieve result:');
			    console.log(result);
			    process.exit(0);
				}, 
				function(error) {
					if (error) {
				    	throw new Error(error);
					}
				  }
				);
		  	res.json(
			{
				status: '0',
				long_url: long_url,
				short_url: short_url
			});
			}, 
			function(error) {
			  if (error) {
			    throw new Error(error);
			  }
			});
	}else{
    	res.json(
		{
			status: 'long_url is invalid',
			long_url: long_url,
			short_url: short_url
		});
	}
};
app.get('/short', requestHandler);
app.listen(18000);
console.log('running short-server on http://localhost:18000/');