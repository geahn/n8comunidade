import React, { useRef, useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    ActivityIndicator, Image, Animated, Dimensions, RefreshControl, Modal, StyleSheet
} from 'react-native';
import { Bell, Search, MapPin, ChevronDown, ChevronRight, Check, ShoppingBag, LayoutGrid, Newspaper, Heart } from 'lucide-react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

import { API_URL } from '../api';

const { width } = Dimensions.get('window');
const HEADER_FULL_H = 190;
const HEADER_MINI_H = 100;
const SCROLL_DIST = HEADER_FULL_H - HEADER_MINI_H;

const isDesktop = width >= 1024;
const MAX_CONTENT_WIDTH = 1200;

const MOCK_NEIGHBORHOODS = [
    { id: '1', name: 'Bairro Exemplo', city: 'São Paulo' },
    { id: '2', name: 'Vila Nova', city: 'São Paulo' },
    { id: '3', name: 'Jardim das Flores', city: 'São Paulo' },
];

const MOCK_BANNERS = [
    { id: '1', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', title: 'Festival Gastronômico', subtitle: 'Este fim de semana • Grátis', action: { type: 'screen', target: 'Lojas', params: { category: 'Restaurante' } } },
    { id: '2', image_url: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=800&q=80', title: 'Açaí com 15% OFF', subtitle: 'Aproveite o calor com desconto', action: { type: 'screen', target: 'Lojas', params: { category: 'Sorveteria', hasPromo: true } } },
    { id: '3', image_url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80', title: 'Campeonato de Skate', subtitle: 'Sábado às 14h na nova praça', action: null },
];

const QUICK_ACTIONS = [
    { label: 'Mercado', emoji: '🍎', color: '#10b981', tab: 'Lojas', desc: 'Fresco e rápido' },
    { label: 'Restaurantes', emoji: '🍔', color: '#ef4444', tab: 'Lojas', desc: 'Comida boa' },
    { label: 'Classificados', emoji: '📢', color: '#8b5cf6', tab: 'Classificados', desc: 'Venda & Troque' },
    { label: 'Serviços', emoji: '🛠️', color: '#f59e0b', tab: 'Classificados', desc: 'Profissionais' },
];

const BANNER_WIDTH = width - 40;
const BANNER_INTERVAL = 5000;

export default function DashboardScreen({ navigation }: any) {
    const { token, user }: any = useAuth();
    const [data, setData] = useState<any>({ news: [], shops: [], ads: [] });
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [neighborhoodModal, setNeighborhoodModal] = useState(false);
    const [currentNeighborhood, setCurrentNeighborhood] = useState(MOCK_NEIGHBORHOODS[0]);
    const [bannerIndex, setBannerIndex] = useState(0);

    const scrollY = useRef(new Animated.Value(0)).current;
    const bannerScrollRef = useRef<ScrollView>(null);

    const fetchData = async () => {
        try {
            const r = await axios.get(`${API_URL}/api/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(r.data);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    // Header Animations
    const headerHeight = scrollY.interpolate({
        inputRange: [0, SCROLL_DIST],
        outputRange: [HEADER_FULL_H, HEADER_MINI_H],
        extrapolate: 'clamp',
    });

    const headerBgOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_DIST],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const searchTranslateY = scrollY.interpolate({
        inputRange: [0, SCROLL_DIST],
        outputRange: [0, -50],
        extrapolate: 'clamp',
    });

    const searchScale = scrollY.interpolate({
        inputRange: [0, SCROLL_DIST],
        outputRange: [1, 0.9],
        extrapolate: 'clamp',
    });

    const initials = user?.full_name?.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() || 'U';

    const onRefresh = () => { setRefreshing(true); fetchData(); };

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            {/* ─── Premium Header ─── */}
            <Animated.View style={[styles.header, { height: headerHeight }]}>
                {/* Background color transition */}
                <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#1d4ed8', opacity: headerBgOpacity }]} />

                <View style={styles.headerContent}>
                    <View style={styles.headerTop}>
                        {/* Neighborhood Picker */}
                        <TouchableOpacity onPress={() => setNeighborhoodModal(true)} style={styles.locationSelector}>
                            <View style={styles.mapIconCircle}>
                                <MapPin size={14} color="#1d4ed8" />
                            </View>
                            <View>
                                <Text style={styles.locationLabel}>Bairro atual</Text>
                                <View style={styles.locationContainer}>
                                    <Text style={styles.locationName}>{currentNeighborhood.name}</Text>
                                    <ChevronDown size={14} color="#1e293b" />
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* User Actions */}
                        <View style={styles.userActions}>
                            <TouchableOpacity style={styles.actionButton}>
                                <Bell size={20} color="#1e293b" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarButton}>
                                {user?.avatar_url ? (
                                    <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
                                ) : (
                                    <Text style={styles.avatarText}>{initials}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <Animated.View style={[styles.searchContainer, { transform: [{ translateY: searchTranslateY }, { scale: searchScale }] }]}>
                        <Search size={18} color="#94a3b8" />
                        <TextInput
                            placeholder="O que você precisa hoje?"
                            placeholderTextColor="#94a3b8"
                            style={styles.searchInput}
                        />
                    </Animated.View>
                </View>
            </Animated.View>

            {/* ─── Content ─── */}
            <Animated.ScrollView
                scrollEventThrottle={16}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
                contentContainerStyle={{ paddingTop: HEADER_FULL_H + 10, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1d4ed8" />}
            >
                {/* Banner Carousel */}
                <ScrollView
                    ref={bannerScrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={styles.bannerContainer}
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                >
                    {MOCK_BANNERS.map(b => (
                        <TouchableOpacity key={b.id} style={styles.bannerItem} activeOpacity={0.9}>
                            <Image source={{ uri: b.image_url }} style={styles.bannerImage} />
                            <View style={styles.bannerOverlay}>
                                <Text style={styles.bannerTitle}>{b.title}</Text>
                                <Text style={styles.bannerSubtitle}>{b.subtitle}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Quick Access Menu */}
                <View style={styles.quickAccess}>
                    {QUICK_ACTIONS.map(item => (
                        <TouchableOpacity key={item.label} onPress={() => navigation.navigate(item.tab)} style={styles.quickActionItem}>
                            <View style={[styles.quickActionIcon, { backgroundColor: item.color + '10' }]}>
                                <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
                            </View>
                            <Text style={styles.quickActionLabel}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Section: Shops (iFood Style) */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Lojas no bairro</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Lojas')}>
                        <Text style={styles.seeAll}>Ver todas</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
                    {data.shops.length > 0 ? data.shops.map((shop: any) => (
                        <TouchableOpacity key={shop.id} onPress={() => navigation.navigate('ShopDetail', { shop })} style={styles.shopCard}>
                            <Image source={{ uri: shop.cover_url || 'https://via.placeholder.com/150' }} style={styles.shopImage} />
                            <View style={styles.shopContent}>
                                <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
                                <View style={styles.shopStats}>
                                    <Text style={styles.shopRating}>⭐ {shop.rating || 'N/A'}</Text>
                                    <Text style={styles.shopDistance}>• 1.2km</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )) : (
                        <ActivityIndicator color="#1d4ed8" style={{ padding: 40 }} />
                    )}
                </ScrollView>

                {/* Section: Classifieds (OLX Style) */}
                <View style={[styles.sectionHeader, { marginTop: 32 }]}>
                    <Text style={styles.sectionTitle}>Classificados recentes</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Classificados')}>
                        <Text style={styles.seeAll}>Ver todos</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ paddingHorizontal: 20 }}>
                    {data.ads.length > 0 ? data.ads.slice(0, 4).map((ad: any) => (
                        <TouchableOpacity key={ad.id} onPress={() => navigation.navigate('ClassifiedDetail', { ad })} style={styles.adCard}>
                            <Image source={{ uri: ad.images?.[0] || 'https://via.placeholder.com/100' }} style={styles.adImage} />
                            <View style={styles.adContent}>
                                <Text style={styles.adTitle} numberOfLines={1}>{ad.title}</Text>
                                <Text style={styles.adCategory}>{ad.category}</Text>
                                <Text style={styles.adPrice}>R$ {parseFloat(ad.price).toFixed(2)}</Text>
                            </View>
                            <ChevronRight size={18} color="#cbd5e1" />
                        </TouchableOpacity>
                    )) : (
                        <Text style={{ textAlign: 'center', color: '#94a3b8', marginTop: 20 }}>Nenhum anúncio disponível.</Text>
                    )}
                </View>
            </Animated.ScrollView>

            {/* Neighborhood Selector Modal */}
            <Modal visible={neighborhoodModal} animationType="slide" transparent>
                <TouchableOpacity activeOpacity={1} onPress={() => setNeighborhoodModal(false)} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalDrag} />
                        <Text style={styles.modalTitle}>Explorar a vizinhança</Text>
                        <Text style={styles.modalSub}>Selecione um bairro para ver o que há de novo.</Text>
                        {MOCK_NEIGHBORHOODS.map(n => (
                            <TouchableOpacity key={n.id} onPress={() => { setCurrentNeighborhood(n); setNeighborhoodModal(false); onRefresh(); }} style={[styles.nItem, currentNeighborhood.id === n.id && styles.nItemActive]}>
                                <View style={[styles.nIcon, currentNeighborhood.id === n.id && styles.nIconActive]}>
                                    <MapPin size={20} color={currentNeighborhood.id === n.id ? 'white' : '#64748b'} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.nName}>{n.name}</Text>
                                    <Text style={styles.nLoc}>{n.city}</Text>
                                </View>
                                {currentNeighborhood.id === n.id && <Check size={20} color="#1d4ed8" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
        shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 15, elevation: 5,
    },
    headerContent: {
        paddingHorizontal: 20, paddingTop: 55,
    },
    headerTop: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
    },
    locationSelector: {
        flexDirection: 'row', alignItems: 'center', flex: 1,
    },
    mapIconCircle: {
        width: 34, height: 34, borderRadius: 17, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    locationLabel: {
        fontSize: 11, color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5,
    },
    locationContainer: {
        flexDirection: 'row', alignItems: 'center',
    },
    locationName: {
        fontSize: 18, fontWeight: '800', color: '#1e293b', marginRight: 4,
    },
    userActions: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
    },
    actionButton: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center',
    },
    avatarButton: {
        width: 44, height: 44, borderRadius: 16, backgroundColor: '#1d4ed8', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    },
    avatar: {
        width: '100%', height: '100%',
    },
    avatarText: {
        color: '#ffffff', fontWeight: '800', fontSize: 16,
    },
    searchContainer: {
        backgroundColor: '#f1f5f9', borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 52,
    },
    searchInput: {
        flex: 1, marginLeft: 10, color: '#1e293b', fontSize: 15, fontWeight: '500',
    },
    bannerContainer: {
        marginTop: 10,
    },
    bannerItem: {
        width: BANNER_WIDTH, aspectRatio: 16 / 9, borderRadius: 24, overflow: 'hidden',
    },
    bannerImage: {
        width: '100%', height: '100%',
    },
    bannerOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: 'rgba(0,0,0,0.35)',
    },
    bannerTitle: {
        color: '#ffffff', fontSize: 22, fontWeight: '900',
    },
    bannerSubtitle: {
        color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 2, fontWeight: '600',
    },
    quickAccess: {
        flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, marginTop: 24, justifyContent: 'space-between',
    },
    quickActionItem: {
        width: '23%', alignItems: 'center', marginBottom: 16,
    },
    quickActionIcon: {
        width: 68, height: 68, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 10,
    },
    quickActionLabel: {
        fontSize: 12, fontWeight: '700', color: '#334155', textAlign: 'center',
    },
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16, marginTop: 16,
    },
    sectionTitle: {
        fontSize: 20, fontWeight: '800', color: '#0f172a',
    },
    seeAll: {
        color: '#1d4ed8', fontWeight: '700', fontSize: 14,
    },
    shopCard: {
        width: 140, marginRight: 4,
    },
    shopImage: {
        width: 140, height: 140, borderRadius: 20, marginBottom: 8,
    },
    shopContent: {
        paddingHorizontal: 2,
    },
    shopName: {
        fontSize: 15, fontWeight: '700', color: '#1e293b',
    },
    shopStats: {
        flexDirection: 'row', alignItems: 'center', marginTop: 2,
    },
    shopRating: {
        fontSize: 12, color: '#f59e0b', fontWeight: '700',
    },
    shopDistance: {
        fontSize: 12, color: '#94a3b8', marginLeft: 4,
    },
    adCard: {
        backgroundColor: '#ffffff', borderRadius: 20, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center',
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2,
    },
    adImage: {
        width: 70, height: 70, borderRadius: 16, marginRight: 16,
    },
    adContent: {
        flex: 1,
    },
    adTitle: {
        fontSize: 16, fontWeight: '700', color: '#1e293b',
    },
    adCategory: {
        fontSize: 12, color: '#94a3b8', marginTop: 2, fontWeight: '600',
    },
    adPrice: {
        fontSize: 16, fontWeight: '800', color: '#1d4ed8', marginTop: 4,
    },
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(2,6,23,0.5)', justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#ffffff', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 24, paddingBottom: 40,
    },
    modalDrag: {
        width: 48, height: 5, backgroundColor: '#e2e8f0', borderRadius: 3, alignSelf: 'center', marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24, fontWeight: '900', color: '#0f172a', marginBottom: 8,
    },
    modalSub: {
        fontSize: 16, color: '#64748b', marginBottom: 24, fontWeight: '500',
    },
    nItem: {
        flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, marginBottom: 12, backgroundColor: '#f8fafc',
    },
    nItemActive: {
        backgroundColor: '#eff6ff', borderWidth: 2, borderColor: '#1d4ed8',
    },
    nIcon: {
        width: 48, height: 48, borderRadius: 16, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', marginRight: 16,
    },
    nIconActive: {
        backgroundColor: '#1d4ed8',
    },
    nName: {
        fontSize: 17, fontWeight: '800', color: '#1e293b',
    },
    nLoc: {
        fontSize: 13, color: '#94a3b8', fontWeight: '500',
    },
});
