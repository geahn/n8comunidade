import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, setAuthToken, setUnauthorizedHandler } from '../api';
import { connectSocket, disconnectSocket } from '../services/socket';

export type UserRole = 'user' | 'store_owner' | 'driver' | 'admin' | 'superadmin';

export interface AuthUser {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    neighborhood_id: string | null;
    neighborhood_name?: string | null;
}

interface AuthResult {
    success: boolean;
    message?: string;
}

interface AuthContextValue {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    selectedNeighborhood: any;
    setSelectedNeighborhood: (n: any) => void;
    login: (email: string, password: string) => Promise<AuthResult>;
    signup: (userData: any) => Promise<AuthResult>;
    logout: () => void;
}

const STORAGE_KEY = '@n8:auth';

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedNeighborhood, setSelectedNeighborhood] = useState<any>(null);

    // Persiste sessão e mantém o header do axios em sincronia
    const persistSession = useCallback(async (nextUser: AuthUser | null, nextToken: string | null) => {
        setUser(nextUser);
        setToken(nextToken);
        setAuthToken(nextToken);
        // Tempo real acompanha a sessão
        if (nextToken) connectSocket(nextToken);
        else disconnectSocket();
        try {
            if (nextUser && nextToken) {
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser, token: nextToken }));
            } else {
                await AsyncStorage.removeItem(STORAGE_KEY);
            }
        } catch (e) {
            if (__DEV__) console.warn('Falha ao persistir sessão', e);
        }
    }, []);

    const logout = useCallback(() => {
        persistSession(null, null);
        setSelectedNeighborhood(null);
    }, [persistSession]);

    // Carrega sessão salva ao iniciar + registra handler de 401/403
    useEffect(() => {
        setUnauthorizedHandler(() => logout());
        (async () => {
            try {
                const raw = await AsyncStorage.getItem(STORAGE_KEY);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed?.token && parsed?.user) {
                        setUser(parsed.user);
                        setToken(parsed.token);
                        setAuthToken(parsed.token);
                        connectSocket(parsed.token);
                    }
                }
            } catch (e) {
                if (__DEV__) console.warn('Falha ao carregar sessão', e);
            } finally {
                setLoading(false);
            }
        })();
    }, [logout]);

    const login = async (email: string, password: string): Promise<AuthResult> => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            await persistSession(response.data.user, response.data.token);
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Erro ao fazer login. Verifique sua conexão.' };
        }
    };

    const signup = async (userData: any): Promise<AuthResult> => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/signup`, userData);
            await persistSession(response.data.user, response.data.token);
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Erro ao criar conta' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, signup, logout, loading, selectedNeighborhood, setSelectedNeighborhood }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
    return ctx;
};
