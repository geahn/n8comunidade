import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ActivityIndicator,
    KeyboardAvoidingView, Platform, StyleSheet, ScrollView, StatusBar
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Mail, Lock, Eye, EyeOff, User, MapPin, ArrowRight, ArrowLeft, Check } from 'lucide-react-native';

interface Neighborhood { id: string; name: string; slug: string; }

export default function SignupScreen({ navigation }: any) {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
    const [selectedNb, setSelectedNb] = useState<Neighborhood | null>(null);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signup } = useAuth();

    useEffect(() => {
        api.get('/api/neighborhoods')
            .then(res => setNeighborhoods(res.data))
            .catch(() => setError('Não foi possível carregar os bairros'));
    }, []);

    const handleSignup = async () => {
        if (!fullName || !email || !password) return setError('Preencha todos os campos');
        if (password.length < 6) return setError('A senha precisa de pelo menos 6 caracteres');
        if (!selectedNb) return setError('Escolha o seu bairro');

        setIsSubmitting(true);
        setError('');

        const result = await signup({
            full_name: fullName,
            email,
            password,
            neighborhood_id: selectedNb.id,
        });
        if (!result.success) {
            setError(result.message || 'Erro ao criar conta');
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <ArrowLeft size={22} color="#0f172a" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Criar sua conta</Text>
                        <Text style={styles.subtitle}>Junte-se à comunidade do seu bairro</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputWrapper}>
                            <User size={20} color="#94a3b8" />
                            <TextInput
                                placeholder="Nome completo"
                                placeholderTextColor="#94a3b8"
                                value={fullName}
                                onChangeText={setFullName}
                                style={styles.input}
                            />
                        </View>

                        <View style={[styles.inputWrapper, { marginTop: 14 }]}>
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

                        <View style={[styles.inputWrapper, { marginTop: 14 }]}>
                            <Lock size={20} color="#94a3b8" />
                            <TextInput
                                placeholder="Crie uma senha (mín. 6)"
                                placeholderTextColor="#94a3b8"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                style={styles.input}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={20} color="#94a3b8" /> : <Eye size={20} color="#94a3b8" />}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.nbSection}>
                            <View style={styles.nbHeader}>
                                <MapPin size={16} color="#1d4ed8" />
                                <Text style={styles.nbTitle}>Escolha o seu bairro</Text>
                            </View>
                            {neighborhoods.map(nb => (
                                <TouchableOpacity
                                    key={nb.id}
                                    onPress={() => setSelectedNb(nb)}
                                    style={[styles.nbItem, selectedNb?.id === nb.id && styles.nbItemActive]}
                                >
                                    <Text style={[styles.nbName, selectedNb?.id === nb.id && styles.nbNameActive]}>
                                        {nb.name}
                                    </Text>
                                    {selectedNb?.id === nb.id && <Check size={18} color="#1d4ed8" />}
                                </TouchableOpacity>
                            ))}
                            {neighborhoods.length === 0 && !error && (
                                <ActivityIndicator color="#1d4ed8" style={{ marginTop: 12 }} />
                            )}
                        </View>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <TouchableOpacity onPress={handleSignup} disabled={isSubmitting} style={styles.submitBtn}>
                            {isSubmitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text style={styles.submitText}>Criar conta</Text>
                                    <ArrowRight size={20} color="white" />
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
                            <Text style={styles.loginLink}>
                                Já tem conta? <Text style={styles.loginBold}>Entrar</Text>
                            </Text>
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
    subtitle: { fontSize: 15, color: '#64748b', marginTop: 6, fontWeight: '500' },
    form: { paddingHorizontal: 28, marginTop: 28 },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc',
        borderRadius: 20, paddingHorizontal: 16, height: 58, borderWidth: 1, borderColor: '#f1f5f9',
    },
    input: { flex: 1, marginLeft: 12, fontSize: 16, color: '#1e293b', fontWeight: '500' },
    nbSection: { marginTop: 24 },
    nbHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    nbTitle: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
    nbItem: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
        marginBottom: 8, borderWidth: 1.5, borderColor: '#f1f5f9',
    },
    nbItemActive: { borderColor: '#1d4ed8', backgroundColor: '#eff6ff' },
    nbName: { fontSize: 15, fontWeight: '600', color: '#475569' },
    nbNameActive: { color: '#1d4ed8', fontWeight: '800' },
    errorText: { color: '#ef4444', fontSize: 13, textAlign: 'center', marginTop: 16, fontWeight: '600' },
    submitBtn: {
        backgroundColor: '#1d4ed8', borderRadius: 22, height: 60, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'center', marginTop: 24, gap: 10,
        shadowColor: '#1d4ed8', shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
    },
    submitText: { color: 'white', fontSize: 17, fontWeight: '800' },
    loginLink: { textAlign: 'center', color: '#64748b', fontSize: 15 },
    loginBold: { color: '#1d4ed8', fontWeight: '800' },
});
