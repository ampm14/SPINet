// src/api/sensors.ts
export const SENSOR_API_URL = "http://<pc ip>:5000/devices"; // your Flask server IP

export async function fetchLiveSensor() {
  try {
    const res = await fetch(SENSOR_API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching live sensor:", err);
    return null;
  }
}
