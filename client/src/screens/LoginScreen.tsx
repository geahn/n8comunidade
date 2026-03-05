import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, ActivityIndicator,
    KeyboardAvoidingView, Platform, StyleSheet, Image, Dimensions, StatusBar, ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const [email, setEmail] = useState('contato@geahn.com');
    const [password, setPassword] = useState('maxadu07');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) return setError('Preencha todos os campos');
        setIsSubmitting(true);
        setError('');

        const result = await login(email, password);
        if (!result.success) {
            setError(result.message);
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                    {/* Top Illustration Area */}
                    <View style={styles.heroSection}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80' }} // Community image
                            style={styles.heroImage}
                            resizeMode="cover"
                        />
                        <View style={styles.heroOverlay} />
                        <View style={styles.logoBadge}>
                            <Text style={styles.logoText}>n8</Text>
                        </View>
                    </View>

                    {/* Login Form Area */}
                    <View style={styles.formSection}>
                        <Text style={styles.welcomeTitle}>Bem-vindo ao n8</Text>
                        <Text style={styles.welcomeSub}>A plataforma da sua comunidade local</Text>

                        <View style={styles.inputGroup}>
                            <View style={styles.inputWrapper}>
                                <Mail size={20} color="#94a3b8" />
                                <TextInput
                                    placeholder="Seu e-mail"
                                    placeholderTextColor="#94a3b8"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    style={styles.input}
                                />
                            </View>

                            <View style={[styles.inputWrapper, { marginTop: 16 }]}>
                                <Lock size={20} color="#94a3b8" />
                                <TextInput
                                    placeholder="Sua senha"
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
                        </View>

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={isSubmitting}
                            style={styles.loginBtn}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text style={styles.loginBtnText}>Entrar na Comunidade</Text>
                                    <ArrowRight size={20} color="white" />
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.registerLink}>
                            <Text style={styles.registerText}>
                                Novo por aqui? <Text style={styles.registerBold}>Crie sua conta</Text>
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.forgotBtn}>
                            <Text style={styles.forgotText}>Esqueci minha senha</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: '#ffffff',
    },
    heroSection: {
        height: height * 0.4, width: '100%', position: 'relative',
    },
    heroImage: {
        width: '100%', height: '100%',
    },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(29, 78, 216, 0.4)', // n8 primary with opacity
    },
    logoBadge: {
        position: 'absolute', bottom: -30, alignSelf: 'center', width: 80, height: 80, backgroundColor: '#1d4ed8', borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#1d4ed8', shadowOpacity: 0.4, shadowRadius: 15, elevation: 10, borderWidth: 4, borderColor: 'white',
    },
    logoText: {
        color: 'white', fontSize: 32, fontWeight: '900',
    },
    formSection: {
        flex: 1, paddingTop: 60, paddingHorizontal: 32, paddingBottom: 40,
    },
    welcomeTitle: {
        fontSize: 28, fontWeight: '900', color: '#0f172a', textAlign: 'center',
    },
    welcomeSub: {
        fontSize: 16, color: '#64748b', textAlign: 'center', marginTop: 8, fontWeight: '500',
    },
    inputGroup: {
        marginTop: 40,
    },
    inputWrapper: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 20, paddingHorizontal: 16, height: 60, borderWidth: 1, borderColor: '#f1f5f9',
    },
    input: {
        flex: 1, marginLeft: 12, fontSize: 16, color: '#1e293b', fontWeight: '500',
    },
    errorText: {
        color: '#ef4444', fontSize: 13, textAlign: 'center', marginTop: 16, fontWeight: '600',
    },
    loginBtn: {
        backgroundColor: '#1d4ed8', borderRadius: 24, height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 32, shadowColor: '#1d4ed8', shadowOpacity: 0.3, shadowRadius: 12, elevation: 6, gap: 12,
    },
    loginBtnText: {
        color: 'white', fontSize: 18, fontWeight: '800',
    },
    registerLink: {
        marginTop: 24,
    },
    registerText: {
        textAlign: 'center', color: '#64748b', fontSize: 15,
    },
    registerBold: {
        color: '#1d4ed8', fontWeight: '800',
    },
    forgotBtn: {
        marginTop: 20,
    },
    forgotText: {
        textAlign: 'center', color: '#94a3b8', fontSize: 14, fontWeight: '600',
    },
});
