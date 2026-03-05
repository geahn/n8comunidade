import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Alert, Modal, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import { ArrowLeft, Trash2, ShoppingCart, ArrowRight, MapPin, ChevronRight, Plus, X, Home, Briefcase, Map, Search, ShoppingBag, CreditCard, Banknote } from 'lucide-react-native';
import { useCart } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../api';


const { width } = Dimensions.get('window');

interface Address {
    id: string;
    title: string;
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    reference: string;
}

export default function CartScreen({ navigation }: any) {
    const { items, shopName, totalAmount, totalItems, removeFromCart, clearCart } = useCart();
    const { token, user } = useAuth() as any;

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'CASH'>('CARD');
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const [form, setForm] = useState({ title: 'Casa', cep: '', street: '', number: '', complement: '', neighborhood: '', reference: '' });
    const [loadingCep, setLoadingCep] = useState(false);

    const selectedAddress = addresses.find(a => a.id === selectedAddressId);

    const searchCep = async (cep: string) => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) return;
        setLoadingCep(true);
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
            if (response.data && !response.data.erro) {
                setForm(prev => ({
                    ...prev,
                    street: response.data.logradouro || '',
                    neighborhood: response.data.bairro || '',
                    complement: response.data.complemento || '',
                }));
            }
        } catch (_) { } finally { setLoadingCep(false); }
    };

    const handleCheckout = async () => {
        if (!selectedAddressId) {
            Alert.alert('Endereço ausente', 'Por favor, selecione onde deseja receber seu pedido.');
            setShowAddressModal(true);
            return;
        }

        setIsCheckingOut(true);
        try {
            const addr = selectedAddress;
            const fullAddress = `${addr?.street}, ${addr?.number}${addr?.complement ? ' - ' + addr.complement : ''}. ${addr?.neighborhood}. CEP: ${addr?.cep}`;

            const payload = {
                shop_id: items[0].shopId,
                items: items.map(item => ({
                    product_id: item.productId,
                    quantity: item.quantity,
                    special_instructions: item.notes || ''
                })),
                delivery_address: fullAddress,
                delivery_fee: 0,
                payment_method: paymentMethod === 'CARD' ? 'CARTAO' : 'DINHEIRO',
                notes: 'Pedido via App n8'
            };

            await axios.post(`${API_URL}/api/orders`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert('✅ Tudo pronto!', 'Seu pedido foi enviado para a loja.');
            clearCart();
            navigation.navigate('Orders');
        } catch (err) {
            Alert.alert('Erro no checkout', 'Não conseguimos processar seu pedido agora.');
        } finally {
            setIsCheckingOut(false);
        }
    };

    if (items.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.absoluteBack}>
                    <ArrowLeft size={22} color="#1e293b" />
                </TouchableOpacity>
                <View style={styles.emptyIconCircle}>
                    <ShoppingBag size={48} color="#cbd5e1" />
                </View>
                <Text style={styles.emptyTitle}>Sua sacola está vazia</Text>
                <Text style={styles.emptySub}>Você ainda não adicionou itens. Explore as lojas próximas para começar.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.browseBtn}>
                    <Text style={styles.browseBtnText}>Explorar lojas</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Premium Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                    <ArrowLeft size={22} color="#1e293b" />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>Minha Sacola</Text>
                    <Text style={styles.headerSub}>{shopName}</Text>
                </View>
                <TouchableOpacity onPress={clearCart} style={[styles.iconBtn, { backgroundColor: '#fef2f2' }]}>
                    <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Delivery Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Endereço de Entrega</Text>
                    <TouchableOpacity onPress={() => setShowAddressModal(true)} style={styles.addressCard}>
                        <View style={styles.addressIcon}>
                            <MapPin size={22} color="#1d4ed8" />
                        </View>
                        <View style={{ flex: 1 }}>
                            {selectedAddress ? (
                                <>
                                    <Text style={styles.addressTitle}>{selectedAddress.title}</Text>
                                    <Text style={styles.addressText} numberOfLines={1}>{selectedAddress.street}, {selectedAddress.number}</Text>
                                </>
                            ) : (
                                <Text style={styles.addressTitle}>Selecione o endereço</Text>
                            )}
                        </View>
                        <ChevronRight size={18} color="#cbd5e1" />
                    </TouchableOpacity>
                </View>

                {/* Items List */}
                <View style={[styles.section, { marginTop: 24 }]}>
                    <Text style={styles.sectionHeader}>Itens do Pedido</Text>
                    {items.map(item => (
                        <View key={item.id} style={styles.itemRow}>
                            <View style={styles.itemQtyBadge}>
                                <Text style={styles.itemQty}>{item.quantity}x</Text>
                            </View>
                            <View style={{ flex: 1, marginLeft: 16 }}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                {item.notes ? <Text style={styles.itemNotes}>{item.notes}</Text> : null}
                                <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeBtn}>
                                    <Text style={styles.removeText}>Remover</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.itemPrice}>R$ {(item.price * item.quantity).toFixed(2)}</Text>
                        </View>
                    ))}
                </View>

                {/* Payment Method */}
                <View style={[styles.section, { marginTop: 24 }]}>
                    <Text style={styles.sectionHeader}>Forma de Pagamento</Text>
                    <View style={styles.paymentRow}>
                        <TouchableOpacity
                            onPress={() => setPaymentMethod('CARD')}
                            style={[styles.paymentBtn, paymentMethod === 'CARD' && styles.paymentBtnActive]}
                        >
                            <CreditCard size={18} color={paymentMethod === 'CARD' ? '#1d4ed8' : '#64748b'} />
                            <Text style={[styles.paymentText, paymentMethod === 'CARD' && styles.paymentTextActive]}>Cartão</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setPaymentMethod('CASH')}
                            style={[styles.paymentBtn, paymentMethod === 'CASH' && styles.paymentBtnActive]}
                        >
                            <Banknote size={18} color={paymentMethod === 'CASH' ? '#1d4ed8' : '#64748b'} />
                            <Text style={[styles.paymentText, paymentMethod === 'CASH' && styles.paymentTextActive]}>Dinheiro</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Summary */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryVal}>R$ {totalAmount.toFixed(2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Taxa de Entrega</Text>
                        <Text style={styles.summaryFree}>Grátis</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalVal}>R$ {totalAmount.toFixed(2)}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Finalize */}
            <View style={styles.footer}>
                <TouchableOpacity
                    onPress={handleCheckout}
                    disabled={isCheckingOut}
                    style={styles.checkoutBtn}
                >
                    {isCheckingOut ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text style={styles.checkoutText}>Finalizar Pedido</Text>
                            <ArrowRight size={20} color="white" />
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Address Selection Modal */}
            <Modal visible={showAddressModal} animationType="slide" transparent>
                <TouchableOpacity activeOpacity={1} onPress={() => setShowAddressModal(false)} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalDrag} />
                        <Text style={styles.modalTitle}>Onde entregar?</Text>
                        {addresses.length === 0 ? (
                            <TouchableOpacity onPress={() => { setShowAddressModal(false); setShowFormModal(true); }} style={styles.addFirstBtn}>
                                <Plus size={24} color="#1d4ed8" />
                                <Text style={styles.addFirstText}>Adicionar primeiro endereço</Text>
                            </TouchableOpacity>
                        ) : (
                            addresses.map(addr => (
                                <TouchableOpacity
                                    key={addr.id}
                                    onPress={() => { setSelectedAddressId(addr.id); setShowAddressModal(false); }}
                                    style={[styles.addrItem, selectedAddressId === addr.id && styles.addrItemActive]}
                                >
                                    <View style={[styles.addrIcon, selectedAddressId === addr.id && styles.addrIconActive]}>
                                        <Home size={20} color={selectedAddressId === addr.id ? 'white' : '#64748b'} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.addrName}>{addr.title}</Text>
                                        <Text style={styles.addrLoc} numberOfLines={1}>{addr.street}, {addr.number}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                        <TouchableOpacity onPress={() => { setShowAddressModal(false); setShowFormModal(true); }} style={styles.addNewBtn}>
                            <Text style={styles.addNewText}>Novo endereço</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: '#f8fafc',
    },
    header: {
        backgroundColor: '#ffffff', paddingTop: 56, paddingBottom: 16, borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 5,
    },
    headerInfo: {
        flex: 1, alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18, fontWeight: '900', color: '#0f172a',
    },
    headerSub: {
        fontSize: 12, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase',
    },
    iconBtn: {
        width: 44, height: 44, borderRadius: 14, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center',
    },
    scrollContent: {
        padding: 20, paddingBottom: 120,
    },
    section: {
        marginBottom: 8,
    },
    sectionHeader: {
        fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 16,
    },
    addressCard: {
        backgroundColor: 'white', borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center',
        shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10, elevation: 2,
    },
    addressIcon: {
        width: 44, height: 44, borderRadius: 14, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 16,
    },
    addressTitle: {
        fontSize: 15, fontWeight: '800', color: '#1e293b',
    },
    addressText: {
        fontSize: 13, color: '#94a3b8', fontWeight: '500', marginTop: 2,
    },
    itemRow: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 24, padding: 16, marginBottom: 12,
    },
    itemQtyBadge: {
        width: 40, height: 40, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center',
    },
    itemQty: {
        fontSize: 15, fontWeight: '800', color: '#1d4ed8',
    },
    itemName: {
        fontSize: 15, fontWeight: '700', color: '#1e293b',
    },
    itemNotes: {
        fontSize: 12, color: '#94a3b8', marginTop: 2, fontStyle: 'italic',
    },
    itemPrice: {
        fontSize: 15, fontWeight: '800', color: '#0f172a',
    },
    removeBtn: {
        marginTop: 6,
    },
    removeText: {
        fontSize: 12, color: '#ef4444', fontWeight: '700',
    },
    paymentRow: {
        flexDirection: 'row', gap: 12,
    },
    paymentBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 16, backgroundColor: '#f1f5f9', gap: 8,
    },
    paymentBtnActive: {
        backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#1d4ed8',
    },
    paymentText: {
        fontSize: 14, fontWeight: '700', color: '#64748b',
    },
    paymentTextActive: {
        color: '#1d4ed8',
    },
    summaryCard: {
        marginTop: 32, backgroundColor: 'white', borderRadius: 32, padding: 24,
    },
    summaryRow: {
        flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12,
    },
    summaryLabel: {
        fontSize: 15, color: '#94a3b8', fontWeight: '600',
    },
    summaryVal: {
        fontSize: 15, color: '#1e293b', fontWeight: '700',
    },
    summaryFree: {
        fontSize: 15, color: '#10b981', fontWeight: '800',
    },
    summaryDivider: {
        height: 1, backgroundColor: '#f1f5f9', marginVertical: 16,
    },
    totalLabel: {
        fontSize: 20, fontWeight: '900', color: '#0f172a',
    },
    totalVal: {
        fontSize: 24, fontWeight: '900', color: '#1d4ed8',
    },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 40, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#f1f5f9',
    },
    checkoutBtn: {
        backgroundColor: '#1d4ed8', borderRadius: 24, height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    },
    checkoutText: {
        color: 'white', fontSize: 18, fontWeight: '800',
    },
    emptyContainer: {
        flex: 1, backgroundColor: '#f8fafc', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40,
    },
    absoluteBack: {
        position: 'absolute', top: 56, left: 20, width: 44, height: 44, borderRadius: 14, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
    },
    emptyIconCircle: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 22, fontWeight: '900', color: '#1e293b', marginBottom: 8,
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
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(2,6,23,0.5)', justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 24, paddingBottom: 60,
    },
    modalDrag: {
        width: 48, height: 5, backgroundColor: '#e2e8f0', borderRadius: 3, alignSelf: 'center', marginBottom: 24,
    },
    modalTitle: {
        fontSize: 24, fontWeight: '900', color: '#0f172a', marginBottom: 24,
    },
    addrItem: {
        flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, marginBottom: 12, backgroundColor: '#f8fafc',
    },
    addrItemActive: {
        backgroundColor: '#eff6ff', borderWidth: 2, borderColor: '#1d4ed8',
    },
    addrIcon: {
        width: 48, height: 48, borderRadius: 16, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', marginRight: 16,
    },
    addrIconActive: {
        backgroundColor: '#1d4ed8',
    },
    addrName: {
        fontSize: 17, fontWeight: '800', color: '#1e293b',
    },
    addrLoc: {
        fontSize: 13, color: '#94a3b8', fontWeight: '500',
    },
    addNewBtn: {
        marginTop: 12, paddingVertical: 16, alignItems: 'center',
    },
    addNewText: {
        color: '#1d4ed8', fontSize: 16, fontWeight: '800',
    },
    addFirstBtn: {
        padding: 40, borderRadius: 32, borderStyle: 'dashed', borderWidth: 2, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center', gap: 12,
    },
    addFirstText: {
        fontSize: 16, fontWeight: '800', color: '#1d4ed8',
    },
});
