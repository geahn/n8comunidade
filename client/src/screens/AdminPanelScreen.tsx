import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, StyleSheet, Dimensions } from 'react-native';
import { Package, Users, CheckCircle, XCircle, ChevronRight, X, Bell, LayoutDashboard, Newspaper, ShoppingBag, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const MOCK_PENDING_NEWS = [
    { id: '1', title: 'Buraco enorme na Rua das Palmeiras', author: 'João Silva', date: '2026-03-04' },
    { id: '2', title: 'Evento de integração no próximo domingo', author: 'Maria Santos', date: '2026-03-03' },
];

const MOCK_PENDING_SHOPS = [
    { id: '1', name: 'Pet Shop do Bairro', owner: 'Carlos Lima', date: '2026-03-04' },
];

const MOCK_MEMBERS = [
    { id: '1', name: 'João Silva', email: 'joao@email.com', role: 'user', joined: '2026-01-01' },
    { id: '2', name: 'Maria Santos', email: 'maria@email.com', role: 'user', joined: '2026-01-15' },
    { id: '3', name: '(Você) Geahn Daniel', email: 'contato@geahn.com', role: 'neighborhood_admin', joined: '2026-02-01' },
];

const ROLE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    user: { label: 'Membro', color: '#64748b', bg: '#f1f5f9' },
    shopkeeper: { label: 'Lojista', color: '#059669', bg: '#ecfdf5' },
    neighborhood_admin: { label: 'Administrador', color: '#7c3aed', bg: '#f5f3ff' },
    global_admin: { label: 'Superadmin', color: '#dc2626', bg: '#fff1f2' },
};

export default function AdminPanelScreen({ navigation }: any) {
    const { user } = useAuth() as any;
    const [pendingNews, setPendingNews] = useState(MOCK_PENDING_NEWS);
    const [pendingShops, setPendingShops] = useState(MOCK_PENDING_SHOPS);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'news' | 'shops' | 'members'>('dashboard');

    const approve = (type: 'news' | 'shops', id: string) => {
        if (type === 'news') setPendingNews(p => p.filter(n => n.id !== id));
        else setPendingShops(p => p.filter(s => s.id !== id));
        Alert.alert('✅ Aprovado com sucesso!');
    };

    const reject = (type: 'news' | 'shops', id: string) => {
        if (type === 'news') setPendingNews(p => p.filter(n => n.id !== id));
        else setPendingShops(p => p.filter(s => s.id !== id));
        Alert.alert('❌ Solicitação recusada');
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
                        <Text style={styles.headerSub}>Bairro Exemplo</Text>
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

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {activeTab === 'dashboard' && (
                    <View style={styles.dashboardGrid}>
                        <View style={styles.statRow}>
                            <View style={[styles.statCard, { backgroundColor: '#f5f3ff' }]}>
                                <Users size={24} color="#7c3aed" />
                                <Text style={[styles.statVal, { color: '#7c3aed' }]}>{MOCK_MEMBERS.length}</Text>
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
                                <Text style={[styles.statVal, { color: '#10b981' }]}>12</Text>
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
                                    <Text style={styles.approvalMeta}>Sugestão por {item.author} • {item.date}</Text>
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

                {/* Similar logic for 'shops' and 'members'... */}
                {activeTab === 'members' && (
                    <View style={styles.listContainer}>
                        {MOCK_MEMBERS.map(member => {
                            const role = ROLE_LABELS[member.role] || ROLE_LABELS.user;
                            return (
                                <TouchableOpacity key={member.id} style={styles.memberCard}>
                                    <View style={[styles.avatar, { backgroundColor: role.bg }]}>
                                        <Text style={[styles.avatarText, { color: role.color }]}>{member.name.substring(0, 2).toUpperCase()}</Text>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 16 }}>
                                        <Text style={styles.memberName}>{member.name}</Text>
                                        <Text style={styles.memberEmail}>{member.email}</Text>
                                    </View>
                                    <View style={[styles.roleBadge, { backgroundColor: role.bg }]}>
                                        <Text style={[styles.roleText, { color: role.color }]}>{role.label}</Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
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
