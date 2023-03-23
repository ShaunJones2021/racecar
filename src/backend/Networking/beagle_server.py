import random
from flask import Flask, jsonify, send_from_directory, send_file, render_template, request, redirect, url_for, flash
from flask_socketio import SocketIO
from flask_socketio import send, emit
import math
import Adafruit_BBIO.PWM as PWM


servoPin="P9_14"
PWM.start(servoPin,0,50)
servoPin2="P9_16"
PWM.start(servoPin,0,50)

MIDPOINT = 7.5
RANGE = 5
   
# static folder -> .js, imgs, stylesheets, etc
# template folder -> strictly html
app = Flask(__name__, static_folder='../../frontend/UI/static', template_folder='../../frontend/UI/templates')
socketio = SocketIO(app)

open_sockets = {}

@app.route("/static/<path:path>")
def static_dir(path):
    return send_from_directory(app.static_folder, path)

@socketio.on('connect')
def test_connect(auth):
    """
        only want one client to server
    """
    if len(open_sockets) == 0:
        open_sockets[request.sid] = 0
        emit('connection_success', {'data': 'Connected'})
        print("HELLO")
    else:
        emit('connection_refuse', {'data': 'Connection Refused'})
    
@socketio.on('disconnect')
def test_disconnect():
    del open_sockets[request.sid]
    print('Client disconnected')
    
@socketio.on('input')
def input_action(data):
    """
        for a given frame, input data is received and action is translated to beagleboard
    """
    # TODO
    if data:
        # Get left and right analog stick values from client
        # left stick used to control speed
        # right stick used to control direction
        left = -1 * float(data["left"][1])
        right = -1 * float(data["right"][0])
        # Have some bias to look for 0 values
        if abs(left) < 0.15:
            left = 0.0
        if abs(right) < 0.10:
            right = 0.0
        print("left: {left_val:.2f}, right: {right_val:.2f}".format(left_val=left,right_val=right))
        # Controls the steering servo 
        dutyCycle = (right*(RANGE/2)) + MIDPOINT
        PWM.set_duty_cycle(servoPin,dutyCycle)

        # Controls the throttle
        dutyCycle2 = (left*(RANGE/2)) + MIDPOINT
        PWM.set_duty_cycle(servoPin2,dutyCycle2)
        # Do ADA LIBRARY stuff here using float inputs
   
    
@app.route("/")
def get_index():
    return render_template('index.html')

if __name__ == '__main__':
    #socketio.init_app(app, cors_allowed_origins="*")
    socketio.run(app, host="0.0.0.0")
