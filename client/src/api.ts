import Constants from 'expo-constants';
import { Platform } from 'react-native';

let _apiUrl = 'http://localhost:3333';

// Automatically detect the correct local IP address based on Expo's host configuration
// This is critical for physical devices and emulators to talk to the backend.
if (__DEV__ && Platform.OS !== 'web' && Constants.expoConfig?.hostUri) {
    const hostIp = Constants.expoConfig.hostUri.split(':')[0];
    if (hostIp) {
        _apiUrl = `http://${hostIp}:3333`;
    }
}

export const API_URL = _apiUrl;


