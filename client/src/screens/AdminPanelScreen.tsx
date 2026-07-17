import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl, StyleSheet, Dimensions } from 'react-native';
import { Users, CheckCircle, XCircle, ChevronRight, Bell, LayoutDashboard, Newspaper, ShoppingBag, ArrowLeft, Tag } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const { width } = Dimensions.get('window');

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    user: { label: 'Membro', color: '#64748b', bg: '#f1f5f9' },
    store_owner: { label: 'Lojista', color: '#059669', bg: '#ecfdf5' },
    driver: { label: 'Entregador', color: '#d97706', bg: '#fffbeb' },
    admin: { label: 'Administrador', color: '#7c3aed', bg: '#f5f3ff' },
    superadmin: { label: 'Superadmin', color: '#dc2626', bg: '#fff1f2' },
};

export default function AdminPanelScreen({ navigation }: any) {
    const { user } = useAuth() as any;
    const [pendingNews, setPendingNews] = useState<any[]>([]);
    const [pendingShops, setPendingShops] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'news' | 'shops' | 'members'>('dashboard');

    const load = useCallback(async () => {
        try {
            const [newsRes, shopsRes, membersRes, statsRes] = await Promise.all([
                api.get('/api/news/pending'),
                api.get('/api/shops/pending'),
                api.get('/api/admin/users'),
                api.get('/api/admin/stats'),
            ]);
            setPendingNews(newsRes.data);
            setPendingShops(shopsRes.data);
            setMembers(membersRes.data);
            setStats(statsRes.data);
        } catch (e: any) {
            console.log('AdminPanel load error:', e.response?.data || e.message);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    const approve = async (type: 'news' | 'shops', id: string) => {
        try {
            const status = type === 'news' ? 'published' : 'active';
            await api.patch(`/api/${type}/${id}/status`, { status });
            Alert.alert('✅ Aprovado com sucesso!');
            load();
        } catch (e: any) {
            Alert.alert('Erro', e.response?.data?.message || 'Falha ao aprovar');
        }
    };

    const reject = async (type: 'news' | 'shops', id: string) => {
        try {
            await api.patch(`/api/${type}/${id}/status`, { status: 'rejected' });
            Alert.alert('❌ Solicitação recusada');
            load();
        } catch (e: any) {
            Alert.alert('Erro', e.response?.data?.message || 'Falha ao recusar');
        }
    };

    const changeRole = (member: any) => {
        const options = [
            { label: 'Membro', role: 'user' },
            { label: 'Lojista', role: 'store_owner' },
            { label: 'Entregador', role: 'driver' },
        ];
        Alert.alert(
            member.full_name,
            'Alterar papel deste membro:',
            [
                ...options.map(o => ({
                    text: o.label,
                    onPress: async () => {
                        try {
                            await api.patch(`/api/admin/users/${member.id}/role`, { role: o.role });
                            load();
                        } catch (e: any) {
                            Alert.alert('Erro', e.response?.data?.message || 'Falha ao alterar papel');
                        }
                    },
                })),
                { text: 'Cancelar', style: 'cancel' as const },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <ArrowLeft size={22} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Gestão do Bairro</Text>
                        <Text style={styles.headerSub}>{user?.neighborhood_name || 'Seu bairro'}</Text>
                    </View>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Bell size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
                    {[
                        { key: 'dashboard', label: 'Resumo', icon: LayoutDashboard },
                        { key: 'news', label: `Notícias (${pendingNews.length})`, icon: Newspaper },
                        { key: 'shops', label: `Lojas (${pendingShops.length})`, icon: ShoppingBag },
                        { key: 'members', label: 'Membros', icon: Users },
                    ].map(tab => {
                        const Icon = tab.icon;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                onPress={() => setActiveTab(tab.key as any)}
                                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                            >
                                <Icon size={14} color={activeTab === tab.key ? '#7c3aed' : 'rgba(255,255,255,0.7)'} strokeWidth={3} />
                                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {activeTab === 'dashboard' && (
                    <View style={styles.dashboardGrid}>
                        <View style={styles.statRow}>
                            <View style={[styles.statCard, { backgroundColor: '#f5f3ff' }]}>
                                <Users size={24} color="#7c3aed" />
                                <Text style={[styles.statVal, { color: '#7c3aed' }]}>{stats?.members ?? '—'}</Text>
                                <Text style={styles.statLabel}>Membros</Text>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: '#fffbeb' }]}>
                                <Newspaper size={24} color="#f59e0b" />
                                <Text style={[styles.statVal, { color: '#f59e0b' }]}>{pendingNews.length}</Text>
                                <Text style={styles.statLabel}>Notícias Pend.</Text>
                            </View>
                        </View>
                        <View style={styles.statRow}>
                            <View style={[styles.statCard, { backgroundColor: '#fef2f2' }]}>
                                <ShoppingBag size={24} color="#ef4444" />
                                <Text style={[styles.statVal, { color: '#ef4444' }]}>{pendingShops.length}</Text>
                                <Text style={styles.statLabel}>Lojas Pend.</Text>
                            </View>
                            <View style={[styles.statCard, { backgroundColor: '#ecfdf5' }]}>
                                <Tag size={24} color="#10b981" />
                                <Text style={[styles.statVal, { color: '#10b981' }]}>{stats?.active_ads ?? '—'}</Text>
                                <Text style={styles.statLabel}>Anúncios Ativos</Text>
                            </View>
                        </View>

                        <TouchableOpacity onPress={() => setActiveTab('news')} style={styles.alertCard}>
                            <View style={styles.alertIcon}>
                                <Bell size={20} color="#92400e" />
                            </View>
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Text style={styles.alertTitle}>Atenção</Text>
                                <Text style={styles.alertSub}>{pendingNews.length} novas sugestões de notícias para revisar.</Text>
                            </View>
                            <ChevronRight size={18} color="#b45309" />
                        </TouchableOpacity>
                    </View>
                )}

                {activeTab === 'news' && (
                    <View style={styles.listContainer}>
                        {pendingNews.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyEmoji}>🎉</Text>
                                <Text style={styles.emptyTitle}>Tudo em ordem!</Text>
                                <Text style={styles.emptySub}>Não há notícias aguardando aprovação.</Text>
                            </View>
                        ) : (
                            pendingNews.map(item => (
                                <View key={item.id} style={styles.approvalCard}>
                                    <Text style={styles.approvalTitle}>{item.title}</Text>
                                    <Text style={styles.approvalMeta}>
                                        Sugestão por {item.author_name || 'morador'} • {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                    </Text>
                                    <View style={styles.actionRow}>
                                        <TouchableOpacity onPress={() => approve('news', item.id)} style={[styles.actionBtn, styles.approveBtn]}>
                                            <CheckCircle size={16} color="white" />
                                            <Text style={styles.actionBtnText}>Aprovar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => reject('news', item.id)} style={[styles.actionBtn, styles.rejectBtn]}>
                                            <XCircle size={16} color="#ef4444" />
                                            <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Recusar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                )}

                {activeTab === 'shops' && (
                    <View style={styles.listContainer}>
                        {pendingShops.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyEmoji}>🏪</Text>
                                <Text style={styles.emptyTitle}>Nenhuma loja pendente</Text>
                                <Text style={styles.emptySub}>Novas solicitações de loja aparecerão aqui.</Text>
                            </View>
                        ) : (
                            pendingShops.map(shop => (
                                <View key={shop.id} style={styles.approvalCard}>
                                    <Text style={styles.approvalTitle}>{shop.name}</Text>
                                    <Text style={styles.approvalMeta}>
                                        Solicitação de {shop.owner_name} • {new Date(shop.created_at).toLocaleDateString('pt-BR')}
                                    </Text>
                                    {shop.description ? (
                                        <Text style={styles.approvalMeta} numberOfLines={2}>{shop.description}</Text>
                                    ) : null}
                                    <View style={styles.actionRow}>
                                        <TouchableOpacity onPress={() => approve('shops', shop.id)} style={[styles.actionBtn, styles.approveBtn]}>
                                            <CheckCircle size={16} color="white" />
                                            <Text style={styles.actionBtnText}>Aprovar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => reject('shops', shop.id)} style={[styles.actionBtn, styles.rejectBtn]}>
                                            <XCircle size={16} color="#ef4444" />
                                            <Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Recusar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </View>
                )}

                {activeTab === 'members' && (
                    <View style={styles.listContainer}>
                        {members.map(member => {
                            const role = ROLE_LABELS[member.role] || ROLE_LABELS.user;
                            return (
                                <TouchableOpacity key={member.id} onPress={() => changeRole(member)} style={styles.memberCard}>
                                    <View style={[styles.avatar, { backgroundColor: role.bg }]}>
                                        <Text style={[styles.avatarText, { color: role.color }]}>
                                            {(member.full_name || '?').substring(0, 2).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 16 }}>
                                        <Text style={styles.memberName}>{member.full_name}</Text>
                                        <Text style={styles.memberEmail}>{member.email}</Text>
                                    </View>
                                    <View style={[styles.roleBadge, { backgroundColor: role.bg }]}>
                                        <Text style={[styles.roleText, { color: role.color }]}>{role.label}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                        {members.length === 0 && (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyEmoji}>👥</Text>
                                <Text style={styles.emptyTitle}>Sem membros ainda</Text>
                                <Text style={styles.emptySub}>Os moradores cadastrados aparecerão aqui.</Text>
                            </View>
                        )}
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
        backgroundColor: '#7c3aed', paddingTop: 56, paddingBottom: 20, borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
    },
    headerTop: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 24,
    },
    iconBtn: {
        width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        color: 'white', fontSize: 20, fontWeight: '900',
    },
    headerSub: {
        color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600',
    },
    tabs: {
        paddingHorizontal: 20, gap: 10,
    },
    tab: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', gap: 8,
    },
    tabActive: {
        backgroundColor: '#ffffff',
    },
    tabText: {
        color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '800',
    },
    tabTextActive: {
        color: '#7c3aed',
    },
    scrollContent: {
        padding: 20, paddingBottom: 100,
    },
    dashboardGrid: {
        gap: 16,
    },
    statRow: {
        flexDirection: 'row', gap: 16,
    },
    statCard: {
        flex: 1, borderRadius: 28, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10, elevation: 2,
    },
    statVal: {
        fontSize: 24, fontWeight: '900', marginTop: 12,
    },
    statLabel: {
        fontSize: 12, color: '#64748b', fontWeight: '700', marginTop: 2,
    },
    alertCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb', padding: 20, borderRadius: 28, marginTop: 12, borderWidth: 1, borderColor: '#fef3c7',
    },
    alertIcon: {
        width: 48, height: 48, borderRadius: 16, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center',
    },
    alertTitle: {
        fontSize: 16, fontWeight: '900', color: '#92400e',
    },
    alertSub: {
        fontSize: 13, color: '#b45309', fontWeight: '600', marginTop: 2,
    },
    listContainer: {
        gap: 12,
    },
    approvalCard: {
        backgroundColor: 'white', borderRadius: 28, padding: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 3,
    },
    approvalTitle: {
        fontSize: 17, fontWeight: '800', color: '#1e293b',
    },
    approvalMeta: {
        fontSize: 13, color: '#94a3b8', marginTop: 4, marginBottom: 20,
    },
    actionRow: {
        flexDirection: 'row', gap: 12,
    },
    actionBtn: {
        flex: 1, height: 48, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    approveBtn: {
        backgroundColor: '#10b981',
    },
    rejectBtn: {
        backgroundColor: '#fef2f2',
    },
    actionBtnText: {
        color: 'white', fontSize: 14, fontWeight: '800',
    },
    emptyState: {
        alignItems: 'center', marginTop: 80,
    },
    emptyEmoji: {
        fontSize: 48, marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 20, fontWeight: '900', color: '#1e293b',
    },
    emptySub: {
        fontSize: 15, color: '#94a3b8', marginTop: 8,
    },
    memberCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 8, elevation: 2,
    },
    avatar: {
        width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    },
    avatarText: {
        fontSize: 18, fontWeight: '900',
    },
    memberName: {
        fontSize: 16, fontWeight: '800', color: '#1e293b',
    },
    memberEmail: {
        fontSize: 12, color: '#94a3b8', marginTop: 2,
    },
    roleBadge: {
        paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    },
    roleText: {
        fontSize: 10, fontWeight: '900', textTransform: 'uppercase',
    },
});
