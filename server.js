/*
	NPM Modules
*/
var express 		= require('express');
//var wol 			= require('./wol');
var path 			= require('path');
var bodyParser 		= require('body-parser');
var methodOverride 	= require('method-override');
var assert 			= require('assert');
var fs 				= require('fs');
var http 			= require('http');
var https 			= require('https');

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


// Global Base path, for relative includes
global.__base = __dirname + '/';

var config = require("./config.json");

// Certificates
if(  config.ssl_enabled === true ){
	console.log("Bootstrapping Helios using SSL.");
	var privateKey = fs.readFileSync(config.ssl_key, 'utf8');
	var certificate = fs.readFileSync(config.ssl_cert, 'utf8');
	var credentials = {key: privateKey, cert: certificate };
}else{
	console.log("Warning: Unsafe operating environment!");
	console.log("Functionality not implemented.");
	process.exit();
}

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


// Database
var sqlite3 = require('sqlite3').verbose();
var dbfile = 'helios.db';
var db = new sqlite3.Database(dbfile);
console.log("Connected to DB.");
var createQueries = require("./helpers/queries.js");
db.run(createQueries.createDeviceTable);
//db.run(createQueries.createPasswordTable);
//db.run(createQueries.createCertTable);
console.log("DB init successful.");


/*sshCommands = require('./helpers/sshCommands.js');

var device = { ip:"1.1.1.1"}
var user = {username: "daniel", password:"test"}


console.log("test: %s", sshCommands.injectUser("daniel").concat(sshCommands.injectCert(device, user, "Sofie")));
*/
// Helios Routes
require('./app')(app, db);

// HTTPS and HTTP servers, using forceSSL
var secureServer = https.createServer(credentials, app);
app.use(forceSSL);

secureServer.listen(config.ssl_port, '0.0.0.0', function(){
	console.log('Project Helios initated on port ' + secureServer.address().port + '.');
});















































// Connect to DB
/*
MongoClient.connect(config.db_url, function(err, db) {
	if(err) throw err;
	
	console.log("Connected to DB.");

	// Helios Routes
	require('./app')(app, db, device_collection);

	// HTTPS and HTTP servers, using forceSSL
	var secureServer = https.createServer(credentials, app);
	app.use(forceSSL);

	secureServer.listen(config.ssl_port, '0.0.0.0', function(){
		console.log('Project Helios initated on port ' + secureServer.address().port + '.');
	});
})

*/