import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ActivityIndicator,
    KeyboardAvoidingView, Platform, StyleSheet, ScrollView, Alert
} from 'react-native';
import { api } from '../api';
import { Mail, Lock, KeyRound, ArrowLeft, ArrowRight } from 'lucide-react-native';

// Fluxo em 2 passos: pedir o token por e-mail e depois redefinir a senha.
// Enquanto não há provedor de e-mail, o backend devolve o token em dev.
export default function ForgotPasswordScreen({ navigation }: any) {
    const [step, setStep] = useState<'request' | 'reset'>('request');
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const requestReset = async () => {
        if (!email) return setError('Informe o seu e-mail');
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/api/auth/forgot-password', { email });
            // Em dev o token volta na resposta para facilitar testes
            if (res.data?.dev_token) setToken(res.data.dev_token);
            setStep('reset');
        } catch (e: any) {
            setError(e.response?.data?.message || 'Erro ao solicitar redefinição');
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async () => {
        if (!token || !password) return setError('Preencha o código e a nova senha');
        if (password.length < 6) return setError('A senha precisa de pelo menos 6 caracteres');
        setLoading(true);
        setError('');
        try {
            await api.post('/api/auth/reset-password', { token, password });
            Alert.alert('✅ Pronto', 'Senha redefinida. Faça login com a nova senha.');
            navigation.goBack();
        } catch (e: any) {
            setError(e.response?.data?.message || 'Token inválido ou expirado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <ArrowLeft size={22} color="#0f172a" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Recuperar senha</Text>
                        <Text style={styles.subtitle}>
                            {step === 'request'
                                ? 'Informe seu e-mail para receber o código de redefinição.'
                                : 'Digite o código recebido e a nova senha.'}
                        </Text>
                    </View>

                    <View style={styles.form}>
                        {step === 'request' ? (
                            <View style={styles.inputWrapper}>
                                <Mail size={20} color="#94a3b8" />
                                <TextInput
                                    placeholder="Seu e-mail"
                                    placeholderTextColor="#94a3b8"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    style={styles.input}
                                />
                            </View>
                        ) : (
                            <>
                                <View style={styles.inputWrapper}>
                                    <KeyRound size={20} color="#94a3b8" />
                                    <TextInput
                                        placeholder="Código de redefinição"
                                        placeholderTextColor="#94a3b8"
                                        value={token}
                                        onChangeText={setToken}
                                        autoCapitalize="none"
                                        style={styles.input}
                                    />
                                </View>
                                <View style={[styles.inputWrapper, { marginTop: 14 }]}>
                                    <Lock size={20} color="#94a3b8" />
                                    <TextInput
                                        placeholder="Nova senha (mín. 6)"
                                        placeholderTextColor="#94a3b8"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                        style={styles.input}
                                    />
                                </View>
                            </>
                        )}

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <TouchableOpacity
                            onPress={step === 'request' ? requestReset : resetPassword}
                            disabled={loading}
                            style={styles.submitBtn}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text style={styles.submitText}>
                                        {step === 'request' ? 'Enviar código' : 'Redefinir senha'}
                                    </Text>
                                    <ArrowRight size={20} color="white" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#ffffff' },
    header: { paddingTop: 64, paddingHorizontal: 28 },
    backBtn: {
        width: 44, height: 44, borderRadius: 14, backgroundColor: '#f1f5f9',
        alignItems: 'center', justifyContent: 'center', marginBottom: 20,
    },
    title: { fontSize: 28, fontWeight: '900', color: '#0f172a' },
    subtitle: { fontSize: 15, color: '#64748b', marginTop: 6, fontWeight: '500', lineHeight: 22 },
    form: { paddingHorizontal: 28, marginTop: 28 },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc',
        borderRadius: 20, paddingHorizontal: 16, height: 58, borderWidth: 1, borderColor: '#f1f5f9',
    },
    input: { flex: 1, marginLeft: 12, fontSize: 16, color: '#1e293b', fontWeight: '500' },
    errorText: { color: '#ef4444', fontSize: 13, textAlign: 'center', marginTop: 16, fontWeight: '600' },
    submitBtn: {
        backgroundColor: '#1d4ed8', borderRadius: 22, height: 60, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center', marginTop: 24, gap: 10,
        shadowColor: '#1d4ed8', shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    },
    submitText: { color: 'white', fontSize: 17, fontWeight: '800' },
});
