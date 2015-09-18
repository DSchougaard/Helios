all:
	npm install
	bower install

update:
	npm update
	bower update

cert:
	mkdir -p ssl
	openssl genrsa -out ssl/helios-key.pem 4096
	openssl req -new -sha256 -key ssl/helios-key.pem -out ssl/helios-csr.pem -subj "/C=DK/ST=NA/L=Copenhagen/O=Schougaard Technologies/CN=localhost"
	openssl x509 -req -in ssl/helios-csr.pem -signkey ssl/helios-key.pem -out ssl/helios-cert.pem
ssh:
	mkdir -p ssh
	ssh-keygen -b 4096 -t rsa -f ssh/id_rsa -q -N ""



install:
	echo 'Installing Helios'
	npm install -g bower
	npm install
	bower install
	apt-get install nmap

db_conf:
	mkdir /data/db
	mkdir /home/mongodb
	cp boot/mongodb.sh /etc/init.d/mongodb

count:
	cloc --exclude-dir=node_modules,components --by-file .