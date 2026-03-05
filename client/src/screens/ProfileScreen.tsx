import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    Image, Alert, Modal, ActivityIndicator, StyleSheet, Dimensions
} from 'react-native';
import { ArrowLeft, Camera, Edit3, LogOut, Bell, Shield, HelpCircle, ChevronRight, ChevronDown, Eye, EyeOff, Tag, Newspaper, MapPin, Package, Heart, Settings } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { pickAndUploadAvatar } from '../services/imageUpload';

const { width } = Dimensions.get('window');

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    user: { label: 'Membro Premium', color: '#1d4ed8', bg: '#eff6ff' },
    shopkeeper: { label: 'Parceiro Lojista', color: '#059669', bg: '#ecfdf5' },
    neighborhood_admin: { label: 'Líder de Bairro', color: '#7c3aed', bg: '#f5f3ff' },
    global_admin: { label: 'Super Administrador', color: '#dc2626', bg: '#fff1f2' },
};

const MY_ADS = [
    { id: '1', title: 'Bicicleta Aro 26 Semi-Nova', price: 350, category: 'Esportes', image_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80', created_at: '01/03/2026' },
];

export default function ProfileScreen({ navigation }: any) {
    const { user, logout }: any = useAuth();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(user?.full_name || 'Usuário n8');
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
    const [uploading, setUploading] = useState(false);
    const [expandedSection, setExpandedSection] = useState<'ads' | 'news' | null>(null);

    const roleInfo = ROLE_LABELS[user?.role] || ROLE_LABELS.user;
    const initials = name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() || 'U';

    const handleAvatarUpload = async () => {
        setUploading(true);
        try {
            const result = await pickAndUploadAvatar();
            if (result) setAvatarUrl(result.url);
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Sair da conta', 'Tem certeza que deseja encerrar sua sessão?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair agora', style: 'destructive', onPress: logout }
        ]);
    };

    return (
        <View style={styles.container}>
            {/* Header Area */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <ArrowLeft size={22} color="#1e293b" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Minha Conta</Text>
                    <TouchableOpacity onPress={() => setEditing(!editing)} style={[styles.iconBtn, editing && styles.iconBtnActive]}>
                        <Settings size={20} color={editing ? '#1d4ed8' : '#1e293b'} />
                    </TouchableOpacity>
                </View>

                <View style={styles.profileHero}>
                    <TouchableOpacity onPress={handleAvatarUpload} style={styles.avatarContainer}>
                        {uploading ? (
                            <ActivityIndicator color="#1d4ed8" />
                        ) : avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                        ) : (
                            <Text style={styles.avatarInitial}>{initials}</Text>
                        )}
                        <View style={styles.cameraIcon}>
                            <Camera size={12} color="white" />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.heroInfo}>
                        {editing ? (
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                style={styles.nameInput}
                                autoFocus
                            />
                        ) : (
                            <Text style={styles.name}>{name}</Text>
                        )}
                        <Text style={styles.email}>{user?.email}</Text>
                        <View style={[styles.roleBadge, { backgroundColor: roleInfo.bg }]}>
                            <Text style={[styles.roleText, { color: roleInfo.color }]}>{roleInfo.label}</Text>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <TouchableOpacity onPress={() => navigation.navigate('Orders')} style={styles.statCard}>
                        <Package size={24} color="#1d4ed8" />
                        <Text style={styles.statVal}>12</Text>
                        <Text style={styles.statLabel}>Pedidos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statCard}>
                        <Heart size={24} color="#ef4444" />
                        <Text style={styles.statVal}>8</Text>
                        <Text style={styles.statLabel}>Favoritos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setExpandedSection(expandedSection === 'ads' ? null : 'ads')} style={styles.statCard}>
                        <Tag size={24} color="#8b5cf6" />
                        <Text style={styles.statVal}>{MY_ADS.length}</Text>
                        <Text style={styles.statLabel}>Anúncios</Text>
                    </TouchableOpacity>
                </View>

                {/* Main Menu */}
                <View style={styles.menuSection}>
                    <Text style={styles.menuHeader}>Atalhos</Text>
                    <View style={styles.menuCard}>
                        {/* Pedidos */}
                        <TouchableOpacity onPress={() => navigation.navigate('Orders')} style={styles.menuItem}>
                            <View style={[styles.menuIcon, { backgroundColor: '#fff7ed' }]}>
                                <Package size={20} color="#f59e0b" />
                            </View>
                            <Text style={styles.menuLabel}>Meus Pedidos</Text>
                            <ChevronRight size={18} color="#cbd5e1" />
                        </TouchableOpacity>

                        {/* Endereços */}
                        <TouchableOpacity style={styles.menuItem}>
                            <View style={[styles.menuIcon, { backgroundColor: '#ecfdf5' }]}>
                                <MapPin size={20} color="#10b981" />
                            </View>
                            <Text style={styles.menuLabel}>Endereços Salvos</Text>
                            <ChevronRight size={18} color="#cbd5e1" />
                        </TouchableOpacity>

                        {/* Notificações */}
                        <TouchableOpacity style={styles.menuItem}>
                            <View style={[styles.menuIcon, { backgroundColor: '#eff6ff' }]}>
                                <Bell size={20} color="#1d4ed8" />
                            </View>
                            <Text style={styles.menuLabel}>Notificações</Text>
                            <ChevronRight size={18} color="#cbd5e1" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.menuSection}>
                    <Text style={styles.menuHeader}>Geral</Text>
                    <View style={styles.menuCard}>
                        <TouchableOpacity style={styles.menuItem}>
                            <View style={[styles.menuIcon, { backgroundColor: '#f5f3ff' }]}>
                                <Shield size={20} color="#7c3aed" />
                            </View>
                            <Text style={styles.menuLabel}>Privacidade</Text>
                            <ChevronRight size={18} color="#cbd5e1" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem}>
                            <View style={[styles.menuIcon, { backgroundColor: '#f1f5f9' }]}>
                                <HelpCircle size={20} color="#475569" />
                            </View>
                            <Text style={styles.menuLabel}>Ajuda</Text>
                            <ChevronRight size={18} color="#cbd5e1" />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
                    <LogOut size={20} color="#ef4444" />
                    <Text style={styles.logoutText}>Encerrar Sessão</Text>
                </TouchableOpacity>

                <Text style={styles.versionText}>n8 v1.0.0 • Feito com ❤️ no seu bairro</Text>
            </ScrollView >
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: '#f8fafc',
    },
    header: {
        backgroundColor: '#ffffff', paddingTop: 56, paddingBottom: 24,
        borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 5,
    },
    headerTop: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 24,
    },
    headerTitle: {
        fontSize: 18, fontWeight: '800', color: '#1e293b',
    },
    iconBtn: {
        width: 44, height: 44, borderRadius: 14, backgroundColor: '#f1f5f9',
        alignItems: 'center', justifyContent: 'center',
    },
    iconBtnActive: {
        backgroundColor: '#eff6ff',
    },
    profileHero: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24,
    },
    avatarContainer: {
        width: 80, height: 80, borderRadius: 28, backgroundColor: '#f1f5f9',
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    },
    avatar: {
        width: '100%', height: '100%',
    },
    avatarInitial: {
        fontSize: 32, fontWeight: '800', color: '#cbd5e1',
    },
    cameraIcon: {
        position: 'absolute', bottom: 0, right: 0, backgroundColor: '#1d4ed8',
        padding: 6, borderTopLeftRadius: 10,
    },
    heroInfo: {
        marginLeft: 20, flex: 1,
    },
    name: {
        fontSize: 22, fontWeight: '900', color: '#0f172a',
    },
    nameInput: {
        fontSize: 20, fontWeight: '900', color: '#1d4ed8', borderBottomWidth: 1, borderBottomColor: '#1d4ed8', paddingVertical: 2,
    },
    email: {
        fontSize: 14, color: '#94a3b8', fontWeight: '500', marginTop: 2,
    },
    roleBadge: {
        marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start',
    },
    roleText: {
        fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5,
    },
    scrollContent: {
        paddingTop: 24, paddingBottom: 100,
    },
    statsGrid: {
        flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 32,
    },
    statCard: {
        width: (width - 64) / 3, backgroundColor: '#ffffff', borderRadius: 24, padding: 16, alignItems: 'center',
        shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2,
    },
    statVal: {
        fontSize: 18, fontWeight: '900', color: '#0f172a', marginTop: 8,
    },
    statLabel: {
        fontSize: 12, color: '#94a3b8', fontWeight: '600', marginTop: 2,
    },
    menuSection: {
        marginBottom: 24, paddingHorizontal: 20,
    },
    menuHeader: {
        fontSize: 14, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginLeft: 8,
    },
    menuCard: {
        backgroundColor: '#ffffff', borderRadius: 32, overflow: 'hidden',
        shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 15, elevation: 3,
    },
    menuItem: {
        flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
    },
    menuIcon: {
        width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 16,
    },
    menuLabel: {
        flex: 1, fontSize: 16, fontWeight: '700', color: '#334155',
    },
    logoutBtn: {
        marginHorizontal: 20, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 18, borderRadius: 32, backgroundColor: '#fff1f2', borderWidth: 1, borderColor: '#fecdd3',
    },
    logoutText: {
        fontSize: 16, fontWeight: '800', color: '#ef4444', marginLeft: 10,
    },
    versionText: {
        textAlign: 'center', marginTop: 32, fontSize: 13, color: '#cbd5e1', fontWeight: '600',
    },
});
