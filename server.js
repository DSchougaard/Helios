/*
	NPM Modules
*/
var express = require('express');
//var wol = require('./wol');
var path = require('path');
var wol = require('wake_on_lan');
var bodyParser = require('body-parser');
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


/*
	Own Modules
*/
var shutdown_ssh = require('./shutdown_ssh');


//  Setup
var app = express();


// Database Variables
var db_url = "mongodb://localhost:27017/helios";
var device_collection = "devicecollection";


app.use(express.static(__dirname + '/public')); 
app.use(bodyParser.json());
//
app.get('/api/machines', function(req, res){
	

	MongoClient.connect(db_url, function(err, db) {
		assert.equal(null, err);
		console.log("Connected correctly to server");

		var collection = db.collection(device_collection);
		collection.find().toArray(function(err, docs){
		    console.log("Found the following records");
		    console.dir(docs);
		    res.json(docs);
		    db.close();
		});
	});
});


app.get('/api/machines/wake/:id', function(req, res){
	wol.wake(req.params.id);
	res.sendStatus(202);
});

app.get('/api/machines/turnoff/:id', function(req, res){
	var device = {
		ip: "192.168.1.100"
	}
	
	shutdown_ssh.shutdown(device);

	res.sendStatus(202);
	console.log("Turned off " + req.params.id);
});

app.post('/api/machines/add', function(req, res){
	console.log(req.body);
	res.sendStatus(202);
});


app.get('/*', function(req, res) {
	console.log('Received HTTP request.');
	res.sendFile( __dirname + '/public/index.html'); 
});


var server = app.listen(8080, '0.0.0.0', function(){
	console.log('Project Helios initated on port ' + server.address().port + '.');
});