import React, { useState, useRef } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Image,
    Dimensions, Linking, StyleSheet, Alert, Modal, TextInput, Share, Animated, StatusBar
} from 'react-native';
import { ArrowLeft, Phone, MessageCircle, MapPin, Star, Share2, Plus, Minus, ShoppingCart, X, Camera, Truck, ChevronRight } from 'lucide-react-native';
import { pickAndUploadBanner, pickAndUploadLogo } from '../services/imageUpload';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');
const SCREEN_WIDTH = Math.min(width, 1400);
const COVER_HEIGHT = 200;
const HEADER_MIN_HEIGHT = 90;

const PRODUCT_OPTIONS: Record<string, { group: string; type: 'single' | 'multi'; options: string[] }[]> = {
    'Restaurante': [
        { group: 'Ponto da carne', type: 'single', options: ['Ao ponto', 'Mal passado', 'Bem passado'] },
        { group: 'Adicionais', type: 'multi', options: ['Bacon extra (+R$3)', 'Queijo extra (+R$2.50)', 'Ovo (+R$1.50)', 'Molho especial (+R$1)'] },
    ],
    'Sorveteria': [
        { group: 'Tamanho', type: 'single', options: ['P - 300ml', 'M - 500ml (+R$5)', 'G - 1L (+R$12)'] },
        { group: 'Coberturas', type: 'multi', options: ['Granola', 'Banana', 'Morango (+R$2)', 'Nutella (+R$4)'] },
    ],
};

