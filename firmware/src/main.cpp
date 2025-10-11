// firmware/src/main.cpp
// Minimal ESP32 + HC-SR04 sketch that POSTS JSON to backend.
// Edit WIFI_SSID, WIFI_PASS and BACKEND_URL before compiling.

#include <WiFi.h>
#include <HTTPClient.h>

#ifndef WIFI_SSID
#define WIFI_SSID "YOUR_SSID"
#endif
#ifndef WIFI_PASS
#define WIFI_PASS "YOUR_PASS"
#endif
#ifndef BACKEND_URL
#define BACKEND_URL "http://192.168.1.100:8000/api/v1/spot/state"
#endif

const int TRIG_PIN = 5;
const int ECHO_PIN = 18;
const char* SPOT_ID = "P1-1";

long readDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  if (duration == 0) return 999; // no echo
  return duration / 58;
}

String isoTimestamp() {
  time_t now = time(nullptr);
  struct tm tm;
  gmtime_r(&now, &tm); // UTC—backend should accept or treat as local
  char buf[30];
  snprintf(buf, sizeof(buf), "%04d-%02d-%02dT%02d:%02d:%02dZ",
           tm.tm_year + 1900, tm.tm_mon + 1, tm.tm_mday,
           tm.tm_hour, tm.tm_min, tm.tm_sec);
  return String(buf);
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Connecting Wi-Fi");
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    delay(500);
    Serial.print('.');
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWi-Fi connected");
  } else {
    Serial.println("\nWi-Fi failed to connect (continue, will retry each loop)");
  }

  // optional: configure time via NTP for timestamps (simple)
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
}

void postState(const char* spot_id, const char* state, float distance) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi not connected, skipping POST");
    return;
  }
  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");
  String payload = "{\"spot_id\":\"";
  payload += spot_id;
  payload += "\",\"state\":\"";
  payload += state;
  payload += "\",\"distance_cm\":";
  payload += String(distance, 1);
  payload += ",\"timestamp\":\"";
  payload += isoTimestamp();
  payload += "\"}";
  int code = http.POST(payload);
  Serial.printf("POST %d -> %s\n", code, payload.c_str());
  http.end();
}

bool occupancyLogic(float avgDistanceCm, float thresholdCm = 20.0, int required = 2) {
  // Simple: if distance < threshold for required consecutive windows -> occupied.
  // This function is called once per window in loop; external counters in loop implement smoothing.
  return avgDistanceCm < thresholdCm;
}

void loop() {
  // take 3 quick samples and average
  int samples = 3;
  long sum = 0;
  for (int i = 0; i < samples; ++i) {
    sum += readDistanceCm();
    delay(80);
  }
  float avg = sum / (float)samples;
  static int occ_count = 0;
  static int free_count = 0;
  const int HYST = 2; // require 2 consecutive confirmations
  if (occupancyLogic(avg)) {
    occ_count++;
    free_count = 0;
  } else {
    free_count++;
    occ_count = 0;
  }
  const char* state = (occ_count >= HYST) ? "occupied" : ((free_count >= HYST) ? "free" : "unknown");
  // Only POST when stable (occupied or free), or every N loops as heartbeat.
  static int loops_since_post = 0;
  loops_since_post++;
  if (strcmp(state, "unknown") != 0 || loops_since_post >= 20) {
    postState(SPOT_ID, state, avg);
    loops_since_post = 0;
  }

  // reconnect Wi-Fi opportunistically
  if (WiFi.status() != WL_CONNECTED) {
    WiFi.reconnect();
  }

  delay(3000);
}
