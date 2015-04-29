/*
	NPM Modules
*/
var express = require('express');
//var wol = require('./wol');
var path = require('path');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var fs = require('fs');
var http = require('http');
var https = require('https');

/*
	Possible Modules?
	https://www.npmjs.com/package/mongo-sanitize
	https://www.npmjs.com/package/lodash
	https://www.npmjs.com/package/async
	https://www.npmjs.com/package/validator
		https://github.com/hapijs/joi
	https://www.npmjs.com/package/node-libnmap
	https://github.com/bevry/getmac


	https://github.com/sindresorhus/awesome-nodejs#logging
*/

// Database Variables
var db_url = "mongodb://localhost:27017/helios";
var device_collection = "devicecollection";

// Certificates
var privateKey = fs.readFileSync('ssl/helios-key.pem', 'utf8');
var certificate = fs.readFileSync('ssl/helios-cert.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate };

//  Server setup
var app = express();


//app.use('/components*', express.static(__dirname + '/public/components' ));
app.use(express.static(__dirname + '/public')); 

app.use(bodyParser.json());
app.use(methodOverride());

var forceSSL = function(req, res, next){
	if( req.headers['x-forwarded-proto'] !== 'https' ){
		console.log("Forcing SSL");
		return res.redirect(['https://', req.get('Host'), req.url].join(''));
	}
	return next();
};


// Connect to DB
MongoClient.connect(db_url, function(err, db) {
	console.log("Connected to DB.");
	if(err) throw err;
	
	// Helios Routes
	require('./app')(app, db, device_collection);

	// HTTPS and HTTP servers, using forceSSL
	var secureServer = https.createServer(credentials, app);

	app.use(forceSSL);

	secureServer.listen(8888, '0.0.0.0', function(){
		console.log('Project Helios initated on port ' + secureServer.address().port + '.');
	});
});