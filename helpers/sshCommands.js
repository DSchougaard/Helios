var config 	= require(__base + 'config.json');
var ip = require('ip');

function getHeliosHost(){
	// Helios
	var heliosHttpPrefix 	= config.ssl_enabled ? "https://" : "http://";
	var heliosPort 			= config.ssl_enabled ? config.ssl_port : config.port;
	var heliosIP 			= ip.address();

	// Concats options to shorthand variables
	var heliosHost 			= heliosHttpPrefix + heliosIP + ":" + heliosPort;

	return heliosHost;
}

module.exports.injectUser = function(targetUser){
	return [ "sudo useradd -r " + targetUser +" -m" ]
}

module.exports.injectCert = function(targetUser){
	var sshFolder 			= '.ssh';
	var authKeysFile 		= 'authorized_keys';
	
	var heliosHost 			= getHeliosHost();

	return [
				"wget -t 3 -T 20 --no-check-certificate " +  heliosHost +"/api/helios/cert -O HeliosCertificate.key",
				"sudo mkdir -p ~/../" + targetUser +"/.ssh",
				"sudo chown " + targetUser + ":" + targetUser +" ~/../" + targetUser +"/.ssh",
				"sudo chmod 777 ~/../" + targetUser +"/.ssh",
				"sudo cat HeliosCertificate.key >> ~/../" + targetUser +"/.ssh/authorized_keys",
				"sudo chown " + targetUser + ":" + targetUser +" ~/../" + targetUser +"/.ssh/authorized_keys",
				"sudo chmod 600 ~/../" + targetUser +"/.ssh/authorized_keys",
				"sudo chmod 700 ~/../" + targetUser +"/.ssh",
				"sudo rm HeliosCertificate.key"
			];
}

module.exports.injectPermissions = function(targetUser){
	var heliosHost 			= getHeliosHost();

	return [	"wget -t 3 -T 20 --no-check-certificate " +  heliosHost +"/api/helios/sudoers/" + targetUser + " -O ~/" +targetUser,
				"sudo chmod 0440 ~/" +targetUser,
				"sudo chown root:root ~/" +targetUser,
				"sudo mv ~/" +targetUser + " /etc/sudoers.d/" ];
}