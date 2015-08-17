module.exports = function(app, db, device_collection){
	/*
		Routes
	*/
	require('./routes/device')(app, db, device_collection);
	require('./routes/scan')(app, db);

	app.get('*', function(req, res) {
		res.sendFile( __dirname + '/public/index.html'); 
	});
}