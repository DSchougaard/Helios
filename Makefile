all:
	npm install
	bower install

update:
	npm update
	bower update

cert:
	openssl req -x509 -nodes -subj "/C=Int/ST=Internet/L=Springfield/O=Dis/CN=www.example.com" -newkey rsa:4098  -keyout helios-key.pem -out helios-cert.pem -days 365


install:
	echo 'Installing Helios'
	npm install -g bower
	npm install
	bower install