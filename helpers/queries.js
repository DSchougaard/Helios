/*var template = 
"CREATE TABLE database_name.table_name(
   column1 datatype  PRIMARY KEY(one or more columns),
   column2 datatype,
   column3 datatype,
   .....
   columnN datatype,
);"
*/


//ID | Name | IP | Mac | authType
exports.createDeviceTable = "CREATE TABLE IF NOT EXISTS devices(\
   	id 						INTEGER PRIMARY KEY AUTOINCREMENT,\
	name 					TEXT				NOT NULL, \
	ip 						TEXT 				NOT NULL, \
	mac 					TEXT 				NOT NULL, \
	ssh_username 			TEXT				,\
	cert_injected 			INTEGER				NOT NULL \
);"


//ID | deviceID| username | storePassword | password
exports.createPasswordTable = "CREATE TABLE IF NOT EXISTS password_auth(\
	id 						INT PRIMARY KEY		NOT NULL, \
	device_id				INT					NOT NULL, \
	username 				TEXT				NOT NULL, \
	storePassword			INT					NOT NULL, \
	password 				TEXT 				NOT NULL, \
	FOREIGN KEY(device_id) REFERENCES devices(id) \
);"

//ID | deviceID | Cert
exports.createCertTable = "CREATE TABLE IF NOT EXISTS cert_auth(\
	id 						INT PRIMARY KEY		NOT NULL, \
	device_id 				INT 				NOT NULL, \
	cert 					BLOB 				NOT NULL, \
	FOREIGN KEY(device_id) REFERENCES devices(id) \
);"
