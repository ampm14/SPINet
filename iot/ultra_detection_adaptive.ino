#include <WiFi.h>
#include <HTTPClient.h>

// ==== CONFIG ====
const char* ssid = "<wifi name>";
const char* password = "<wifi pass>";
const char* serverUrl = "http://<pc ip>:5000/data"; // your PC's IP

#define TRIG_PIN 3
#define ECHO_PIN 2
#define DEVICE_ID "A1"

// Threshold logic
const float THRESHOLD = 100.0;  // cm
const float BAND = 10.0;        // cm
bool state = false;             // current boolean state
bool prevState = false;         // previous boolean state

// Adaptive timing
unsigned long normalDelay = 5000;  // ms
unsigned long fastDelay = 1000;    // ms
unsigned long currentDelay = normalDelay;
int stableCounter = 0;
int m=0;    // to vary simulated data
const int STABLE_LIMIT = 5;        // after 5 stable readings, slow down again

void setup() {
  Serial.begin(9600);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print("=");
  }
  Serial.println("\nConnected!");
  Serial.println(WiFi.localIP());
}

float getDistance() {
  // digitalWrite(TRIG_PIN, LOW);
  // delayMicroseconds(2);
  // digitalWrite(TRIG_PIN, HIGH);
  // delayMicroseconds(10);
  // digitalWrite(TRIG_PIN, LOW);

  // long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  // float distance = duration * 0.0343 / 2; // cm

  //simulation
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

  return distance;
}

bool computeState(float distance) {
  // Hysteresis
  if (!state && distance > (THRESHOLD + BAND)) {
    state = true;
  } else if (state && distance < (THRESHOLD - BAND)) {
    state = false;
  }
  return state;
}

void loop() {
  float distance = getDistance();
  bool currentState = computeState(distance);

  // Detect change
  if (currentState != prevState) {
    Serial.println("⚠️ State changed! Entering fast mode.");
    currentDelay = fastDelay;
    stableCounter = 0;
  } else {
    stableCounter++;
    if (stableCounter >= STABLE_LIMIT && currentDelay != normalDelay) {
      Serial.println("✅ State stabilized. Returning to normal delay.");
      currentDelay = normalDelay;
    }
  }

  prevState = currentState;

  // Send data
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String json = "{\"device_id\": \"" DEVICE_ID "\", \"distance\": " + String(distance, 2) +
                  ", \"state\": " + String(currentState ? "true" : "false") + "}";

    int httpResponseCode = http.POST(json);
    if (httpResponseCode > 0) {
      Serial.printf("Server response: %d | Distance: %.2f cm | Vacant: %s\n", 
                    httpResponseCode, distance, currentState ? "TRUE" : "FALSE");
    } else {
      Serial.printf("Error sending POST: %s\n", http.errorToString(httpResponseCode).c_str());
    }
    http.end();
  }

  //varying simulated data
  m=m-1;
  if(m<=-20)
    m=20;

  delay(currentDelay);
}
