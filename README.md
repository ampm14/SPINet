# [IMP] Before running:

Replace the network details in these files with real working IDs:

- /mobile/src/api/sensors.ts
```
export const SENSOR_API_URL = "http://<pc ip>:5000/devices"; // your Flask server IP
```
- /iot/ultra_detection_adaptive.ino (no need for exact path... code for microcontroller)
```
// ==== CONFIG ====
const char* ssid = "<wifi name>";
const char* password = "<wifi pass>";
const char* serverUrl = "http://<pc ip>:5000/data"; // your PC's IP
```

# Simulation / Live Sensor feed:
Use the appropriate part only as per need: \
(/iot/ultra_detection_adaptive.ino)
### Simulation:
```
long duration=0;
if(m<0)
{
    duration = random(400, 800);
}
else
{
    duration = random(1000, 1800);
}
float distance = duration/10.0;
```

### Live Sensor Feed:
```
digitalWrite(TRIG_PIN, LOW);
delayMicroseconds(2);
digitalWrite(TRIG_PIN, HIGH);
delayMicroseconds(10);
digitalWrite(TRIG_PIN, LOW);
long duration = pulseIn(ECHO_PIN, HIGH, 30000);
float distance = duration * 0.0343 / 2; // cm
```