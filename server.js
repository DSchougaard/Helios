/*
	NPM Modules
*/
var express = require('express');
//var wol = require('./wol');
var path = require('path');
var wol = require('wake_on_lan');
var bodyParser = require('body-parser');
var sequest = require('sequest');

/*
	Own Modules
*/
var shutdown_ssh = require('./shutdown_ssh');


//  Setup
var app = express();
//var mongo = require('mongodb').MongoClient;

/*
mongo.connect('mongodb://127.0.0.1:27017/helio', function(err,db){
	if(err) throw err;

	var 
});
*/

// sadasdas

app.use(express.static(__dirname + '/public')); 
app.use(bodyParser.json());
//
app.get('/api/machines', function(req, res){
	var jsondb = require('./db.json');
	res.json(jsondb);
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
	res.sendFile( __dirname + '/public/index.html'); 
});


var server = app.listen(8080, '0.0.0.0', function(){
	console.log('Project Helios initated on port ' + server.address().port + '.');
});