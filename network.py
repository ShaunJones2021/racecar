import random
from flask import Flask, render_template, request
from flask_socketio import SocketIO
from flask_socketio import send, emit

   
    
app = Flask(__name__, template_folder='templates')
socketio = SocketIO(app)

open_sockets = {}

@socketio.on('connect')
def test_connect(auth):
    """
        only want one client to server
    """
    if len(open_sockets) == 0:
        open_sockets[request.sid] = 0
        emit('connection_success', {'data': 'Connected'})
    else:
        emit('connection_refuse', {'data': 'Connection Refused'})
    
@socketio.on('disconnect')
def test_disconnect():
    del open_sockets[request.sid]
    print('Client disconnected')
    
@socketio.on('input')
def game_action(data):
    """
        for a given frame, input data is received and action is translated to beagleboard
    """
    # TODO
    pass
   
    
@app.route("/")
def get_index():
    return render_template('index.html')

if __name__ == '__main__':
    socketio.run(app)