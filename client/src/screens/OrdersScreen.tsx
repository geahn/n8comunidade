import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, Image, Dimensions } from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../api';

import { ArrowLeft, Clock, MapPin, Loader, CheckCircle, Package, ArrowRight, AlertCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    'pending': { label: 'Aguardando Loja', color: '#f59e0b', bg: '#fffbeb', icon: Clock },
    'accepted': { label: 'Pedido Aceito', color: '#3b82f6', bg: '#eff6ff', icon: CheckCircle },
    'preparing': { label: 'Em Preparo', color: '#8b5cf6', bg: '#f5f3ff', icon: Loader },
    'ready': { label: 'Pronto p/ Entrega', color: '#10b981', bg: '#ecfdf5', icon: Package },
    'out_for_delivery': { label: 'Saiu p/ Entrega', color: '#f97316', bg: '#fff7ed', icon: MapPin },
    'delivered': { label: 'Entregue', color: '#059669', bg: '#ecfdf5', icon: CheckCircle },
    'cancelled': { label: 'Cancelado', color: '#ef4444', bg: '#fef2f2', icon: AlertCircle },
};

export default function OrdersScreen({ navigation }: any) {
    const { token } = useAuth() as any;
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = async () => {
        try {
            // Using localhost as fallback if needed, but keeping the user's IP if provided
            const res = await axios.get(`${API_URL}/api/orders/user`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (token) fetchOrders();
    }, [token]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    return (
        <View style={styles.container}>
            {/* Header Area */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <ArrowLeft size={22} color="#1e293b" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Atividade Recente</Text>
                    <View style={{ width: 44 }} />
                </View>
                <View style={styles.tabs}>
                    <TouchableOpacity style={[styles.tab, styles.tabActive]}>
                        <Text style={[styles.tabText, styles.tabTextActive]}>Meus Pedidos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tab}>
                        <Text style={styles.tabText}>Favoritos</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1d4ed8" />}
                showsVerticalScrollIndicator={false}
            >
                {orders.length === 0 && !loading ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconCircle}>
                            <ShoppingBag size={48} color="#cbd5e1" />
                        </View>
                        <Text style={styles.emptyTitle}>Sua cesta está vazia</Text>
                        <Text style={styles.emptySub}>Que tal explorar as lojas do seu bairro e encontrar algo especial?</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Shops')} style={styles.browseBtn}>
                            <Text style={styles.browseBtnText}>Ver lojas agora</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    orders.map(order => {
                        const statusDef = STATUS_MAP[order.status] || STATUS_MAP['pending'];
                        const StatusIcon = statusDef.icon;
                        const date = new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

                        return (
                            <TouchableOpacity
                                key={order.id}
                                onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
                                activeOpacity={0.9}
                                style={styles.orderCard}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.shopInfo}>
                                        <View style={styles.shopIcon}>
                                            <Package size={20} color="#64748b" />
                                        </View>
                                        <View>
                                            <Text style={styles.shopName}>{order.shop_name}</Text>
                                            <Text style={styles.orderDate}>{date}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: statusDef.bg }]}>
                                        <StatusIcon size={12} color={statusDef.color} strokeWidth={3} />
                                        <Text style={[styles.statusText, { color: statusDef.color }]}>{statusDef.label.toUpperCase()}</Text>
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.cardFooter}>
                                    <Text style={styles.orderSummary}>{order.items_count || 1} item{order.items_count > 1 ? 's' : ''}</Text>
                                    <View style={styles.priceRow}>
                                        <Text style={styles.totalLabel}>Total:</Text>
                                        <Text style={styles.totalPrice}>R$ {parseFloat(order.total_amount).toFixed(2)}</Text>
                                        <ArrowRight size={18} color="#cbd5e1" style={{ marginLeft: 8 }} />
                                    </View>
                                </View>

                                {order.status === 'out_for_delivery' && (
                                    <View style={styles.trackingHint}>
                                        <MapPin size={12} color="#f97316" />
                                        <Text style={styles.trackingText}>Acompanhe o entregador no mapa</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })
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
        backgroundColor: '#ffffff', paddingTop: 56, paddingBottom: 12,
        borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 5,
    },
    headerTop: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 16,
    },
    headerTitle: {
        fontSize: 20, fontWeight: '900', color: '#0f172a',
    },
    iconBtn: {
        width: 44, height: 44, borderRadius: 14, backgroundColor: '#f1f5f9',
        alignItems: 'center', justifyContent: 'center',
    },
    tabs: {
        flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginTop: 8,
    },
    tab: {
        paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20,
    },
    tabActive: {
        backgroundColor: '#eff6ff',
    },
    tabText: {
        fontSize: 14, fontWeight: '700', color: '#94a3b8',
    },
    tabTextActive: {
        color: '#1d4ed8',
    },
    scrollContent: {
        padding: 20, paddingBottom: 120,
    },
    emptyState: {
        alignItems: 'center', marginTop: 80, paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 22, fontWeight: '900', color: '#1e293b', marginBottom: 12,
    },
    emptySub: {
        fontSize: 15, color: '#94a3b8', textAlign: 'center', lineHeight: 22, marginBottom: 32,
    },
    browseBtn: {
        backgroundColor: '#1d4ed8', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 20,
    },
    browseBtnText: {
        color: 'white', fontWeight: '800', fontSize: 16,
    },
    orderCard: {
        backgroundColor: '#ffffff', borderRadius: 28, padding: 20, marginBottom: 16,
        shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16,
    },
    shopInfo: {
        flexDirection: 'row', alignItems: 'center', flex: 1,
    },
    shopIcon: {
        width: 44, height: 44, borderRadius: 16, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', marginRight: 14, borderWidth: 1, borderColor: '#f1f5f9',
    },
    shopName: {
        fontSize: 17, fontWeight: '800', color: '#1e293b',
    },
    orderDate: {
        fontSize: 12, color: '#94a3b8', fontWeight: '500', marginTop: 2,
    },
    statusBadge: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, gap: 6,
    },
    statusText: {
        fontSize: 10, fontWeight: '900', letterSpacing: 0.5,
    },
    divider: {
        height: 1, backgroundColor: '#f1f5f9', marginBottom: 16,
    },
    cardFooter: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    orderSummary: {
        fontSize: 14, color: '#64748b', fontWeight: '600',
    },
    priceRow: {
        flexDirection: 'row', alignItems: 'center',
    },
    totalLabel: {
        fontSize: 13, color: '#94a3b8', fontWeight: '600', marginRight: 6,
    },
    totalPrice: {
        fontSize: 18, fontWeight: '900', color: '#0f172a',
    },
    trackingHint: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff7ed', marginTop: 16, padding: 12, borderRadius: 12, gap: 8,
    },
    trackingText: {
        fontSize: 12, fontWeight: '700', color: '#f97316',
    },
});
