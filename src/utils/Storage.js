import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveState = async (state, key = 'TIMER_APP_STATE') => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving state:', error);
  }
};

export const loadState = async (key = 'TIMER_APP_STATE') => {
  try {
    const storedState = await AsyncStorage.getItem(key);
    return storedState ? JSON.parse(storedState) : null;
  } catch (error) {
    console.error('Error loading state:', error);
    return null;
  }
};
