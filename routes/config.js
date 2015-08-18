var config = require("./config.json");

module.exports = function(app, db){

	app.post('/api/config/cert', function(req, res){
		
		var ip			= req.body.ip;
		var username 	= req.body.username;
		var password 	= req.body.password;
		var port 		= req.body.port;


		var target = {
			server: {     
				host:         "192.168.1.134",
				port:         "22",
				userName:     "test",
				password:     "password"
			},
			commands: [
				"wget --no-check-certificate https://" + ip +":"+port + "/api/helios/cert -O HeliosCertificate.key",
				"sudo useradd -r "+config.ssh_user+" -m",
				"sudo mkdir -p ~/../"+config.ssh_user+"/.ssh",
				"sudo chown "+config.ssh_user+":"+config.ssh_user+" ~/../"+config.ssh_user+"/.ssh",
				"sudo chmod 777 ~/../"+config.ssh_user+"/.ssh",
				"sudo cat HeliosCertificate.key >> ~/../"+config.ssh_user+"/.ssh/authorized_keys",
				"sudo chown "+config.ssh_user+":"+config.ssh_user+" ~/../"+config.ssh_user+"/.ssh/authorized_keys",
				"sudo chmod 600 ~/../"+config.ssh_user+"/.ssh/authorized_keys",
				"sudo chmod 700 ~/../"+config.ssh_user+"/.ssh"
			]
		};

		var SSH = new SSH2Shell(target);
		SSH.connect();
	}

};
