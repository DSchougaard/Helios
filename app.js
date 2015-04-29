module.exports = function(app, db, device_collection){
	/*
		Routes
	*/
	require('./routes/device')(app, db, device_collection);

	app.get('*', function(req, res) {
		res.sendFile( __dirname + '/public/index.html'); 
	});
}