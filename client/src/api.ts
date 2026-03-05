import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Fallback robusto para o IP local da sua máquina (detectado via console)
// Isso garante que o celular encontre o PC na mesma rede Wi-Fi.
let _apiUrl = 'http://192.168.1.100:3333';

// Tenta extrair o IP dinamicamente caso o Expo tenha mudado a rede
if (__DEV__ && Platform.OS !== 'web' && Constants.expoConfig?.hostUri) {
    const match = Constants.expoConfig.hostUri.match(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/);
    if (match && match[0]) {
        // Ignora se for localhost detectado no hostUri (o celular não consegue acessar o localhost do PC)
        if (match[0] !== '127.0.0.1') {
            _apiUrl = `http://${match[0]}:3333`;
        }
    }
} else if (Platform.OS === 'web') {
    _apiUrl = 'http://localhost:3333';
}

console.log('🔗 [API_URL Configurada]:', _apiUrl);

export const API_URL = _apiUrl;



