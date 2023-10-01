

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, rooms, leave_room
import threading, time
from engineio.payload import Payload

Payload.max_decode_packets = 200

app = Flask(__name__)
app.config['SECRET_KEY'] = 'asdfasfadkfha'
socketio = SocketIO(app)


playersData = {}
	


 
@app.route('/')
def index():
	return render_template('index.html')


def messageReceived(methods=['GET', 'POST']):
	print('client got message')



@socketio.on('connected')
def user_connected(username, methods=['GET', 'POST']):
	print(str(request.sid))
	newPlayer = {
		"x": 600, 
		"y": 200, 
		"dx": 0,
		"dy": 0, 
		"startQueue": [],
		"flip": False,
		"gunRotation": 0,
		"equip": 'fire',
		"playerID": request.sid,
		"name": username,
		"health": 100,
		"kills": 0
	}
	
	playersData[request.sid] = newPlayer
	
	emit('currentPlayers', playersData, callback=messageReceived)
	emit('newPlayer', newPlayer, broadcast=True)


@socketio.on('disconnect')
def user_disconnected():
	emit('userDisconnected', {"playerID": request.sid}, broadcast = True)
	playersData.pop(request.sid)

	
	

@socketio.on('playerMoved')
def player_moved(movementData, methods=['GET', 'POST']):
	id = movementData['playerID']
	player = playersData[request.sid]
	player['x'] = movementData['x']
	player['y'] = movementData['y']
	player['dx'] = movementData['dx']
	player['dy'] = movementData['dy']
	player['startQueue'] = movementData['startQueue']
	player['flip'] = movementData['flip']
	player['gunRotation'] = movementData['gunRotation']
	player['equip'] = movementData['equip']
	player['health'] = movementData['health']
	player['kills'] = movementData['kills']

	emit('newPlayerData', player, broadcast=True, skip_sid=request.sid)

@socketio.on('hitPlayer')
def hit_player(hitData, methods=['GET', 'POST']):
	emit('newHitData', hitData, broadcast = True)

@socketio.on('iDied')
def i_died(data, methods=['GET', 'POST']):
	player = playersData[data['hID']]
	player['x'] = 600
	player['y'] = 200
	player['dx'] = 0
	player['dy'] = 0
	player['startQueue'] = ['ghost']
	player['flip'] = False
	player['gunRotation'] = 0
	player['equip'] = 'fire',
	player['health'] = 100,
	player['kills'] = 0
	emit('fillAmmo', {'player': data['sID'], 'gun': data['t']}, broadcast=True)
	emit('fillAmmo', {'player': data['hID'], 'gun': 'all'}, broadcast=True)
	emit('newPlayerData', player, broadcast=True)
	emit('newKillData', data["sID"], broadcast = True)




# if __name__ == '__main__':
# 	socketio.run(app, debug=True, port=5007)

# if __name__ == '__main__':
# 	socketio.run(app, debug=True, port=5010, host='0.0.0.0')

if __name__ == '__main__':
	app.run()
