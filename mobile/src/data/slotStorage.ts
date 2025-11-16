import AsyncStorage from "@react-native-async-storage/async-storage";
import slotData from "./slots.json";

const KEY = "SLOT_DATA";

// Load slots from storage OR fallback to default JSON
export async function loadSlots() {
  try {
    const stored = await AsyncStorage.getItem(KEY);

    if (stored) {
      return JSON.parse(stored);
    }

    // First run → save default data
    await AsyncStorage.setItem(KEY, JSON.stringify(slotData));
    return slotData;

  } catch (err) {
    console.error("Error loading slots:", err);
    return slotData;
  }
}

// Save updated slot list back to storage
export async function saveSlots(slots: any[]) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(slots));
  } catch (err) {
    console.error("Error saving slots:", err);
  }
}
