from flask import Flask, request, jsonify
from datetime import datetime
from flask_cors import CORS   # ✅ allow requests from other devices (like Expo Go)

app = Flask(__name__)
CORS(app)                     # ✅ enable CORS globally

data_store = {}

@app.route('/data', methods=['POST'])
def receive_data():
    data = request.json
    device_id = data.get('device_id')
    distance = data.get('distance')
    state = data.get('state')
    timestamp = datetime.now().isoformat()

    data_store[device_id] = {
        'distance': distance,
        'state': state,
        'timestamp': timestamp
    }
    print(f"[{timestamp}] {device_id}: {distance:.2f} cm | Vacant: {state}")

    return jsonify({'status': 'ok'}), 200

@app.route('/devices', methods=['GET'])
def get_data():
    return jsonify(data_store)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
