var dgram = require('dgram');
var buffer = require('buffer');

module.exports.wake = function(mac){
	sendMagicPacket(mac);
};


function buildMagicPacket(mac){
	var headerSize = 6;
	var macSize = 6;
	var macRepeat = 16;
	var passSize = 6;
	var magicPacketSize = headerSize + macSize*macRepeat ;

	/*
		Default: 000000000000
		Case 1 : 00-00-00-00-00-00
		Case 3 : 00:00:00:00:00:00
	*/
	if( mac.length == 17){
		// Catches cases 1 and 
		mac = mac.replace(/-/g, "");
		mac = mac.replace(/:/g, "");
	}

	var packet = new Buffer( magicPacketSize );
	var macBuffer = new Buffer( macSize );

	for( i = 0 ; i < macSize ; i++ ){
		macBuffer[i] = parseInt( mac.substr( i*2, 2 ), 16 );
	}
	for( i = 0 ; i < headerSize ; i++ ){
		packet[i] = 0xff;
	}
	for( i = 0 ; i < macRepeat ; i++ ){
		macBuffer.copy(packet, 6 + i*macSize, 0, macBuffer.length);
	}
	/*for( i = headerSize + macSize*macRepeat ; i < magicPacketSize; i++ ){
		packet[i] = 0x00;
	}*/

	return packet;
};


function sendMagicPacket(mac){
	var socket = dgram.createSocket("udp4");

	var packet = buildMagicPacket(mac);

	console.log("Magic packet: " + packet.toString('hex') + " of size " + packet.length);

	socket.send( packet, 0, packet.length, 9, "192.168.1.255", function(err, bytes){
		if( err ){
			throw err;
		}
		socket.close();		
	} );
};

















