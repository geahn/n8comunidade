import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal, StyleSheet, Dimensions, Switch, ActivityIndicator, RefreshControl } from 'react-native';
import { Package, Plus, Edit3, Trash2, X, ChevronRight, Tag, Users, BellRing, ShoppingBag, TrendingUp, Star, ArrowLeft } from 'lucide-react-native';
import { api } from '../api';

const { width } = Dimensions.get('window');

export default function ShopkeeperPanelScreen({ navigation }: any) {
    const [shop, setShop] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [noShop, setNoShop] = useState(false);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' });
    const [isShopOpen, setIsShopOpen] = useState(true);

    const load = useCallback(async () => {
        try {
            const res = await api.get('/api/shops/mine');
            setShop(res.data.shop);
            setProducts(res.data.products);
            setNoShop(false);
            try {
                const ordersRes = await api.get(`/api/orders/shop/${res.data.shop.id}`);
                setOrders(ordersRes.data);
            } catch { /* pedidos são opcionais no primeiro load */ }
        } catch (e: any) {
            if (e.response?.status === 404) setNoShop(true);
            else console.log('ShopkeeperPanel load error:', e.response?.data || e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
    const todaySales = orders
        .filter(o => o.status === 'delivered' && new Date(o.created_at).toDateString() === new Date().toDateString())
        .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

    const toggleAvailability = async (id: string, current: boolean) => {
        try {
            await api.put(`/api/shops/products/${id}`, { is_available: !current });
            setProducts(p => p.map(prod => prod.id === id ? { ...prod, is_available: !current } : prod));
        } catch (e: any) {
            Alert.alert('Erro', e.response?.data?.message || 'Falha ao atualizar produto');
        }
    };

    const deleteProduct = (id: string) => {
        Alert.alert('Remover produto', 'Tem certeza que deseja excluir este item?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Excluir', style: 'destructive', onPress: async () => {
                    try {
                        await api.delete(`/api/shops/products/${id}`);
                        setProducts(p => p.filter(prod => prod.id !== id));
                    } catch (e: any) {
                        Alert.alert('Erro', e.response?.data?.message || 'Falha ao excluir');
                    }
                }
            }
        ]);
    };

    const addProduct = async () => {
        if (!newProduct.name || !newProduct.price) return Alert.alert('Atenção', 'Preencha o nome e preço do produto.');
        try {
            const res = await api.post('/api/shops/products', {
                shop_id: shop.id,
                name: newProduct.name,
                price: parseFloat(newProduct.price.replace(',', '.')),
                description: newProduct.description || null,
            });
            setProducts(p => [res.data, ...p]);
            setNewProduct({ name: '', price: '', description: '' });
            setShowAddProduct(false);
            Alert.alert('✅ Sucesso', 'Novo produto adicionado ao catálogo.');
        } catch (e: any) {
            Alert.alert('Erro', e.response?.data?.message || 'Falha ao adicionar produto');
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#065f46" />
            </View>
        );
    }

    if (noShop) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
                <Text style={{ fontSize: 40 }}>🏪</Text>
                <Text style={{ fontSize: 20, fontWeight: '900', color: '#0f172a', marginTop: 12, textAlign: 'center' }}>
                    Você ainda não tem loja
                </Text>
                <Text style={{ fontSize: 14, color: '#64748b', marginTop: 8, textAlign: 'center' }}>
                    Solicite a criação da sua loja e aguarde a aprovação do administrador do bairro.
                </Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 24, backgroundColor: '#065f46', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 }}>
                    <Text style={{ color: 'white', fontWeight: '800' }}>Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const shopInfo = shop || {};

    return (
        <View style={styles.container}>
            {/* Premium Green Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <ArrowLeft size={22} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Portal do Parceiro</Text>
                        <Text style={styles.headerSub}>{shopInfo.name}</Text>
                    </View>
                    <TouchableOpacity style={styles.iconBtn}>
                        <BellRing size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.shopStatusRow}>
                    <View style={styles.shopMetaInfo}>
                        <Star size={14} color="#fcd34d" fill="#fcd34d" />
                        <Text style={styles.shopMetaText}>{Number(shopInfo.rating || 0).toFixed(1)}</Text>
                        <View style={styles.metaDivider} />
                        <Text style={styles.shopMetaText}>{shopInfo.status === 'active' ? 'Ativa' : 'Aguardando aprovação'}</Text>
                    </View>
                    <View style={styles.switchContainer}>
                        <Text style={styles.switchLabel}>{isShopOpen ? 'LOJA ABERTA' : 'LOJA FECHADA'}</Text>
                        <Switch
                            value={isShopOpen}
                            onValueChange={setIsShopOpen}
                            trackColor={{ false: '#064e3b', true: '#10b981' }}
                            thumbColor="white"
                        />
                    </View>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Dashboard Stats */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#ecfdf5' }]}>
                            <TrendingUp size={20} color="#059669" />
                        </View>
                        <Text style={styles.statVal}>R$ {todaySales.toFixed(2)}</Text>
                        <Text style={styles.statLabel}>Vendas (Hoje)</Text>
                    </View>
                    <View style={styles.statCard}>
                        <View style={[styles.statIcon, { backgroundColor: '#eff6ff' }]}>
                            <ShoppingBag size={20} color="#1d4ed8" />
                        </View>
                        <Text style={styles.statVal}>{activeOrders.length}</Text>
                        <Text style={styles.statLabel}>Pedidos Ativos</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.actionGrid}>
                    <TouchableOpacity onPress={() => setShowAddProduct(true)} style={[styles.actionBtn, { backgroundColor: '#059669' }]}>
                        <Plus size={24} color="white" />
                        <Text style={styles.actionBtnText}>Novo Item</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Alert.alert('Promoções', 'Em breve: cupons e promoções da loja')} style={[styles.actionBtn, { backgroundColor: '#1d4ed8' }]}>
                        <Tag size={24} color="white" />
                        <Text style={styles.actionBtnText}>Promoções</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Alert.alert('Meus Clientes', 'Em breve painel de CRM')} style={[styles.actionBtn, { backgroundColor: '#7c3aed' }]}>
                        <Users size={24} color="white" />
                        <Text style={styles.actionBtnText}>Fidelidade</Text>
                    </TouchableOpacity>
                </View>

                {/* Product Management */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Gestão de Cardápio</Text>
                        <TouchableOpacity onPress={() => setShowAddProduct(true)}>
                            <Text style={styles.seeMore}>Ver todos</Text>
                        </TouchableOpacity>
                    </View>

                    {products.length === 0 && (
                        <View style={{ alignItems: 'center', padding: 24 }}>
                            <Text style={{ fontSize: 32 }}>📦</Text>
                            <Text style={{ color: '#64748b', fontWeight: '600', marginTop: 8 }}>
                                Nenhum produto ainda — adicione o primeiro!
                            </Text>
                        </View>
                    )}
                    {products.map(product => (
                        <View key={product.id} style={[styles.productCard, !product.is_available && styles.productCardDisabled]}>
                            <View style={[styles.productImage, { backgroundColor: product.is_available ? '#ecfdf5' : '#f1f5f9' }]}>
                                <Package size={24} color={product.is_available ? '#059669' : '#94a3b8'} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Text style={styles.productName}>{product.name}</Text>
                                <Text style={styles.productPrice}>R$ {Number(product.price).toFixed(2)}</Text>
                                {product.description ? (
                                    <Text style={styles.productSales} numberOfLines={1}>{product.description}</Text>
                                ) : null}
                            </View>
                            <View style={styles.productActions}>
                                <TouchableOpacity onPress={() => toggleAvailability(product.id, product.is_available)} style={styles.toggleBtn}>
                                    <View style={[styles.toggleDot, { backgroundColor: product.is_available ? '#10b981' : '#cbd5e1' }]} />
                                    <Text style={[styles.toggleText, { color: product.is_available ? '#059669' : '#64748b' }]}>
                                        {product.is_available ? 'Pausar' : 'Ativar'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => deleteProduct(product.id)} style={styles.deleteBtn}>
                                    <Trash2 size={18} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Store Management Section */}
                <View style={styles.menuCard}>
                    <TouchableOpacity onPress={() => Alert.alert('Configurar Loja', 'Em breve: edição de horários, logotipo e endereço')} style={styles.menuItem}>
                        <View style={[styles.menuIcon, { backgroundColor: '#f0fdf4' }]}>
                            <Edit3 size={20} color="#059669" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.menuLabel}>Configurar Loja</Text>
                            <Text style={styles.menuSub}>Horários, logotipo e endereço</Text>
                        </View>
                        <ChevronRight size={18} color="#cbd5e1" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => Alert.alert('Marketing', 'Solicitar push para o bairro')} style={[styles.menuItem, { borderBottomWidth: 0 }]}>
                        <View style={[styles.menuIcon, { backgroundColor: '#fffbeb' }]}>
                            <BellRing size={20} color="#d97706" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.menuLabel}>Marketing (Notificações)</Text>
                            <Text style={styles.menuSub}>Fale com os moradores do bairro</Text>
                        </View>
                        <ChevronRight size={18} color="#cbd5e1" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Add Product Modal */}
            <Modal visible={showAddProduct} transparent animationType="slide" onRequestClose={() => setShowAddProduct(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Novo Produto</Text>
                            <TouchableOpacity onPress={() => setShowAddProduct(false)}>
                                <X size={22} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            placeholder="Nome do produto"
                            placeholderTextColor="#94a3b8"
                            value={newProduct.name}
                            onChangeText={t => setNewProduct(p => ({ ...p, name: t }))}
                            style={styles.modalInput}
                        />
                        <TextInput
                            placeholder="Preço (ex.: 29,90)"
                            placeholderTextColor="#94a3b8"
                            value={newProduct.price}
                            onChangeText={t => setNewProduct(p => ({ ...p, price: t }))}
                            keyboardType="decimal-pad"
                            style={styles.modalInput}
                        />
                        <TextInput
                            placeholder="Descrição (opcional)"
                            placeholderTextColor="#94a3b8"
                            value={newProduct.description}
                            onChangeText={t => setNewProduct(p => ({ ...p, description: t }))}
                            multiline
                            style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                        />
                        <TouchableOpacity onPress={addProduct} style={styles.modalSubmit}>
                            <Text style={styles.modalSubmitText}>Adicionar ao Cardápio</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: '#f8fafc',
    },
    header: {
        backgroundColor: '#065f46', paddingTop: 56, paddingBottom: 24, borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
    },
    headerTop: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20,
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
        color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700',
    },
    shopStatusRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24,
    },
    shopMetaInfo: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
    },
    shopMetaText: {
        color: 'white', fontSize: 13, fontWeight: '800',
    },
    metaDivider: {
        width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 4,
    },
    switchContainer: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
    },
    switchLabel: {
        color: 'white', fontSize: 11, fontWeight: '900', letterSpacing: 0.5,
    },
    scrollContent: {
        padding: 20, paddingBottom: 100,
    },
    statsGrid: {
        flexDirection: 'row', gap: 16, marginBottom: 24,
    },
    statCard: {
        flex: 1, backgroundColor: 'white', borderRadius: 28, padding: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2,
    },
    statIcon: {
        width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    statVal: {
        fontSize: 20, fontWeight: '900', color: '#0f172a',
    },
    statLabel: {
        fontSize: 12, color: '#94a3b8', fontWeight: '700', marginTop: 2,
    },
    actionGrid: {
        flexDirection: 'row', gap: 12, marginBottom: 32,
    },
    actionBtn: {
        flex: 1, height: 100, borderRadius: 24, alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
    },
    actionBtnText: {
        color: 'white', fontSize: 13, fontWeight: '800',
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18, fontWeight: '900', color: '#0f172a',
    },
    seeMore: {
        color: '#059669', fontSize: 14, fontWeight: '800',
    },
    productCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 24, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 8, elevation: 2,
    },
    productCardDisabled: {
        opacity: 0.6,
    },
    productImage: {
        width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    },
    productName: {
        fontSize: 16, fontWeight: '800', color: '#1e293b',
    },
    productPrice: {
        fontSize: 15, fontWeight: '900', color: '#059669',
    },
    productSales: {
        fontSize: 11, color: '#94a3b8', fontWeight: '600', marginTop: 2,
    },
    productActions: {
        alignItems: 'flex-end', gap: 12,
    },
    toggleBtn: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, gap: 6,
    },
    toggleDot: {
        width: 6, height: 6, borderRadius: 3,
    },
    toggleText: {
        fontSize: 11, fontWeight: '800',
    },
    deleteBtn: {
        padding: 6,
    },
    menuCard: {
        backgroundColor: 'white', borderRadius: 32, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 15, elevation: 3,
    },
    menuItem: {
        flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
    },
    menuIcon: {
        width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 16,
    },
    menuLabel: {
        fontSize: 16, fontWeight: '800', color: '#1e293b',
    },
    menuSub: {
        fontSize: 12, color: '#94a3b8', fontWeight: '500', marginTop: 2,
    },
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(15,23,42,0.5)', justifyContent: 'flex-end',
    },
    modalCard: {
        backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20, fontWeight: '900', color: '#0f172a',
    },
    modalInput: {
        backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
        fontSize: 15, color: '#1e293b', marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9',
    },
    modalSubmit: {
        backgroundColor: '#059669', borderRadius: 18, height: 56, alignItems: 'center', justifyContent: 'center', marginTop: 8,
    },
    modalSubmitText: {
        color: 'white', fontSize: 16, fontWeight: '800',
    },
});
