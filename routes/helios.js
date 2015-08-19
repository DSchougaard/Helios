var fs = require('fs');

module.exports = function(app, db){

	app.get('/api/helios/cert', function(req, res){
		fs.readFile('ssh/id_rsa.pub', function(err, data){
			if(err){
				console.log("API::Helios::Cert: Error reading public key.");
				res.sendStatus(500);
				return;
			}
			res.header('Content-Type', 'text/plain');
			res.send(data);
		});
	});

	app.get('/api/helios/sudoers', function(req, res){
		fs.readFile('remote_content/helios.sudoer', function(err, data){
			if(err){
				console.log("API::Helios::Sudoers: Error downloading sudoers file.");
				res.sendStatus(500);
				return;
			}
			res.header('Content-Type', 'text/plain');
			res.send(data);
		});
	});
}