function ProductModal({ product, shop, visible, onClose }: { product: any; shop: any; visible: boolean; onClose: () => void }) {
    const { addToCart } = useCart();
    const [singleSelections, setSingleSelections] = useState<Record<string, string>>({});
    const [multiSelections, setMultiSelections] = useState<Record<string, string[]>>({});
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');

    const optionGroups = PRODUCT_OPTIONS[shop.category] || [];

    const toggleSingle = (group: string, option: string) => setSingleSelections(p => ({ ...p, [group]: option }));
    const toggleMulti = (group: string, option: string) => {
        setMultiSelections(p => {
            const current = p[group] || [];
            return {
                ...p,
                [group]: current.includes(option) ? current.filter(o => o !== option) : [...current, option]
            };
        });
    };

    const getOptionPrice = (optionStr: string) => {
        const match = optionStr.match(/\(\+R\$\s*([\d,.]+)\)/);
        return match ? parseFloat(match[1].replace(',', '.')) : 0;
    };

    let totalExtras = 0;
    Object.values(multiSelections).flat().forEach(opt => totalExtras += getOptionPrice(opt));
    Object.values(singleSelections).forEach(opt => totalExtras += getOptionPrice(opt));

    const totalPrice = (product?.price + totalExtras) * quantity;

    const handleAddToCart = () => {
        addToCart({
            productId: product.id,
            name: product.name,
            price: product.price + totalExtras,
            quantity,
            shopId: shop.id,
            shopName: shop.name,
            imageUrl: product.image_url,
            selections: { ...singleSelections, ...multiSelections },
            notes
        });
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {product?.image_url ? (
                            <Image source={{ uri: product.image_url }} style={styles.modalCover} />
                        ) : (
                            <View style={[styles.modalCover, { backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }]}>
                                <Text style={{ fontSize: 64 }}>🍔</Text>
                            </View>
                        )}

                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <X size={20} color="white" />
                        </TouchableOpacity>

                        <View style={{ padding: 24 }}>
                            <Text style={styles.modalTitle}>{product?.name}</Text>
                            <Text style={styles.modalDesc}>{product?.description}</Text>
                            <Text style={styles.modalPrice}>R$ {product?.price?.toFixed(2)}</Text>

                            {optionGroups.map(group => (
                                <View key={group.group} style={{ marginBottom: 24 }}>
                                    <View style={styles.groupHeader}>
                                        <Text style={styles.groupTitle}>{group.group}</Text>
                                        <Text style={styles.groupBadge}>{group.type === 'single' ? 'OBRIGATÓRIO' : 'OPCIONAL'}</Text>
                                    </View>
                                    {group.options.map(option => {
                                        const isSelected = group.type === 'single'
                                            ? singleSelections[group.group] === option
                                            : (multiSelections[group.group] || []).includes(option);
                                        return (
                                            <TouchableOpacity key={option}
                                                onPress={() => group.type === 'single' ? toggleSingle(group.group, option) : toggleMulti(group.group, option)}
                                                style={styles.optionRow}>
                                                <Text style={[styles.optionText, isSelected && styles.optionTextActive]}>{option}</Text>
                                                <View style={[styles.radio, isSelected && styles.radioActive]}>
                                                    {isSelected && <View style={styles.radioInner} />}
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            ))}

                            <View style={{ marginBottom: 30 }}>
                                <Text style={styles.groupTitle}>Alguma observação?</Text>
                                <TextInput
                                    placeholder="Ex: Tirar cebola, maionese à parte..."
                                    style={styles.notesInput}
                                    multiline
                                    value={notes}
                                    onChangeText={setNotes}
                                />
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <View style={styles.qtyContainer}>
                            <TouchableOpacity onPress={() => setQuantity(q => Math.max(1, q - 1))} style={styles.qtyBtn}>
                                <Minus size={18} color="#1d4ed8" />
                            </TouchableOpacity>
                            <Text style={styles.qtyText}>{quantity}</Text>
                            <TouchableOpacity onPress={() => setQuantity(q => q + 1)} style={styles.qtyBtn}>
                                <Plus size={18} color="#1d4ed8" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={handleAddToCart} style={styles.addBtn}>
                            <Text style={styles.addBtnText}>Adicionar • R$ {totalPrice.toFixed(2)}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default function ShopDetailScreen({ route, navigation }: any) {
    const { shop } = route.params;
    const { items } = useCart();
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [coverUrl, setCoverUrl] = useState(shop.cover_url);
    const [logoUrl, setLogoUrl] = useState(shop.logo_url);

    const scrollY = useRef(new Animated.Value(0)).current;

    const totalCartItems = items.reduce((sum, item) => sum + item.quantity, 0);

    const headerOpacity = scrollY.interpolate({
        inputRange: [100, 160],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const coverScale = scrollY.interpolate({
        inputRange: [-200, 0],
        outputRange: [2, 1],
        extrapolate: 'clamp',
    });

    return (
        <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Floating Header */}
            <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                    <ArrowLeft size={20} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{shop.name}</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.headerBtn}>
                    <ShoppingCart size={20} color="#1e293b" />
                    {totalCartItems > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{totalCartItems}</Text></View>}
                </TouchableOpacity>
            </Animated.View>

            {/* Back Button (Floating on images) */}
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.headerBtn, styles.absoluteBack]}>
                <ArrowLeft size={20} color="white" />
            </TouchableOpacity>

            <Animated.ScrollView
                scrollEventThrottle={16}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Section */}
                <Animated.View style={{ height: COVER_HEIGHT, transform: [{ scale: coverScale }] }}>
                    <Image source={{ uri: coverUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80' }} style={styles.coverImage} />
                    <View style={styles.coverOverlay} />
                </Animated.View>

                <View style={styles.shopContent}>
                    <View style={styles.logoRow}>
                        <View style={styles.logoContainer}>
                            <Image source={{ uri: logoUrl || 'https://via.placeholder.com/150' }} style={styles.logo} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <Text style={styles.name}>{shop.name}</Text>
                            <View style={styles.metaRow}>
                                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                                <Text style={styles.rating}>{shop.rating}</Text>
                                <Text style={styles.dot}>•</Text>
                                <Text style={styles.category}>{shop.category}</Text>
                            </View>
                        </View>
                        {shop.open && <View style={styles.openBadge}><Text style={styles.openText}>ABERTO</Text></View>}
                    </View>

                    <Text style={styles.description}>{shop.description}</Text>

                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`https://wa.me/55${shop.phone?.replace(/\D/g, '')}`)}>
                            <MessageCircle size={20} color="#1d4ed8" />
                            <Text style={styles.actionText}>WhatsApp</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn} onPress={() => Linking.openURL(`tel:${shop.phone?.replace(/\D/g, '')}`)}>
                            <Phone size={20} color="#1d4ed8" />
                            <Text style={styles.actionText}>Ligar</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Products Grid/List */}
                    <Text style={styles.sectionTitle}>Cardápio</Text>
                    {shop.products?.map((p: any) => (
                        <TouchableOpacity key={p.id} style={styles.pCard} activeOpacity={0.8} onPress={() => setSelectedProduct(p)}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.pName}>{p.name}</Text>
                                <Text style={styles.pDesc} numberOfLines={2}>{p.description}</Text>
                                <Text style={styles.pPrice}>R$ {p.price?.toFixed(2)}</Text>
                            </View>
                            <Image source={{ uri: p.image_url || 'https://via.placeholder.com/150' }} style={styles.pImage} />
                        </TouchableOpacity>
                    ))}
                </View>
            </Animated.ScrollView>

            {/* Mini Cart Bar (Dynamic) */}
            {totalCartItems > 0 && (
                <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.footerCart}>
                    <View style={styles.footerInfo}>
                        <Text style={styles.footerCount}>{totalCartItems} itens</Text>
                        <Text style={styles.footerTotal}>R$ {items.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)}</Text>
                    </View>
                    <View style={styles.footerAction}>
                        <Text style={styles.footerBtnText}>Ir para cesta</Text>
                        <ShoppingBag size={20} color="white" />
                    </View>
                </TouchableOpacity>
            )}

            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    shop={shop}
                    visible={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        position: 'absolute', top: 0, left: 0, right: 0, height: HEADER_MIN_HEIGHT,
        paddingTop: 45, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, zIndex: 100, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
    },
    headerBtn: {
        width: 44, height: 44, borderRadius: 14, backgroundColor: '#f8fafc',
        alignItems: 'center', justifyContent: 'center',
    },
    absoluteBack: {
        position: 'absolute', top: 45, left: 16, zIndex: 110, backgroundColor: 'rgba(0,0,0,0.3)',
    },
    headerTitle: {
        flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '800', color: '#1e293b',
    },
    badge: {
        position: 'absolute', top: 5, right: 5, backgroundColor: '#ef4444',
        width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center',
    },
    badgeText: {
        color: 'white', fontSize: 10, fontWeight: '900',
    },
    coverImage: {
        width: '100%', height: '100%',
    },
    coverOverlay: {
        ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.15)',
    },
    shopContent: {
        backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32,
        marginTop: -32, padding: 24, paddingBottom: 100,
    },
    logoRow: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 16,
    },
    logoContainer: {
        width: 90, height: 90, borderRadius: 24, padding: 4, backgroundColor: 'white',
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, marginTop: -60,
    },
    logo: {
        width: '100%', height: '100%', borderRadius: 20,
    },
    name: {
        fontSize: 24, fontWeight: '900', color: '#0f172a',
    },
    metaRow: {
        flexDirection: 'row', alignItems: 'center', marginTop: 4,
    },
    rating: {
        fontSize: 14, fontWeight: '800', color: '#f59e0b', marginLeft: 4,
    },
    dot: {
        marginHorizontal: 8, color: '#cbd5e1',
    },
    category: {
        fontSize: 14, color: '#64748b', fontWeight: '600',
    },
    openBadge: {
        backgroundColor: '#dcfce7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    },
    openText: {
        fontSize: 10, fontWeight: '900', color: '#16a34a',
    },
    description: {
        fontSize: 15, color: '#64748b', lineHeight: 24, marginBottom: 24,
    },
    actions: {
        flexDirection: 'row', gap: 12, marginBottom: 32,
    },
    actionBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 14, borderRadius: 20, backgroundColor: '#eff6ff',
    },
    actionText: {
        fontSize: 14, fontWeight: '800', color: '#1d4ed8', marginLeft: 8,
    },
    sectionTitle: {
        fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 20,
    },
    pCard: {
        flexDirection: 'row', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
    },
    pName: {
        fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 4,
    },
    pDesc: {
        fontSize: 13, color: '#64748b', marginBottom: 8, lineHeight: 18,
    },
    pPrice: {
        fontSize: 16, fontWeight: '800', color: '#10b981',
    },
    pImage: {
        width: 100, height: 100, borderRadius: 20, marginLeft: 16,
    },
    footerCart: {
        position: 'absolute', bottom: 30, left: 20, right: 20,
        backgroundColor: '#1d4ed8', borderRadius: 24, padding: 16,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        shadowColor: '#1d4ed8', shadowOpacity: 0.3, shadowRadius: 15, elevation: 10,
    },
    footerInfo: {
        flex: 1,
    },
    footerCount: {
        color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600',
    },
    footerTotal: {
        color: 'white', fontSize: 18, fontWeight: '900',
    },
    footerAction: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
    },
    footerBtnText: {
        color: 'white', fontSize: 16, fontWeight: '800',
    },
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(2,6,23,0.7)', justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, maxHeight: '90%',
    },
    modalCover: {
        width: '100%', height: 240, borderTopLeftRadius: 40, borderTopRightRadius: 40,
    },
    closeBtn: {
        position: 'absolute', top: 20, right: 20, width: 40, height: 40,
        borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 24, fontWeight: '900', color: '#0f172a', marginBottom: 8,
    },
    modalDesc: {
        fontSize: 15, color: '#64748b', lineHeight: 22, marginBottom: 12,
    },
    modalPrice: {
        fontSize: 22, fontWeight: '900', color: '#10b981', marginBottom: 20,
    },
    groupHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
    },
    groupTitle: {
        fontSize: 17, fontWeight: '800', color: '#1e293b',
    },
    groupBadge: {
        fontSize: 10, fontWeight: '900', color: '#64748b', backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
    },
    optionRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f8fafc',
    },
    optionText: {
        flex: 1, fontSize: 15, color: '#334155', fontWeight: '500',
    },
    optionTextActive: {
        color: '#1d4ed8', fontWeight: '700',
    },
    radio: {
        width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center',
    },
    radioActive: {
        borderColor: '#1d4ed8',
    },
    radioInner: {
        width: 10, height: 10, borderRadius: 5, backgroundColor: '#1d4ed8',
    },
    notesInput: {
        backgroundColor: '#f8fafc', borderRadius: 20, padding: 16, minHeight: 80, fontSize: 14, color: '#1e293b', textAlignVertical: 'top', marginTop: 12,
    },
    modalFooter: {
        padding: 24, paddingBottom: 40, borderTopWidth: 1, borderTopColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', gap: 16,
    },
    qtyContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', borderRadius: 20, padding: 6,
    },
    qtyBtn: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center',
    },
    qtyText: {
        fontSize: 18, fontWeight: '800', color: '#1d4ed8', marginHorizontal: 16,
    },
    addBtn: {
        flex: 1, backgroundColor: '#1d4ed8', borderRadius: 24, paddingVertical: 18, alignItems: 'center',
    },
    addBtnText: {
        color: 'white', fontSize: 16, fontWeight: '800',
    },
});
