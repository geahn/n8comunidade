import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, StyleSheet, Dimensions } from 'react-native';
import { Plus, Search, Tag, ChevronRight, X, DollarSign, FileText, ArrowLeft, Camera, Filter, Grid, List, ShoppingBag, Star } from 'lucide-react-native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../api';

const { width } = Dimensions.get('window');

const MOCK_SHOPS = [
    {
        id: '1', name: 'Burger & Grill House', category: 'Restaurante', rating: 4.8, open: true,
        logo_url: null, cover_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
        description: 'Os melhores hambúrgueres artesanais do bairro.',
        address: 'Rua das Flores, 123', phone: '(11) 99999-0001',
    },
    {
        id: '2', name: 'Açaí do Ponta', category: 'Sorveteria', rating: 4.9, open: true,
        logo_url: null, cover_url: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?w=600&q=80',
        description: 'O melhor açaí da região!',
        address: 'Av. Principal, 456', phone: '(11) 99999-0002',
    },
    {
        id: '3', name: 'Padaria Grão de Trigo', category: 'Padaria', rating: 4.7, open: true,
        logo_url: null, cover_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
        description: 'Pão fresquinho todo dia.',
        address: 'Rua da Paz, 789', phone: '(11) 99999-0003',
    },
    {
        id: '4', name: 'Farmácia Saúde & Vida', category: 'Farmácia', rating: 4.6, open: true,
        logo_url: null, cover_url: 'https://images.unsplash.com/photo-1512069772995-ec65ed45afd6?w=600&q=80',
        description: 'Atendimento humanizado.',
        address: 'Rua Saúde, 321', phone: '(11) 99999-0004',
    },
];

const CATEGORIES = ['Tudo', 'Restaurante', 'Sorveteria', 'Padaria', 'Farmácia', 'Lixo Zero', 'Pet Shop'];

export default function ShopsScreen({ route, navigation }: any) {
    const { token, selectedNeighborhood } = useAuth() as any;
    const { category: initialCategory } = route.params || {};
    const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'Tudo');
    const [search, setSearch] = useState('');
    const [shops, setShops] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchShops = async () => {
        if (!selectedNeighborhood?.id) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/shops?neighborhoodId=${selectedNeighborhood.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShops(res.data);
        } catch (err) {
            console.error('Error fetching shops:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token && selectedNeighborhood?.id) fetchShops();
    }, [token, selectedNeighborhood]);

    const filteredShops = shops.filter(shop => {
        const matchesCategory = selectedCategory === 'Tudo' || shop.category === selectedCategory;
        const matchesSearch = shop.name.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <View style={styles.container}>
            {/* Header Area */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <ArrowLeft size={22} color="#1e293b" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Lojas</Text>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Filter size={20} color="#1e293b" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchBar}>
                    <Search size={18} color="#94a3b8" />
                    <TextInput
                        placeholder="Buscar loja ou item..."
                        placeholderTextColor="#94a3b8"
                        value={search}
                        onChangeText={setSearch}
                        style={styles.searchInput}
                    />
                </View>

                {/* Categories Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={{ paddingRight: 40 }}>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                            style={[styles.catFilter, selectedCategory === cat && styles.catFilterActive]}
                        >
                            <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* List */}
            <ScrollView contentContainerStyle={styles.listContainer}>
                {filteredShops.length > 0 ? filteredShops.map(shop => (
                    <TouchableOpacity
                        key={shop.id}
                        onPress={() => navigation.navigate('ShopDetail', { shop })}
                        activeOpacity={0.9}
                        style={styles.shopCard}
                    >
                        <Image source={{ uri: shop.cover_url || 'https://via.placeholder.com/300' }} style={styles.shopCover} />
                        <View style={styles.shopContent}>
                            <View style={styles.shopHeaderRow}>
                                <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
                                <View style={styles.ratingBadge}>
                                    <Star size={12} color="#f59e0b" fill="#f59e0b" />
                                    <Text style={styles.ratingText}>{shop.rating}</Text>
                                </View>
                            </View>

                            <View style={styles.shopMeta}>
                                <Text style={styles.shopCategory}>{shop.category}</Text>
                                <Text style={styles.dot}>•</Text>
                                <Text style={styles.shopDelivery}>{shop.open ? '20-30 min' : 'Fechado'}</Text>
                                <Text style={styles.dot}>•</Text>
                                <Text style={styles.shopFee}>R$ 4,99</Text>
                            </View>

                            {!shop.open && (
                                <View style={styles.closedOverlay}>
                                    <Text style={styles.closedText}>FECHADO</Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                )) : (
                    <View style={styles.emptyState}>
                        <ShoppingBag size={48} color="#cbd5e1" />
                        <Text style={styles.emptyText}>Nenhuma loja encontrada nesta categoria.</Text>
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
        backgroundColor: '#ffffff', paddingTop: 56, paddingBottom: 16,
        borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 4,
    },
    headerTop: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 20,
    },
    headerTitle: {
        fontSize: 18, fontWeight: '800', color: '#1e293b',
    },
    iconBtn: {
        width: 44, height: 44, borderRadius: 14, backgroundColor: '#f1f5f9',
        alignItems: 'center', justifyContent: 'center',
    },
    searchBar: {
        backgroundColor: '#f1f5f9', borderRadius: 16, flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, height: 50, marginHorizontal: 20, marginBottom: 16,
    },
    searchInput: {
        flex: 1, marginLeft: 10, color: '#1e293b', fontSize: 15, fontWeight: '500',
    },
    categoriesScroll: {
        paddingLeft: 20,
    },
    catFilter: {
        paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9',
        marginRight: 10, borderWidth: 1, borderColor: 'transparent',
    },
    catFilterActive: {
        backgroundColor: '#eff6ff', borderColor: '#1d4ed8',
    },
    catText: {
        fontSize: 14, fontWeight: '600', color: '#64748b',
    },
    catTextActive: {
        color: '#1d4ed8',
    },
    listContainer: {
        padding: 20, paddingBottom: 100,
    },
    shopCard: {
        backgroundColor: '#ffffff', borderRadius: 24, marginBottom: 20, overflow: 'hidden',
        shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 15, elevation: 3,
    },
    shopCover: {
        width: '100%', height: 160,
    },
    shopContent: {
        padding: 16,
    },
    shopHeaderRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4,
    },
    shopName: {
        fontSize: 18, fontWeight: '800', color: '#1e293b', flex: 1,
    },
    ratingBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb',
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
    },
    ratingText: {
        fontSize: 13, fontWeight: '800', color: '#b45309', marginLeft: 4,
    },
    shopMeta: {
        flexDirection: 'row', alignItems: 'center',
    },
    shopCategory: {
        fontSize: 13, color: '#64748b', fontWeight: '500',
    },
    dot: {
        marginHorizontal: 6, color: '#cbd5e1', fontSize: 10,
    },
    shopDelivery: {
        fontSize: 13, color: '#10b981', fontWeight: '700',
    },
    shopFee: {
        fontSize: 13, color: '#1e293b', fontWeight: '600',
    },
    closedOverlay: {
        position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(239, 68, 68, 0.9)',
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    },
    closedText: {
        color: 'white', fontSize: 11, fontWeight: '900',
    },
    emptyState: {
        alignItems: 'center', marginTop: 100,
    },
    emptyText: {
        fontSize: 16, color: '#94a3b8', textAlign: 'center', marginTop: 16, paddingHorizontal: 40,
    },
});
