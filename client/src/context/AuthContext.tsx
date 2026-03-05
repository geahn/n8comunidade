import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState({
        id: '1',
        email: 'admin@teste.com',
        full_name: 'Admin Teste',
        role: 'global_admin',
        avatar_url: null
    });
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // In a real app, you'd load the token from AsyncStorage/SecureStore
    useEffect(() => {
        // Initial load logic here
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:3333/api/auth/login', { email, password });
            setUser(response.data.user);
            setToken(response.data.token);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Erro ao fazer login' };
        }
    };

    const signup = async (userData) => {
        try {
            const response = await axios.post('http://localhost:3333/api/auth/signup', userData);
            setUser(response.data.user);
            setToken(response.data.token);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || 'Erro ao criar conta' };
        }
    };

    const logout = () => {
        setUser(null);
        setToken(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
