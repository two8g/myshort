// var http = require('http');
var express = require('express');
var app = express();
var short = require('../lib/short');

//常量
var urlReg = /[a-zA-z]+:\/\/[^\s]*/;
//服务器域名
var domain_url = "http://search-test.daoxuehao.com/";

// connect to mongodb
short.connect('mongodb://localhost/short');

short.connection.on('error', function(error) {
  throw new Error(error);
});

app.use(express.static('public'));
//短地址生成
var requestHandler = function(req, res){
	var long_url = req.query.long_url;
	var short_url = domain_url;
	var short_hash;
	if(long_url!=null &&long_url.match(urlReg)){
	// gets back the short url document, and then retrieves it
		var shortURLPromise = short.generate({
	  		URL : long_url
		});
		shortURLPromise.then(
			function(mongodbDoc) {
				console.log('>> created short URL:');
			  	console.log(mongodbDoc);
			  	short_hash = mongodbDoc.hash;
			  	short_url = short_url + mongodbDoc.hash;
			  	console.log('>> retrieving short URL: %s', mongodbDoc.hash);
				res.json(
				{
					status: '0',
					long_url: long_url,
					short_url: short_url,
					short_hash: short_hash
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
app.get('/short?:long_url', requestHandler);

//短地址跳转
var redirectHandler = function(req,res){
	var short_url = req.url.slice(1);
	var hash = req.url.slice(1);
	short.retrieve(hash).then(
			function(shortURLObject) {
				var URL = shortURLObject.URL;
                    res.writeHead(302, {
                        "Location" : URL
                    });
                    res.end();
			}, 
			function(error) {
				res.writeHead(200, { "Content-Type" : "text/html" });
                res.write("URL not found!");
                res.end();
			}
		);
};
app.get(/^\/[0-9a-zA-Z]{6}$/,redirectHandler);

//短地址列表
var listHandler = function(req,res){
	var listURLsPromise = short.list();
	var num = 0;
	listURLsPromise.then(
		function(URLsDocument){
			res.json(URLsDocument);
		},
		function(error){
			if(error){
				throw new Error(error);
			}
		}
	);
}
app.get('/list',listHandler);

app.listen(80);