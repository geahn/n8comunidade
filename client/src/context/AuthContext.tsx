import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../api';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>({
        id: '1',
        email: 'admin@teste.com',
        full_name: 'Admin Teste',
        role: 'global_admin',
        avatar_url: null
    });
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);

    // In a real app, you'd load the token from AsyncStorage/SecureStore
    useEffect(() => {
        // Initial load logic here
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            setUser(response.data.user);
            setToken(response.data.token);
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Erro ao fazer login' };
        }
    };

    const signup = async (userData: any) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/signup`, userData);
            setUser(response.data.user);
            setToken(response.data.token);
            return { success: true };
        } catch (error: any) {
            return { success: false, message: error.response?.data?.message || 'Erro ao criar conta' };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setSelectedNeighborhood(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, signup, logout, loading, selectedNeighborhood, setSelectedNeighborhood }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
