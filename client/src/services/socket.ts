import { io, Socket } from 'socket.io-client';
import { API_URL } from '../api';

// Conexão de tempo real autenticada pelo mesmo JWT da API.
// Conecta/desconecta junto com a sessão (ver AuthContext).
let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
    if (socket?.connected) return socket;
    disconnectSocket();

    socket = io(API_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
    });

    if (__DEV__) {
        socket.on('connect', () => console.log('🔌 socket conectado'));
        socket.on('connect_error', (e) => console.log('🔌 socket erro:', e.message));
    }

    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
    }
}

export function getSocket(): Socket | null {
    return socket;
}
