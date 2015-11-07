module.exports = function(app, db){
	/*
		Routes
	*/
	require('./routes/device')(app, db);
	require('./routes/shutdown')(app, db);
	require('./routes/scan')(app, db);
	require('./routes/helios')(app, db);
	require('./routes/config')(app, db);

	app.get('*', function(req, res) {
		res.sendFile( __dirname + '/public/views/index.html'); 
	});
} 