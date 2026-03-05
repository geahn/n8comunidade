import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, Alert, Switch, Dimensions, StatusBar } from 'react-native';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ArrowLeft, MapPin, Package, Check, Truck, Navigation, TrendingUp, Bell, Circle, ChevronRight, Play } from 'lucide-react-native';

const { width } = Dimensions.get('window');
import { API_URL } from '../api';


export default function DriverPanelScreen({ navigation }: any) {
    const { user, token } = useAuth() as any;
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isOnline, setIsOnline] = useState(false);

    const fetchDriverOrders = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/orders/driver/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (err) {
            console.error('Error fetching driver orders:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDriverOrders();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDriverOrders();
    };

    const handleAcceptDelivery = async (orderId: string) => {
        try {
            await axios.put(`${API_URL}/api/orders/${orderId}/assign-driver`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert('✅ Aceito!', 'Entrega confirmada. Vá até a loja para coletar.');
            fetchDriverOrders();
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível aceitar a entrega.');
        }
    };

    const handleUpdateStatus = async (orderId: string, status: string) => {
        try {
            await axios.put(`${API_URL}/api/orders/${orderId}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchDriverOrders();
        } catch (err) {
            Alert.alert('Erro', 'Ocorreu um problema ao atualizar o status.');
        }
    };

    const availableOrders = orders.filter(o => o.status === 'ready' && !o.driver_id);
    const myDeliveries = orders.filter(o => o.driver_id === user?.id && ['out_for_delivery', 'picked_up'].includes(o.status));

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Immersive Amber Header */}
            <View style={[styles.header, { backgroundColor: isOnline ? '#f59e0b' : '#475569' }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                        <ArrowLeft size={22} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.headerTitle}>Painel do Entregador</Text>
                        <Text style={styles.headerSub}>Bairro Exemplo</Text>
                    </View>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Bell size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.onlineStatusRow}>
                    <View style={styles.onlineBadge}>
                        <View style={[styles.onlineDot, { backgroundColor: isOnline ? '#4ade80' : '#94a3b8' }]} />
                        <Text style={styles.onlineText}>{isOnline ? 'VOCÊ ESTÁ ONLINE' : 'VOCÊ ESTÁ OFFLINE'}</Text>
                    </View>
                    <Switch
                        value={isOnline}
                        onValueChange={setIsOnline}
                        trackColor={{ false: '#334155', true: '#fbbf24' }}
                        thumbColor="white"
                    />
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
            >
                {/* Driver Stats */}
                {isOnline && (
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <TrendingUp size={20} color="#f59e0b" />
                            <Text style={styles.statVal}>R$ 84,50</Text>
                            <Text style={styles.statLabel}>Ganhos hoje</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Truck size={20} color="#10b981" />
                            <Text style={styles.statVal}>6</Text>
                            <Text style={styles.statLabel}>Entregas</Text>
                        </View>
                    </View>
                )}

                {!isOnline && (
                    <View style={styles.offlinePlaceholder}>
                        <View style={styles.offlineIcon}>
                            <Truck size={48} color="#94a3b8" />
                        </View>
                        <Text style={styles.offlineTitle}>Pronto para rodar?</Text>
                        <Text style={styles.offlineSub}>Fique online para começar a receber chamados de entregas próximos a você.</Text>
                        <TouchableOpacity onPress={() => setIsOnline(true)} style={styles.onlineBtn}>
                            <Play size={20} color="white" fill="white" />
                            <Text style={styles.onlineBtnText}>Ficar Online Agora</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Active Deliveries */}
                {myDeliveries.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Em Rota 🛵</Text>
                        {myDeliveries.map(order => (
                            <View key={order.id} style={styles.activeOrderCard}>
                                <View style={styles.activeOrderHeader}>
                                    <View>
                                        <Text style={styles.orderId}>PEDIDO #{order.id.slice(0, 5).toUpperCase()}</Text>
                                        <Text style={styles.shopName}>{order.shop_name || 'Loja Parceira'}</Text>
                                    </View>
                                    <View style={styles.priceBadge}>
                                        <Text style={styles.priceText}>R$ {parseFloat(order.delivery_fee || 0).toFixed(2)}</Text>
                                    </View>
                                </View>

                                <View style={styles.addressBox}>
                                    <MapPin size={16} color="#ef4444" />
                                    <Text style={styles.addressText} numberOfLines={2}>{order.delivery_address}</Text>
                                </View>

                                <View style={styles.activeActions}>
                                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#eff6ff' }]}>
                                        <Navigation size={18} color="#1d4ed8" />
                                        <Text style={[styles.actionBtnText, { color: '#1d4ed8' }]}>GPS</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleUpdateStatus(order.id, 'delivered')}
                                        style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
                                    >
                                        <Check size={18} color="white" />
                                        <Text style={[styles.actionBtnText, { color: 'white' }]}>Entregue</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Available Orders */}
                {isOnline && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Entregas Disponíveis</Text>
                            <View style={styles.livePulse}>
                                <View style={styles.pulseDot} />
                                <Text style={styles.liveText}>AO VIVO</Text>
                            </View>
                        </View>

                        {availableOrders.length === 0 ? (
                            <View style={styles.emptyAvailable}>
                                <Package size={32} color="#cbd5e1" />
                                <Text style={styles.emptyAvailableText}>Buscando as melhores rotas para você...</Text>
                            </View>
                        ) : (
                            availableOrders.map(order => (
                                <TouchableOpacity key={order.id} onPress={() => handleAcceptDelivery(order.id)} style={styles.availableCard}>
                                    <View style={styles.availableMain}>
                                        <View style={styles.availableInfo}>
                                            <Text style={styles.availableShop}>{order.shop_name || 'Loja Parceira'}</Text>
                                            <Text style={styles.availableDist}>~1.2 km de distância</Text>
                                        </View>
                                        <Text style={styles.availablePrice}>R$ {parseFloat(order.delivery_fee || 0).toFixed(2)}</Text>
                                    </View>
                                    <View style={styles.availableFooter}>
                                        <Text style={styles.availableAddress} numberOfLines={1}>{order.delivery_address}</Text>
                                        <ChevronRight size={18} color="#cbd5e1" />
                                    </View>
                                </TouchableOpacity>
                            ))
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
        paddingTop: 56, paddingBottom: 24, borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
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
        color: 'white', fontSize: 18, fontWeight: '900',
    },
    headerSub: {
        color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '700',
    },
    onlineStatusRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24,
    },
    onlineBadge: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 8,
    },
    onlineDot: {
        width: 8, height: 8, borderRadius: 4,
    },
    onlineText: {
        color: 'white', fontSize: 11, fontWeight: '900', letterSpacing: 0.5,
    },
    scrollContent: {
        padding: 20, paddingBottom: 100,
    },
    statsGrid: {
        flexDirection: 'row', gap: 16, marginBottom: 24,
    },
    statCard: {
        flex: 1, backgroundColor: 'white', borderRadius: 28, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2,
    },
    statVal: {
        fontSize: 20, fontWeight: '900', color: '#0f172a', marginTop: 8,
    },
    statLabel: {
        fontSize: 12, color: '#94a3b8', fontWeight: '700', marginTop: 2,
    },
    offlinePlaceholder: {
        alignItems: 'center', backgroundColor: 'white', borderRadius: 32, padding: 32, marginTop: 40, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 5,
    },
    offlineIcon: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    },
    offlineTitle: {
        fontSize: 22, fontWeight: '900', color: '#0f172a', marginBottom: 8,
    },
    offlineSub: {
        fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 22, marginBottom: 32,
    },
    onlineBtn: {
        backgroundColor: '#f59e0b', paddingHorizontal: 32, paddingVertical: 18, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#f59e0b', shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
    },
    onlineBtnText: {
        color: 'white', fontWeight: '900', fontSize: 16,
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
    livePulse: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4,
    },
    pulseDot: {
        width: 6, height: 6, borderRadius: 3, backgroundColor: '#ef4444',
    },
    liveText: {
        fontSize: 10, fontWeight: '900', color: '#ef4444',
    },
    activeOrderCard: {
        backgroundColor: 'white', borderRadius: 28, padding: 20, borderWidth: 2, borderColor: '#f59e0b', shadowColor: '#f59e0b', shadowOpacity: 0.05, shadowRadius: 10, elevation: 4,
    },
    activeOrderHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16,
    },
    orderId: {
        fontSize: 11, fontWeight: '900', color: '#f59e0b', letterSpacing: 1,
    },
    shopName: {
        fontSize: 18, fontWeight: '900', color: '#0f172a', marginTop: 2,
    },
    priceBadge: {
        backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
    },
    priceText: {
        color: 'white', fontWeight: '900', fontSize: 15,
    },
    addressBox: {
        flexDirection: 'row', backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, gap: 10, marginBottom: 20,
    },
    addressText: {
        flex: 1, fontSize: 14, color: '#475569', fontWeight: '600', lineHeight: 20,
    },
    activeActions: {
        flexDirection: 'row', gap: 12,
    },
    actionBtn: {
        flex: 1, height: 56, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    },
    actionBtnText: {
        fontSize: 15, fontWeight: '800',
    },
    emptyAvailable: {
        alignItems: 'center', paddingVertical: 40, backgroundColor: 'white', borderRadius: 24, gap: 12,
    },
    emptyAvailableText: {
        color: '#94a3b8', fontSize: 14, fontWeight: '600', textAlign: 'center', paddingHorizontal: 40,
    },
    availableCard: {
        backgroundColor: 'white', borderRadius: 24, padding: 20, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 8, elevation: 2,
    },
    availableMain: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
    },
    availableInfo: {
        flex: 1,
    },
    availableShop: {
        fontSize: 16, fontWeight: '800', color: '#1e293b',
    },
    availableDist: {
        fontSize: 12, color: '#94a3b8', fontWeight: '600', marginTop: 2,
    },
    availablePrice: {
        fontSize: 20, fontWeight: '900', color: '#10b981',
    },
    availableFooter: {
        flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 16,
    },
    availableAddress: {
        flex: 1, fontSize: 13, color: '#64748b', fontWeight: '500',
    },
});
