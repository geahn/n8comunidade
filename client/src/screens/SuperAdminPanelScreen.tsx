import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch, StyleSheet, Dimensions, StatusBar, Image } from 'react-native';
import { Globe, Users, MapPin, Settings, ChevronRight, CheckCircle, XCircle, LayoutDashboard, Building, Sliders, Bell, ArrowLeft, TrendingUp, ShoppingBag } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const MOCK_NEIGHBORHOODS = [
    { id: '1', name: 'Bairro Exemplo', slug: 'bairro-exemplo', status: 'active', members: 124, shops: 6 },
    { id: '2', name: 'Vila Nova', slug: 'vila-nova', status: 'active', members: 87, shops: 4 },
    { id: '3', name: 'Jardim das Flores', slug: 'jardim-das-flores', status: 'pending', members: 12, shops: 0 },
    { id: '4', name: 'Centro Histórico', slug: 'centro-historico', status: 'active', members: 250, shops: 18 },
];

const MOCK_GLOBAL_STATS = [
    { label: 'Bairros', value: 4, icon: Building, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Membros', value: 461, icon: Users, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Lojas', value: 28, icon: ShoppingBag, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Vendas Brutas', value: 'R$ 12k', icon: TrendingUp, color: '#f59e0b', bg: '#fffbeb' },
];

export default function SuperAdminPanelScreen({ navigation }: any) {
    const { user, logout } = useAuth() as any;
    const [neighborhoods, setNeighborhoods] = useState(MOCK_NEIGHBORHOODS);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'neighborhoods' | 'banners' | 'settings'>('dashboard');
    const [commission, setCommission] = useState({ admin: 10, super: 5 });

    const toggleNeighborhoodStatus = (id: string) => {
        setNeighborhoods(prev => prev.map(n =>
            n.id === id ? { ...n, status: n.status === 'active' ? 'inactive' : 'active' } : n
        ));
    };

    const approveNeighborhood = (id: string) => {
        setNeighborhoods(prev => prev.map(n => n.id === id ? { ...n, status: 'active' } : n));
        Alert.alert('✅ Sucesso', 'O bairro foi homologado e já está visível para novos usuários!');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Global Admin Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <ArrowLeft size={22} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Gestão Global n8</Text>
                        <Text style={styles.headerSub}>Admin: {user?.email}</Text>
                    </View>
                    <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                        <Text style={styles.logoutText}>Sair</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tabsRow}>
                    {[
                        { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { key: 'neighborhoods', label: 'Bairros', icon: Building },
                        { key: 'banners', label: 'Banners', icon: Globe },
                        { key: 'settings', label: 'Ajustes', icon: Sliders },
                    ].map(tab => {
                        const Icon = tab.icon;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                onPress={() => setActiveTab(tab.key as any)}
                                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                            >
                                <Icon size={16} color={activeTab === tab.key ? '#0f172a' : 'rgba(255,255,255,0.6)'} />
                                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {activeTab === 'dashboard' && (
                    <View>
                        <View style={styles.statsGrid}>
                            {MOCK_GLOBAL_STATS.map(stat => {
                                const Icon = stat.icon;
                                return (
                                    <View key={stat.label} style={styles.statCard}>
                                        <View style={[styles.statIcon, { backgroundColor: stat.bg }]}>
                                            <Icon size={20} color={stat.color} />
                                        </View>
                                        <Text style={styles.statVal}>{stat.value}</Text>
                                        <Text style={styles.statLabel}>{stat.label}</Text>
                                    </View>
                                );
                            })}
                        </View>

                        <Text style={styles.sectionTitle}>Bairros Recém-Ativados</Text>
                        {neighborhoods.filter(n => n.status === 'active').slice(0, 3).map(n => (
                            <View key={n.id} style={styles.neighborhoodItem}>
                                <View style={styles.nbIcon}>
                                    <MapPin size={20} color="#3b82f6" />
                                </View>
                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    <Text style={styles.nbName}>{n.name}</Text>
                                    <Text style={styles.nbMeta}>{n.members} membros • {n.shops} lojas</Text>
                                </View>
                                <ChevronRight size={18} color="#cbd5e1" />
                            </View>
                        ))}
                    </View>
                )}

                {activeTab === 'neighborhoods' && (
                    <View style={styles.listContainer}>
                        {neighborhoods.map(n => (
                            <View key={n.id} style={styles.nbApprovalCard}>
                                <View style={styles.nbApprovalHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.nbApprovalTitle}>{n.name}</Text>
                                        <Text style={styles.nbApprovalSlug}>slug: /{n.slug}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: n.status === 'active' ? '#dcfce7' : n.status === 'pending' ? '#fffbeb' : '#fee2e2' }]}>
                                        <Text style={[styles.statusText, { color: n.status === 'active' ? '#059669' : n.status === 'pending' ? '#d97706' : '#dc2626' }]}>
                                            {n.status === 'active' ? 'ATIVO' : n.status === 'pending' ? 'PENDENTE' : 'INATIVO'}
                                        </Text>
                                    </View>
                                </View>

                                {n.status === 'pending' ? (
                                    <View style={styles.approvalActions}>
                                        <TouchableOpacity onPress={() => approveNeighborhood(n.id)} style={styles.approveBtn}>
                                            <CheckCircle size={16} color="white" />
                                            <Text style={styles.approveBtnText}>Homologar Bairro</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.rejectBtn}>
                                            <XCircle size={16} color="#ef4444" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        onPress={() => toggleNeighborhoodStatus(n.id)}
                                        style={[styles.statusBtn, { backgroundColor: n.status === 'active' ? '#fef2f2' : '#ecfdf5' }]}
                                    >
                                        <Text style={[styles.statusBtnText, { color: n.status === 'active' ? '#dc2626' : '#059669' }]}>
                                            {n.status === 'active' ? 'Interromper Operação' : 'Retomar Operação'}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {activeTab === 'banners' && (
                    <View style={styles.settingsCard}>
                        <Text style={styles.sectionTitle}>Gestão de Mini Banners</Text>
                        <Text style={styles.settingsSub}>Personalize os atalhos rápidos do dashboard.</Text>

                        <TouchableOpacity style={styles.approveBtn}>
                            <Text style={styles.approveBtnText}>+ Adicionar Novo Banner</Text>
                        </TouchableOpacity>

                        <View style={{ marginTop: 20 }}>
                            {[
                                { id: 1, title: 'Mercado', img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80' },
                                { id: 2, title: 'Restaurantes', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&q=80' },
                            ].map(b => (
                                <View key={b.id} style={styles.bannerRow}>
                                    <Image source={{ uri: b.img }} style={styles.bannerThumb} />
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.nbApprovalTitle}>{b.title}</Text>
                                        <Text style={styles.nbApprovalSlug}>Ordem: {b.id}</Text>
                                    </View>
                                    <TouchableOpacity>
                                        <XCircle size={20} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
                {activeTab === 'settings' && (
                    <View style={styles.settingsCard}>
                        <Text style={styles.sectionTitle}>Política de Comissões</Text>
                        <Text style={styles.settingsSub}>Defina a porcentagem de repasse padrão para novos bairros e lojas.</Text>

                        <View style={styles.commissionRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.commLabel}>Taxa Superadmin</Text>
                                <Text style={styles.commSub}>Receita da plataforma base</Text>
                            </View>
                            <View style={styles.counter}>
                                <TouchableOpacity onPress={() => setCommission(p => ({ ...p, super: Math.max(0, p.super - 1) }))} style={styles.counterBtn}>
                                    <Text style={styles.counterText}>-</Text>
                                </TouchableOpacity>
                                <Text style={styles.counterVal}>{commission.super}%</Text>
                                <TouchableOpacity onPress={() => setCommission(p => ({ ...p, super: p.super + 1 }))} style={[styles.counterBtn, { backgroundColor: '#0f172a' }]}>
                                    <Text style={[styles.counterText, { color: 'white' }]}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.commissionRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.commLabel}>Taxa Admin Bairro</Text>
                                <Text style={styles.commSub}>Repasse para o gestor local</Text>
                            </View>
                            <View style={styles.counter}>
                                <TouchableOpacity onPress={() => setCommission(p => ({ ...p, admin: Math.max(0, p.admin - 1) }))} style={styles.counterBtn}>
                                    <Text style={styles.counterText}>-</Text>
                                </TouchableOpacity>
                                <Text style={styles.counterVal}>{commission.admin}%</Text>
                                <TouchableOpacity onPress={() => setCommission(p => ({ ...p, admin: p.admin + 1 }))} style={[styles.counterBtn, { backgroundColor: '#0f172a' }]}>
                                    <Text style={[styles.counterText, { color: 'white' }]}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity onPress={() => Alert.alert('Sucesso', 'Configurações de rede atualizadas.')} style={styles.saveBtn}>
                            <Text style={styles.saveBtnText}>Salvar Alterações Globais</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: '#f8fafc',
    },
    header: {
        backgroundColor: '#0f172a', paddingTop: 56, paddingBottom: 20, borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
    },
    headerTop: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 24,
    },
    iconBtn: {
        width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        color: 'white', fontSize: 18, fontWeight: '900',
    },
    headerSub: {
        color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600', marginTop: 2,
    },
    logoutBtn: {
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.2)',
    },
    logoutText: {
        color: '#f87171', fontSize: 13, fontWeight: '800',
    },
    tabsRow: {
        flexDirection: 'row', paddingHorizontal: 20, gap: 10,
    },
    tab: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', gap: 8,
    },
    tabActive: {
        backgroundColor: '#ffffff',
    },
    tabText: {
        color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '800',
    },
    tabTextActive: {
        color: '#0f172a',
    },
    scrollContent: {
        padding: 20, paddingBottom: 100,
    },
    statsGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32,
    },
    statCard: {
        width: (width - 56) / 2, backgroundColor: 'white', borderRadius: 28, padding: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2,
    },
    statIcon: {
        width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    statVal: {
        fontSize: 22, fontWeight: '900', color: '#0f172a',
    },
    statLabel: {
        fontSize: 12, color: '#94a3b8', fontWeight: '700', marginTop: 2,
    },
    sectionTitle: {
        fontSize: 18, fontWeight: '900', color: '#0f172a', marginBottom: 16,
    },
    neighborhoodItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 24, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 8, elevation: 2,
    },
    nbIcon: {
        width: 44, height: 44, borderRadius: 14, backgroundColor: '#f0f9ff', alignItems: 'center', justifyContent: 'center',
    },
    nbName: {
        fontSize: 16, fontWeight: '800', color: '#1e293b',
    },
    nbMeta: {
        fontSize: 12, color: '#94a3b8', fontWeight: '600', marginTop: 2,
    },
    listContainer: {
        gap: 16,
    },
    nbApprovalCard: {
        backgroundColor: 'white', borderRadius: 28, padding: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 3,
    },
    nbApprovalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20,
    },
    nbApprovalTitle: {
        fontSize: 18, fontWeight: '800', color: '#1e293b',
    },
    nbApprovalSlug: {
        fontSize: 12, color: '#94a3b8', fontWeight: '600', marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    },
    statusText: {
        fontSize: 10, fontWeight: '900',
    },
    approvalActions: {
        flexDirection: 'row', gap: 12,
    },
    approveBtn: {
        flex: 1, height: 52, borderRadius: 16, backgroundColor: '#0f172a', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    },
    approveBtnText: {
        color: 'white', fontSize: 14, fontWeight: '800',
    },
    rejectBtn: {
        width: 52, height: 52, borderRadius: 16, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center',
    },
    statusBtn: {
        height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    },
    statusBtnText: {
        fontSize: 14, fontWeight: '800',
    },
    settingsCard: {
        backgroundColor: 'white', borderRadius: 32, padding: 24, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 15, elevation: 5,
    },
    settingsSub: {
        fontSize: 14, color: '#64748b', fontWeight: '500', lineHeight: 20, marginBottom: 24,
    },
    commissionRow: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
    },
    commLabel: {
        fontSize: 15, fontWeight: '800', color: '#1e293b',
    },
    commSub: {
        fontSize: 12, color: '#94a3b8', fontWeight: '600', marginTop: 2,
    },
    counter: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 12, padding: 4, gap: 12,
    },
    counterBtn: {
        width: 36, height: 36, borderRadius: 10, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    counterText: {
        fontSize: 18, fontWeight: '800', color: '#0f172a',
    },
    counterVal: {
        fontSize: 16, fontWeight: '900', color: '#0f172a', minWidth: 30, textAlign: 'center',
    },
    saveBtn: {
        backgroundColor: '#0f172a', height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 12,
    },
    saveBtnText: {
        color: 'white', fontSize: 16, fontWeight: '800',
    },
    bannerRow: {
        flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f8fafc', borderRadius: 16, marginBottom: 12,
    },
    bannerThumb: {
        width: 50, height: 50, borderRadius: 10,
    },
});
