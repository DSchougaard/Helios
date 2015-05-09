# Helios
WoL service for a server.



# Dependencies
* NodeJS - Helios currently being developed and tested against v. 0.12.2.
* MongoDB
* OpenSSL


### Installing Helios
These instructions assumes that all dependencies are installed and are functioning
sudo apt-get update
sudo apt-get install git-core git build-essential openssl



### Installig Node.JS
Step one is to boot into your Rasberry Pi running Raspbian. Installing this is out of the scope of this tutorial.

sudo apt-get update
sudo apt-get install git-core git build-essential avahi




sudo apt-get install tmux
tmux

wget http://nodejs.org/dist/v0.12.2/node-v0.12.2.tar.gz
tar xvf node-v0.12.2
cd node-v0.12.2
./configure
make
sudo make install



### Installing MongoDB
git clone https://github.com/skrabban/mongo-nonx86


### Installing Avahi for Zeroconf/Hostname
sudo apt-get install avahi-daemon
//sudo insserv avahi-daemon
