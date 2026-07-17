import Constants from 'expo-constants';
import { Platform } from 'react-native';
import axios from 'axios';

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

// Permite override explícito por variável de ambiente (produção)
if (process.env.EXPO_PUBLIC_API_URL) {
    _apiUrl = process.env.EXPO_PUBLIC_API_URL;
}

if (__DEV__) console.log('🔗 [API_URL Configurada]:', _apiUrl);

export const API_URL = _apiUrl;

// --- Autenticação centralizada via interceptors ---

// Injeta/remove o token em todas as requisições axios automaticamente.
export function setAuthToken(token?: string | null) {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
}

// Callback disparado quando o servidor responde 401/403 por token inválido/expirado.
let onUnauthorized: () => void = () => {};
export function setUnauthorizedHandler(fn: () => void) {
    onUnauthorized = fn;
}

axios.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        // 401 = sem/expirado; 403 com essa mensagem = token inválido no middleware
        if (status === 401 || (status === 403 && error?.response?.data?.message === 'Invalid or expired token')) {
            onUnauthorized();
        }
        return Promise.reject(error);
    }
);
