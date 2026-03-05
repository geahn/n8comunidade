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
    const [data, setData] = useState<any>({ news: [], shops: [], ads: [], banners: [] });
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [neighborhoodModal, setNeighborhoodModal] = useState(false);
    const [currentNeighborhood, setCurrentNeighborhood] = useState(MOCK_NEIGHBORHOODS[0]);
    const [bannerIndex, setBannerIndex] = useState(0);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchVisible, setSearchVisible] = useState(false);

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

    const handleSearch = async (text: string) => {
        setSearchQuery(text);
        if (text.length > 2) {
            setIsSearching(true);
            try {
                const r = await axios.get(`${API_URL}/api/search?q=${text}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSearchResults(r.data);
                setSearchVisible(true);
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchResults([]);
            setSearchVisible(false);
        }
    };

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
                            value={searchQuery}
                            onChangeText={handleSearch}
                            onFocus={() => searchQuery.length > 2 && setSearchVisible(true)}
                        />
                        {isSearching && <ActivityIndicator size="small" color="#1d4ed8" style={{ marginLeft: 8 }} />}
                    </Animated.View>
                </View>

                {/* Unified Search Results Overlay */}
                {searchVisible && searchResults.length > 0 && (
                    <View style={styles.searchResultsWrapper}>
                        <View style={styles.searchResultsContainer}>
                            <ScrollView style={{ maxHeight: 400 }}>
                                {searchResults.map((item, idx) => (
                                    <TouchableOpacity
                                        key={`${item.type}-${item.id}-${idx}`}
                                        style={styles.searchResultItem}
                                        onPress={() => {
                                            setSearchVisible(false);
                                            setSearchQuery('');
                                            if (item.type === 'shop') navigation.navigate('ShopDetail', { shop: item });
                                            else if (item.type === 'news') navigation.navigate('NewsDetail', { news: item });
                                            else if (item.type === 'ad') navigation.navigate('ClassifiedDetail', { ad: item });
                                        }}
                                    >
                                        <Image source={{ uri: item.image_url || 'https://via.placeholder.com/50' }} style={styles.searchResultImage} />
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <View style={styles.searchResultHeader}>
                                                <Text style={styles.searchResultTitle} numberOfLines={1}>{item.title}</Text>
                                                <View style={[styles.badge, styles[`badge_${item.type}` as keyof typeof styles]]}>
                                                    <Text style={styles.badgeText}>{item.type.toUpperCase()}</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.searchResultSub} numberOfLines={1}>
                                                {item.type === 'shop' ? `⭐ ${item.rating || 'N/A'}` : item.type === 'ad' ? `R$ ${item.price}` : 'Ver notícia'}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            <TouchableOpacity style={styles.closeSearch} onPress={() => setSearchVisible(false)}>
                                <Text style={styles.closeSearchText}>Fechar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
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

                {/* Mini Banners (Categories Replacement) */}
                <View style={[styles.sectionHeader, { marginTop: 10 }]}>
                    <Text style={styles.sectionTitle}>O que deseja hoje?</Text>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 10 }}
                >
                    {(data.banners && data.banners.length > 0 ? data.banners : QUICK_ACTIONS).map((item: any) => (
                        <TouchableOpacity
                            key={item.id || item.label}
                            onPress={() => {
                                if (item.action_type === 'screen') navigation.navigate(item.action_target);
                                else if (item.tab) navigation.navigate(item.tab);
                            }}
                            style={styles.miniBannerItem}
                        >
                            <Image
                                source={{ uri: item.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80' }}
                                style={styles.miniBannerImage}
                            />
                            <View style={styles.miniBannerOverlay}>
                                <Text style={styles.miniBannerLabel}>{item.title || item.label}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

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

                {/* Section: News */}
                <View style={[styles.sectionHeader, { marginTop: 32 }]}>
                    <Text style={styles.sectionTitle}>Últimas Notícias</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Notícias')}>
                        <Text style={styles.seeAll}>Ver todas</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}>
                    {data.news.length > 0 ? data.news.map((n: any) => (
                        <TouchableOpacity key={n.id} onPress={() => navigation.navigate('NewsDetail', { news: n })} style={styles.newsCard}>
                            <Image source={{ uri: n.image_url || 'https://via.placeholder.com/300' }} style={styles.newsImage} />
                            <View style={styles.newsContent}>
                                <Text style={styles.newsDate}>{new Date(n.created_at).toLocaleDateString()}</Text>
                                <Text style={styles.newsTitle} numberOfLines={2}>{n.title}</Text>
                            </View>
                        </TouchableOpacity>
                    )) : (
                        <View style={styles.emptyCard}><Text style={styles.emptyText}>Sem notícias no momento</Text></View>
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
                            <Image source={{ uri: ad.image_url || 'https://via.placeholder.com/100' }} style={styles.adImage} />
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
    miniBannerItem: {
        width: 120, height: 160, borderRadius: 20, overflow: 'hidden', backgroundColor: '#e2e8f0',
    },
    miniBannerImage: {
        width: '100%', height: '100%',
    },
    miniBannerOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, backgroundColor: 'rgba(0,0,0,0.4)',
    },
    miniBannerLabel: {
        color: 'white', fontSize: 13, fontWeight: '800', textAlign: 'center',
    },
    searchResultsWrapper: {
        position: 'absolute', top: 180, left: 20, right: 20, zIndex: 200,
    },
    searchResultsContainer: {
        backgroundColor: 'white', borderRadius: 24, padding: 10, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
    },
    searchResultItem: {
        flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
    },
    searchResultImage: {
        width: 50, height: 50, borderRadius: 12,
    },
    searchResultHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    searchResultTitle: {
        fontSize: 15, fontWeight: '700', color: '#1e293b', flex: 1,
    },
    searchResultSub: {
        fontSize: 13, color: '#64748b', marginTop: 2,
    },
    badge: {
        paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginLeft: 8,
    },
    badgeText: {
        fontSize: 9, fontWeight: '900', color: 'white',
    },
    badge_shop: { backgroundColor: '#10b981' },
    badge_news: { backgroundColor: '#3b82f6' },
    badge_ad: { backgroundColor: '#8b5cf6' },
    closeSearch: {
        padding: 12, alignItems: 'center',
    },
    closeSearchText: {
        color: '#1d4ed8', fontWeight: '800',
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
