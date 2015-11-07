SSL_SUBJ = "/C=DK/ST=NA/L=Copenhagen/O=Schougaard Technologies/CN=localhost"


all:
	npm install
	bower install

update:
	npm update
	bower update

cert:
	mkdir -p crypto/ssl
	openssl genrsa -out crypto/ssl/helios-key.pem 4096
	openssl req -new -sha256 -key crypto/ssl/helios-key.pem -out crypto/ssl/helios-csr.pem -subj $(SSL_SUBJ)
	openssl x509 -req -in crypto/ssl/helios-csr.pem -signkey crypto/ssl/helios-key.pem -out crypto/ssl/helios-cert.pem
ssh:
	mkdir -p crypto/ssh
	ssh-keygen -b 4096 -t rsa -f crypto/ssh/id_rsa -q -N ""



install:
	echo 'Installing Helios'
	npm install
	node_modules/bower/bin/bower install
	apt-get install nmap

db_conf:
	mkdir /data/db
	mkdir /home/mongodb
	cp boot/mongodb.sh /etc/init.d/mongodb

count:
	cloc --exclude-dir=node_modules,components --by-file .