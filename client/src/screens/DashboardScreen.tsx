import React, { useRef, useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    ActivityIndicator, Image, Animated, Dimensions, RefreshControl, Modal, StyleSheet, StatusBar
} from 'react-native';
import { Bell, Search, MapPin, ChevronDown, ChevronRight, Check, ShoppingBag, LayoutGrid, Newspaper, Heart, MessageCircle } from 'lucide-react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

import { API_URL } from '../api';
import FloatingNav from '../components/FloatingNav';
import GlassView from '../components/GlassView';

const { width } = Dimensions.get('window');
const HEADER_FULL_H = 110;
const HEADER_MINI_H = 88;
const SCROLL_DIST = HEADER_FULL_H - HEADER_MINI_H;

const isDesktop = width >= 1024;
const MAX_CONTENT_WIDTH = 1200;

const MOCK_NEIGHBORHOODS = [
    { id: '1', name: 'Bairro Exemplo', city: 'São Paulo' },
    { id: '2', name: 'Vila Nova', city: 'São Paulo' },
    { id: '3', name: 'Jardim das Flores', city: 'São Paulo' },
];

const getDynamicBanners = (neighborhoodId: string | number | undefined) => {
    const defaultBanners = [
        { id: '1', image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80', title: 'Festival Gastronômico', subtitle: 'Este fim de semana • Grátis', action: { type: 'screen', target: 'Lojas', params: { category: 'Restaurante' } } },
        { id: '2', image_url: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=800&q=80', title: 'Açaí com 15% OFF', subtitle: 'Aproveite o calor com desconto', action: { type: 'screen', target: 'Lojas', params: { category: 'Sorveteria', hasPromo: true } } },
        { id: '3', image_url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80', title: 'Campeonato de Skate', subtitle: 'Sábado às 14h na nova praça', action: null },
    ];

    if (!neighborhoodId) return defaultBanners;

    // Create a deterministic pseudo-random variation based on the neighborhood ID
    const seed = String(neighborhoodId).charCodeAt(0) % 3;

    if (seed === 0) {
        return [
            { id: '10', image_url: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800&q=80', title: 'Feira Livre Hoje!', subtitle: 'Frutas e verduras frescas', action: { type: 'screen', target: 'Lojas' } },
            { id: '11', image_url: 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d?w=800&q=80', title: 'Adoção de Pets', subtitle: 'Domingo na praça central', action: null },
        ];
    } else if (seed === 1) {
        return [
            { id: '20', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', title: 'Trilha no Parque', subtitle: 'Junte-se ao grupo local', action: null },
            { id: '21', image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', title: 'Nova Pizzaria', subtitle: 'Cupom: VIZINHO10', action: { type: 'screen', target: 'Lojas' } },
            { id: '22', image_url: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=800&q=80', title: 'Bazar Comunitário', subtitle: 'Roupas com até 70% OFF', action: { type: 'screen', target: 'Classificados' } },
        ];
    } else {
        return [
            { id: '30', image_url: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&q=80', title: 'Aulas de Culinária', subtitle: 'Inscrições abertas no centro', action: null },
            { id: '31', image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80', title: 'Cafeteria do Bairro', subtitle: 'Café em dobro até as 10h', action: { type: 'screen', target: 'Lojas' } },
        ];
    }
};

const QUICK_ACTIONS = [
    { label: 'Mercado', emoji: '🍎', color: '#10b981', tab: 'Lojas', desc: 'Fresco e rápido' },
    { label: 'Restaurantes', emoji: '🍔', color: '#ef4444', tab: 'Lojas', desc: 'Comida boa' },
    { label: 'Classificados', emoji: '📢', color: '#8b5cf6', tab: 'Classificados', desc: 'Venda & Troque' },
    { label: 'Serviços', emoji: '🛠️', color: '#f59e0b', tab: 'Classificados', desc: 'Profissionais' },
];

const BANNER_WIDTH = width - 40;
const BANNER_INTERVAL = 5000;

export default function DashboardScreen({ navigation }: any) {
    const { token, user, selectedNeighborhood, setSelectedNeighborhood }: any = useAuth();
    const [data, setData] = useState<any>({ news: [], shops: [], ads: [], banners: [] });
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [neighborhoodModal, setNeighborhoodModal] = useState(false);
    const [addContentModal, setAddContentModal] = useState(false);
    const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
    const [bannerIndex, setBannerIndex] = useState(0);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchVisible, setSearchVisible] = useState(false);

    const scrollY = useRef(new Animated.Value(0)).current;
    const bannerScrollRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (token) {
            fetchNeighborhoods();
        }
    }, [token]);

    useEffect(() => {
        if (token && selectedNeighborhood?.id) {
            fetchData();
        }
    }, [token, selectedNeighborhood]);

    const fetchData = async () => {
        if (!selectedNeighborhood?.id) return;
        try {
            const r = await axios.get(`${API_URL}/api/dashboard?neighborhoodId=${selectedNeighborhood.id}`, {
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

    const fetchNeighborhoods = async () => {
        try {
            const r = await axios.get(`${API_URL}/api/neighborhoods`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNeighborhoods(r.data);

            // Set initial neighborhood from user or first available if none selected
            if (!selectedNeighborhood) {
                if (user?.neighborhood_id) {
                    const found = r.data.find((n: any) => n.id === user.neighborhood_id);
                    if (found) setSelectedNeighborhood(found);
                    else if (r.data.length > 0) setSelectedNeighborhood(r.data[0]);
                } else if (r.data.length > 0) {
                    setSelectedNeighborhood(r.data[0]);
                }
            }
        } catch (err) {
            console.error('Fetch neighborhoods error:', err);
        }
    };

    const handleSearch = async (text: string) => {
        setSearchQuery(text);
        if (text.length > 2) {
            setIsSearching(true);
            try {
                const nId = selectedNeighborhood?.id || user?.neighborhood_id;
                const r = await axios.get(`${API_URL}/api/search?q=${text}&neighborhoodId=${nId}`, {
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

    const searchOpacity = scrollY.interpolate({
        inputRange: [0, 40],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const searchScale = scrollY.interpolate({
        inputRange: [0, 60],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const searchHeight = scrollY.interpolate({
        inputRange: [0, 60],
        outputRange: [52, 0],
        extrapolate: 'clamp',
    });

    const initials = user?.full_name?.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() || 'U';

    const onRefresh = () => { setRefreshing(true); fetchData(); };

    return (
        <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            {/* ─── Persistent Header (Fixed) ─── */}
            <View style={styles.headerSimple}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatarMini}>
                        {user?.avatar_url ? (
                            <Image source={{ uri: user.avatar_url }} style={styles.avatarImg} />
                        ) : (
                            <Text style={styles.avatarLetter}>{initials}</Text>
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setNeighborhoodModal(true)} style={styles.locTrigger}>
                        <Text style={styles.locText} numberOfLines={1}>
                            {selectedNeighborhood?.name || 'Pontakayana'}
                        </Text>
                        <ChevronDown size={14} color="white" strokeWidth={3} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartBtn}>
                    <ShoppingBag size={22} color="white" />
                    <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>3</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* ─── Content ─── */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 140 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E88E5" />}
            >
                {/* 1. Banner Carousel - TOP */}
                <ScrollView
                    ref={bannerScrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={{ marginTop: 0 }}
                >
                    {getDynamicBanners(selectedNeighborhood?.id || 1).map((b: any) => (
                        <TouchableOpacity key={b.id} style={{ width, aspectRatio: 16 / 9 }} activeOpacity={0.9} onPress={() => {
                            if (b.action?.type === 'screen') navigation.navigate(b.action.target, b.action.params);
                        }}>
                            <Image source={{ uri: b.image_url }} style={{ width: '100%', height: '100%' }} />
                            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', justifyContent: 'flex-end', padding: 20 }}>
                                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.4)', borderTopColor: 'transparent', height: '150%', bottom: 0, top: undefined }]} />
                                <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: '900', zIndex: 1 }}>{b.title}</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: 16, marginTop: 4, zIndex: 1, fontWeight: '600' }}>{b.subtitle}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* 2. Search Bar - Below Banner */}
                <View style={styles.mainSearchContainer}>
                    <View style={styles.mainSearchBox}>
                        <Search size={20} color="#94a3b8" />
                        <TextInput
                            placeholder="Buscar no bairro..."
                            placeholderTextColor="#94a3b8"
                            style={styles.mainSearchInput}
                            value={searchQuery}
                            onChangeText={handleSearch}
                            onFocus={() => searchQuery.length > 2 && setSearchVisible(true)}
                        />
                        {isSearching && <ActivityIndicator size="small" color="#1E88E5" style={{ marginLeft: 8 }} />}
                    </View>
                </View>

                {/* 3. Category Grid - Below Search */}
                <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        {(data.banners && data.banners.length > 0 ? data.banners.slice(0, 4) : QUICK_ACTIONS).map((item: any) => (
                            <TouchableOpacity
                                key={item.id || item.label}
                                onPress={() => {
                                    if (item.action_type === 'screen' || item.action?.type === 'screen') {
                                        navigation.navigate(item.action_target || item.action?.target);
                                    } else if (item.tab) navigation.navigate(item.tab);
                                }}
                                style={{ width: (width - 32 - 24) / 4, backgroundColor: '#ffffff', borderRadius: 20, padding: 8, alignItems: 'center', borderColor: '#f1f5f9', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 1 }}
                                activeOpacity={0.8}
                            >
                                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
                                    <Text style={{ fontSize: 24 }}>{item.emoji || '✨'}</Text>
                                </View>
                                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#334155', textAlign: 'center' }} numberOfLines={1}>
                                    {item.title || item.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 4. Stats Summary Card */}
                <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                    <View style={styles.statsCard}>
                        <View style={styles.statItem}>
                            <Text style={styles.statVal}>25</Text>
                            <Text style={styles.statLabel}>Lojas</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statVal}>53</Text>
                            <Text style={styles.statLabel}>Anúncios</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                            <Text style={styles.statVal}>301</Text>
                            <Text style={styles.statLabel}>Vizinhança</Text>
                        </View>
                    </View>
                </View>

                {/* Section: Shops (Reference Layout) */}
                <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0f172a' }}>Lojas em Destaque</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Negócios')} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ color: '#1E88E5', fontSize: 14, fontWeight: '500' }}>Ver mais</Text>
                            <ChevronRight size={16} color="#1E88E5" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -16 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}>
                        {data.shops.length > 0 ? data.shops.map((shop: any) => (
                            <TouchableOpacity key={shop.id} onPress={() => navigation.navigate('ShopDetail', { shop })} style={{ width: 140, backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0' }}>
                                <View style={{ width: '100%', aspectRatio: 1 }}>
                                    <Image source={{ uri: shop.cover_url || 'https://images.unsplash.com/photo-1625331725309-83e4f3c1373b?w=400&q=80' }} style={{ width: '100%', height: '100%' }} />
                                    {/* Mock Badge */}
                                    <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#1E88E5', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8 }}>
                                        <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>Em alta</Text>
                                    </View>
                                </View>
                                <View style={{ padding: 12 }}>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 2 }} numberOfLines={1}>{shop.name}</Text>
                                    <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>{shop.category || 'Loja Local'}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Text style={{ fontSize: 12, color: '#eab308' }}>★</Text>
                                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#334155' }}>{shop.rating || '4.8'}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )) : (
                            loading ? (
                                <ActivityIndicator color="#1d4ed8" style={{ padding: 40 }} />
                            ) : (
                                <View style={[styles.emptyCard, { width: width - 32 }]}><Text style={styles.emptyText}>Nenhuma loja encontrada.</Text></View>
                            )
                        )}
                    </ScrollView>
                </View>

                {/* Section: Classifieds (Reference Layout) */}
                <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0f172a' }}>Classificados</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Classificados')} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ color: '#1E88E5', fontSize: 14, fontWeight: '500' }}>Ver mais</Text>
                            <ChevronRight size={16} color="#1E88E5" />
                        </TouchableOpacity>
                    </View>
                    <View style={{ gap: 12 }}>
                        {data.ads.length > 0 ? data.ads.slice(0, 4).map((ad: any) => (
                            <TouchableOpacity key={ad.id} onPress={() => navigation.navigate('ClassifiedDetail', { ad })} style={{ flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0' }}>
                                <View style={{ width: 110, height: 110 }}>
                                    <Image source={{ uri: ad.image_url || 'https://images.unsplash.com/photo-1741061961703-0739f3454314?w=400&q=80' }} style={{ width: '100%', height: '100%' }} />
                                </View>
                                <View style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}>
                                    <View>
                                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 }} numberOfLines={1}>{ad.title}</Text>
                                        <Text style={{ fontSize: 12, color: '#475569', marginBottom: 8 }} numberOfLines={2}>{ad.description || 'Produto em ótimo estado, aproveite esta oportunidade no seu bairro.'}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1E88E5' }}>R$ {parseFloat(ad.price || 0).toFixed(2)}</Text>
                                        <Text style={{ fontSize: 12, color: '#1E88E5' }}>Ver mais</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        )) : (
                            <Text style={{ textAlign: 'center', color: '#94a3b8', marginTop: 10 }}>Nenhum anúncio disponível.</Text>
                        )}
                    </View>
                </View>

                {/* Donation Banner */}
                <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
                    <TouchableOpacity onPress={() => navigation.navigate('Social')} style={{ backgroundColor: '#0D47A1', borderRadius: 16, padding: 24 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>Ajude Famílias do Bairro</Text>
                                <Text style={{ color: '#bfdbfe', fontSize: 14 }}>Doe cestas básicas e faça a diferença</Text>
                            </View>
                            <ChevronRight size={24} color="white" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Section: News (Reference Layout) */}
                <View style={{ paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 24 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#0f172a' }}>Notícias</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Notícias')} style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ color: '#1E88E5', fontSize: 14, fontWeight: '500' }}>Ver mais</Text>
                            <ChevronRight size={16} color="#1E88E5" />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        {data.news.length > 0 ? data.news.slice(0, 4).map((n: any) => (
                            <TouchableOpacity key={n.id} onPress={() => navigation.navigate('NewsDetail', { news: n })} style={{ width: (width - 32 - 12) / 2, backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12 }}>
                                <View style={{ width: '100%', aspectRatio: 16 / 9 }}>
                                    <Image source={{ uri: n.image_url || 'https://via.placeholder.com/300' }} style={{ width: '100%', height: '100%' }} />
                                </View>
                                <View style={{ padding: 12 }}>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#0f172a' }} numberOfLines={2}>{n.title}</Text>
                                </View>
                            </TouchableOpacity>
                        )) : (
                            <View style={[styles.emptyCard, { width: width - 32 }]}><Text style={styles.emptyText}>Sem notícias no momento</Text></View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* ─── Floating Navigation ─── */}
            <FloatingNav
                activeTab="Bairro"
                onTabPress={(tab) => {
                    if (tab === 'Bairro') return;
                    navigation.navigate(tab);
                }}
                onPlusPress={() => {
                    setAddContentModal(true);
                }}
            />

            {/* ─── Add Content Modal (Reference Layout) ─── */}
            <Modal visible={addContentModal} animationType="fade" transparent>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setAddContentModal(false)}
                    style={styles.modalOverlay}
                >
                    <GlassView intensity={50} style={styles.contentModal}>
                        <View style={styles.modalDrag} />
                        <Text style={styles.modalTitleLarge}>Adicionar Conteúdo</Text>

                        <View style={{ gap: 16 }}>
                            <TouchableOpacity
                                style={styles.actionItem}
                                onPress={() => { setAddContentModal(false); navigation.navigate('Classificados'); }}
                            >
                                <View style={[styles.actionIconWrap, { backgroundColor: '#E3F2FD' }]}>
                                    <Newspaper size={24} color="#1E88E5" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.actionTitle}>Adicionar Classificado</Text>
                                    <Text style={styles.actionSub}>Venda produtos ou ofereça serviços</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionItem}
                                onPress={() => { setAddContentModal(false); navigation.navigate('Notícias'); }}
                            >
                                <View style={[styles.actionIconWrap, { backgroundColor: '#E3F2FD' }]}>
                                    <MessageCircle size={24} color="#1E88E5" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.actionTitle}>Sugerir Notícia</Text>
                                    <Text style={styles.actionSub}>Compartilhe novidades do bairro</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionItem, { backgroundColor: '#1E88E5' }]}
                                onPress={() => { setAddContentModal(false); /* navigation.navigate('RegisterStore'); */ }}
                            >
                                <View style={[styles.actionIconWrap, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                    <ShoppingBag size={24} color="white" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.actionTitle, { color: 'white' }]}>Cadastrar meu negócio</Text>
                                    <Text style={[styles.actionSub, { color: 'rgba(255,255,255,0.8)' }]}>Alcance mais clientes no bairro</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </GlassView>
                </TouchableOpacity>
            </Modal>

            {/* Neighborhood Selector Modal */}
            <Modal visible={neighborhoodModal} animationType="slide" transparent>
                <TouchableOpacity activeOpacity={1} onPress={() => setNeighborhoodModal(false)} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalDrag} />
                        <Text style={styles.modalTitle}>Explorar a vizinhança</Text>
                        <Text style={styles.modalSub}>Selecione um bairro para ver o que há de novo.</Text>
                        {neighborhoods.map(n => (
                            <TouchableOpacity key={n.id} onPress={() => { setSelectedNeighborhood(n); setNeighborhoodModal(false); }} style={[styles.nItem, selectedNeighborhood?.id === n.id && styles.nItemActive]}>
                                <View style={[styles.nIcon, selectedNeighborhood?.id === n.id && styles.nIconActive]}>
                                    <MapPin size={20} color={selectedNeighborhood?.id === n.id ? 'white' : '#64748b'} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.nName}>{n.name}</Text>
                                    <Text style={styles.nLoc}>{n.city}</Text>
                                </View>
                                {selectedNeighborhood?.id === n.id && <Check size={20} color="#1d4ed8" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    headerSimple: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: '#1E88E5',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarMini: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
    },
    avatarLetter: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    locTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    locText: {
        fontSize: 18,
        fontWeight: '900',
        color: 'white',
    },
    cartBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#ef4444',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#1E88E5',
    },
    cartBadgeText: {
        color: 'white',
        fontSize: 8,
        fontWeight: 'bold',
    },
    mainSearchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    mainSearchBox: {
        backgroundColor: '#f1f5f9',
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 52,
    },
    mainSearchInput: {
        flex: 1,
        marginLeft: 10,
        color: '#1e293b',
        fontSize: 15,
        fontWeight: '500',
    },
    header: {
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: '#1d4ed8',
        borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
        shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 8,
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
        width: 140, aspectRatio: 4 / 3, borderRadius: 20, overflow: 'hidden', backgroundColor: '#1d4ed8',
        shadowColor: '#1d4ed8', shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
        padding: 16,
        justifyContent: 'space-between',
    },
    miniBannerContent: {
        zIndex: 2,
    },
    miniBannerLabel: {
        color: 'white', fontSize: 16, fontWeight: '900',
    },
    miniBannerDesc: {
        color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600', marginTop: 4,
    },
    miniBannerIconContainer: {
        position: 'absolute', bottom: -15, right: -15, zIndex: 1,
        width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center', justifyContent: 'center',
    },
    miniBannerIcon: {
        width: 60, height: 60, borderRadius: 30,
    },
    miniBannerEmoji: {
        fontSize: 36,
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
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16, marginTop: 24,
    },
    sectionTitle: {
        fontSize: 22, fontWeight: '900', color: '#0f172a', letterSpacing: -0.5,
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
        fontSize: 12, color: '#94a3b8',
    },
    newsCard: {
        width: 260, backgroundColor: 'white', borderRadius: 20, marginRight: 16,
        overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    },
    newsImage: {
        width: '100%', height: 120,
    },
    newsContent: {
        padding: 12,
    },
    newsDate: {
        fontSize: 11, color: '#94a3b8', marginBottom: 4,
    },
    newsTitle: {
        fontSize: 14, fontWeight: '700', color: '#1e293b',
    },
    contentModal: {
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 60,
        width: '100%',
        marginTop: 'auto',
    },
    modalTitleLarge: {
        fontSize: 22,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 24,
    },
    statsCard: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statVal: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1E88E5',
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
        fontWeight: '600',
    },
    statDivider: {
        width: 1,
        height: '60%',
        backgroundColor: '#f1f5f9',
        alignSelf: 'center',
    },
    actionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        gap: 16,
    },
    actionIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
    },
    actionSub: {
        fontSize: 12,
        color: '#717182',
        marginTop: 2,
    },
    emptyCard: {
        padding: 40, alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 20, width: width - 40,
    },
    emptyText: {
        fontSize: 14, color: '#64748b', marginTop: 12, textAlign: 'center',
    },
});
