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


//  Setup
var app = express();

// Database Variables
var db_url = "mongodb://localhost:27017/helios";
var device_collection = "devicecollection";

app.use(express.static(__dirname + '/public')); 
app.use(bodyParser.json());
app.use(methodOverride());

MongoClient.connect(db_url, function(err, db) {
	console.log("Connected to DB.");
	if(err) throw err;

	require('./app')(app, db, device_collection);


	var server = app.listen(8080, '0.0.0.0', function(){
		console.log('Project Helios initated on port ' + server.address().port + '.');
	});
});