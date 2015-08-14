all:
	npm install
	bower install

update:
	npm update
	bower update

cert:
	#openssl req -x509 -nodes -subj "/C=Int/ST=Internet/L=Springfield/O=Dis/CN=www.example.com" -newkey rsa:4098  -keyout helios-key.pem -out helios-cert.pem -days 365
	#openssl req -x509 -nodes -newkey rsa:4098  -keyout helios-key.pem -out helios-cert.pem -days 365
	cd ssl
	openssl genrsa -out ssl/helios-key.pem 4096
	openssl req -new -sha256 -key ssl/helios-key.pem -out ssl/helios-csr.pem
	openssl x509 -req -in ssl/helios-csr.pem -signkey ssl/helios-key.pem -out ssl/helios-cert.pem
	cd ..



ssh:
	ssh-keygen -t rsa -b 4096


install:
	echo 'Installing Helios'
	npm install -g bower
	npm install
	bower install

db_conf:
	mkdir /data/db
	mkdir /home/mongodb
	cp boot/mongodb.sh /etc/init.d/mongodb