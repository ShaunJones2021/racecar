Flask Server (To be run on BeagleBone Black)

How To Run:
Install prerequisite libraries: (Flask, socket.io)
In Bash Terminal:
flask --app beagle_server run

This launches the server, and as long as both the client and server are connected to the same network. Navigate to http://(SERVER_IP:SERVER_PORT)/ where SERVER_IP may change depending on the network, but the port will be 5000. From there, insert controller and control the car
